require('dotenv').config();
const http = require('http');
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const { Server } = require('socket.io');
const { testConnection } = require('./src/config/database');
const errorHandler = require('./src/middleware/errorHandler');
const studentRoutes = require('./src/routes/students');
const driverRoutes = require('./src/routes/drivers');
const busRoutes = require('./src/routes/buses');
const scheduleRoutes = require('./src/routes/schedules');
const routeRoutes = require('./src/routes/routes');
const reportRoutes = require('./src/routes/reports');
const parentRoutes = require('./src/routes/parents');
const stopRoutes = require('./src/routes/stops');
const notificationRoutes = require('./src/routes/notifications');
const authRoutes = require('./src/routes/auth');
const app = express();
const allowedOrigins = (process.env.CORS_ORIGIN || 'http://localhost:5173')
  .split(',')
  .map((origin) => origin.trim());
app.use(helmet());
app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
  }),
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
if (process.env.NODE_ENV === 'development') { app.use(morgan('dev')); }

// Rate limiting - more permissive in development
const limiter = rateLimit({ 
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: process.env.NODE_ENV === 'development' ? 1000 : 100, // 1000 for dev, 100 for production
  message: { success: false, message: 'Too many requests, please try again later.' }
});
app.use('/api', limiter);

app.get('/health', (req, res) => { res.json({ success: true, message: 'Server is running', timestamp: new Date().toISOString() }); });
console.log('✅ Loading auth routes');
app.use('/api/auth', authRoutes);
console.log('✅ Loading students routes');
app.use('/api/students', studentRoutes);
app.use('/api/hocsinh', studentRoutes);

console.log('✅ Loading drivers routes');
app.use('/api/drivers', driverRoutes);
app.use('/api/taixe', driverRoutes);

console.log('✅ Loading buses routes');
app.use('/api/buses', busRoutes);
app.use('/api/xebuyt', busRoutes);

console.log('✅ Loading schedules routes');
app.use('/api/schedules', scheduleRoutes);
app.use('/api/lichtrinh', scheduleRoutes);

console.log('✅ Loading routes routes');
app.use('/api/routes', routeRoutes);
app.use('/api/tuyenduong', routeRoutes);

console.log('✅ Loading parents routes');
app.use('/api/parents', parentRoutes);
app.use('/api/phuhuynh', parentRoutes);

console.log('✅ Loading stops routes');
app.use('/api/stops', stopRoutes);
app.use('/api/tramxe', stopRoutes);

const busLocationRoutes = require('./src/routes/busLocations');
console.log('✅ Loading bus location routes');
app.use('/api/bus-locations', busLocationRoutes);
app.use('/api/vitrixe', busLocationRoutes);

console.log('✅ Loading notifications routes');
app.use('/api/notifications', notificationRoutes);
app.use('/api/thongbao', notificationRoutes);

console.log('✅ Loading reports routes');
app.use('/api/reports', reportRoutes);

app.use('*', (req, res) => { res.status(404).json({ success: false, message: `Route ${req.originalUrl} not found` }); });
app.use(errorHandler);
const PORT = process.env.PORT || 5000;
const HOST = process.env.HOST || '0.0.0.0';
const SOCKET_PATH = process.env.SOCKET_PATH || '/socket.io';

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    credentials: true,
  },
  transports: ['websocket', 'polling'],
  path: SOCKET_PATH,
});

function buildRooms(roomData = {}) {
  const rooms = new Set(['global']);
  const { busId, schoolId, role } = roomData;

  if (role) {
    rooms.add(`role:${role}`);
  }

  if (busId) {
    rooms.add(`bus:${busId}`);
  }

  if (schoolId) {
    rooms.add(`school:${schoolId}`);
  }

  return rooms;
}

function emitBusEvent(event, payload, busId) {
  const enrichedPayload = {
    ...payload,
    timestamp: payload?.timestamp || new Date().toISOString(),
  };

  const targetRooms = [
    'global',
    'role:admin',
    busId ? `bus:${busId}` : null,
  ].filter(Boolean);

  targetRooms.forEach((room) => {
    io.to(room).emit(event, enrichedPayload);
  });
}

