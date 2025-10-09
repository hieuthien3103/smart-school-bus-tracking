const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const { testConnection } = require('./config/database');
require('dotenv').config();

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: process.env.CORS_ORIGIN || "http://localhost:5173",
    methods: ["GET", "POST"],
    credentials: true
  }
});

const PORT = process.env.PORT || 5000;

// Security middleware
app.use(helmet());

// Rate limiting
const limiter = rateLimit({
  windowMs: (process.env.RATE_LIMIT_WINDOW || 15) * 60 * 1000, // 15 minutes
  max: process.env.RATE_LIMIT_MAX || 100 // limit each IP to 100 requests per windowMs
});
app.use('/api/', limiter);

// CORS configuration
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  credentials: true
}));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Logging middleware
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

// API Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/users', require('./routes/users'));
app.use('/api/schools', require('./routes/schools'));
app.use('/api/buses', require('./routes/buses'));
app.use('/api/drivers', require('./routes/drivers'));
app.use('/api/routes', require('./routes/routes'));
app.use('/api/students', require('./routes/students'));
app.use('/api/parents', require('./routes/parents'));
app.use('/api/schedules', require('./routes/schedules'));
app.use('/api/tracking', require('./routes/tracking'));
app.use('/api/attendance', require('./routes/attendance'));
app.use('/api/notifications', require('./routes/notifications'));
app.use('/api/reports', require('./routes/reports'));

// Health check endpoint
app.get('/api/health', async (req, res) => {
  const dbStatus = await testConnection();
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    database: dbStatus ? 'Connected' : 'Disconnected',
    version: '1.0.0'
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'API endpoint not found'
  });
});

// Start server
const startServer = async () => {
  try {
    // Test database connection
    const dbConnected = await testConnection();
    if (!dbConnected) {
      console.error('❌ Failed to connect to database');
      process.exit(1);
    }

    server.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`📊 Environment: ${process.env.NODE_ENV}`);
      console.log(`🔗 API URL: http://localhost:${PORT}/api`);
      console.log(`🔌 Socket.IO enabled for real-time tracking`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log(`👤 User connected: ${socket.id}`);

  // Join room for specific school or bus
  socket.on('joinRoom', (roomData) => {
    const { schoolId, busId, role } = roomData;
    
    if (schoolId) {
      socket.join(`school_${schoolId}`);
      console.log(`📍 Socket ${socket.id} joined school room: ${schoolId}`);
    }
    
    if (busId) {
      socket.join(`bus_${busId}`);
      console.log(`🚌 Socket ${socket.id} joined bus room: ${busId}`);
    }

    // Send confirmation
    socket.emit('roomJoined', { 
      success: true, 
      message: 'Joined tracking rooms successfully',
      rooms: { schoolId, busId, role }
    });
  });

  // Handle bus location updates (from drivers)
  socket.on('busLocationUpdate', (locationData) => {
    const { busId, latitude, longitude, speed, heading, timestamp } = locationData;
    
    // Broadcast to all clients tracking this bus
    io.to(`bus_${busId}`).emit('locationUpdate', {
      busId,
      latitude,
      longitude,
      speed,
      heading,
      timestamp: timestamp || new Date().toISOString()
    });

    // Also broadcast to school room
    if (locationData.schoolId) {
      io.to(`school_${locationData.schoolId}`).emit('busLocationUpdate', locationData);
    }

    console.log(`📍 Bus ${busId} location updated: ${latitude}, ${longitude}`);
  });

  // Handle bus status changes
  socket.on('busStatusChange', (statusData) => {
    const { busId, status, message, schoolId } = statusData;
    
    // Broadcast status change
    io.to(`bus_${busId}`).emit('statusUpdate', {
      busId,
      status,
      message,
      timestamp: new Date().toISOString()
    });

    if (schoolId) {
      io.to(`school_${schoolId}`).emit('busStatusUpdate', statusData);
    }

    console.log(`🚌 Bus ${busId} status changed to: ${status}`);
  });

  // Handle emergency alerts
  socket.on('emergencyAlert', (alertData) => {
    const { busId, schoolId, message, severity, location } = alertData;
    
    const alert = {
      id: Date.now(),
      busId,
      message,
      severity,
      location,
      timestamp: new Date().toISOString()
    };

    // Broadcast emergency to all relevant parties
    io.to(`bus_${busId}`).emit('emergencyAlert', alert);
    if (schoolId) {
      io.to(`school_${schoolId}`).emit('emergencyAlert', alert);
    }

    console.log(`🚨 Emergency alert from bus ${busId}: ${message}`);
  });

  // Handle attendance updates
  socket.on('attendanceUpdate', (attendanceData) => {
    const { studentId, busId, schoolId, status } = attendanceData;
    
    const update = {
      studentId,
      busId,
      status,
      timestamp: new Date().toISOString()
    };

    // Broadcast to bus and school
    io.to(`bus_${busId}`).emit('attendanceUpdate', update);
    if (schoolId) {
      io.to(`school_${schoolId}`).emit('attendanceUpdate', update);
    }

    console.log(`✅ Attendance updated for student ${studentId} on bus ${busId}: ${status}`);
  });

  // Handle disconnection
  socket.on('disconnect', () => {
    console.log(`👋 User disconnected: ${socket.id}`);
  });
});

// Make io available globally for API routes
app.set('io', io);

// Start server
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully');
  process.exit(0);
});

startServer();

module.exports = app;