io.on('connection', (socket) => {
  console.log(`🔌 Socket connected: ${socket.id}`);

  socket.join('global');

  socket.emit('connected', {
    socketId: socket.id,
    timestamp: new Date().toISOString(),
  });

  socket.on('joinRoom', (roomData) => {
    const rooms = buildRooms(roomData);
    rooms.forEach((room) => socket.join(room));

    console.log(`🏠 Socket ${socket.id} joined rooms:`, Array.from(rooms));

    socket.emit('roomJoined', {
      rooms: Array.from(rooms),
      timestamp: new Date().toISOString(),
    });
  });

  socket.on('busLocationUpdate', async (payload = {}) => {
    const busId = payload.busId || payload.ma_xe || payload.id;
    if (!busId) {
      console.warn(`⚠️ Received location update without busId from ${socket.id}`, payload);
      return;
    }

    // Save location to database
    try {
      const BusLocation = require('./src/models/BusLocation');
      const vi_do = payload.vi_do ?? payload.latitude;
      const kinh_do = payload.kinh_do ?? payload.longitude;
      const toc_do = payload.toc_do ?? payload.speed;

      if (vi_do != null && kinh_do != null) {
        await BusLocation.create({
          ma_xe: busId,
          vi_do: Number(vi_do),
          kinh_do: Number(kinh_do),
          toc_do: toc_do ? Number(toc_do) : null,
        });
        console.log(`💾 Saved location for bus ${busId}: ${vi_do}, ${kinh_do}`);
      }
    } catch (error) {
      console.error(`❌ Error saving bus location to database:`, error);
      // Continue to emit event even if database save fails
    }

    // Emit to connected clients
    emitBusEvent('busLocationUpdate', payload, busId);
    emitBusEvent('locationUpdate', payload, busId);
  });

  socket.on('busStatusChange', (payload = {}) => {
    if (!payload.busId) {
      console.warn(`⚠️ Received status update without busId from ${socket.id}`, payload);
      return;
    }

    emitBusEvent('busStatusUpdate', payload, payload.busId);
    emitBusEvent('statusUpdate', payload, payload.busId);
  });

  socket.on('emergencyAlert', (payload = {}) => {
    const enrichedPayload = {
      ...payload,
      timestamp: payload?.timestamp || new Date().toISOString(),
      id: payload?.id || Date.now(),
    };

    const targetRooms = [
      'global',
      'role:admin',
      payload.busId ? `bus:${payload.busId}` : null,
    ].filter(Boolean);

    targetRooms.forEach((room) => {
      io.to(room).emit('emergencyAlert', enrichedPayload);
    });
  });

  socket.on('attendanceUpdate', (payload = {}) => {
    if (!payload.busId) {
      console.warn(`⚠️ Received attendance update without busId from ${socket.id}`, payload);
    }

    const enrichedPayload = {
      ...payload,
      timestamp: payload?.timestamp || new Date().toISOString(),
    };

    const targetRooms = [
      'global',
      'role:admin',
      payload.busId ? `bus:${payload.busId}` : null,
    ].filter(Boolean);

    targetRooms.forEach((room) => {
      io.to(room).emit('attendanceUpdate', enrichedPayload);
    });
  });

  // Handle delay alerts
  socket.on('delayAlert', (payload = {}) => {
    if (!payload.ma_xe && !payload.busId) {
      console.warn(`⚠️ Received delay alert without busId from ${socket.id}`, payload);
      return;
    }

    const enrichedPayload = {
      ...payload,
      timestamp: payload?.timestamp || new Date().toISOString(),
      id: payload?.id || Date.now(),
    };

    // Send to admin, parents of students on this route/schedule, and the specific bus
    const busId = payload.ma_xe || payload.busId;
    const targetRooms = [
      'global',
      'role:admin',
      busId ? `bus:${busId}` : null,
      payload.ma_tuyen ? `route:${payload.ma_tuyen}` : null,
      payload.ma_lich ? `schedule:${payload.ma_lich}` : null,
    ].filter(Boolean);

    targetRooms.forEach((room) => {
      io.to(room).emit('delayAlert', enrichedPayload);
      io.to(room).emit('notification', {
        type: 'delay',
        ...enrichedPayload,
      });
    });

    console.log(`🚨 Delay alert broadcast to ${targetRooms.length} rooms:`, enrichedPayload);
  });

  socket.on('disconnect', (reason) => {
    console.log(`❌ Socket disconnected: ${socket.id} (reason: ${reason})`);
  });
});
async function startServer() {
  try {
    await testConnection();
    server.listen(PORT, HOST, () => {
      console.log('\n Smart School Bus API Server');
      console.log('================================');
      console.log(`Server running on: http://${HOST}:${PORT}`);
      console.log(`Socket path: ${SOCKET_PATH}`);
      console.log('================================\n');
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}
startServer();