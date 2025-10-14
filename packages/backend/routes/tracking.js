const express = require('express');
const { query } = require('../config/database');

const router = express.Router();

// Lấy tracking data
router.get('/', async (req, res) => {
  try {
    const tracking = await query(`
      SELECT t.*, b.license_plate 
      FROM tracking_data t 
      LEFT JOIN buses b ON t.bus_id = b.id 
      ORDER BY t.timestamp DESC 
      LIMIT 100
    `);

    res.json({
      success: true,
      data: tracking
    });

  } catch (error) {
    console.error('Get tracking error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server nội bộ'
    });
  }
});

// Update bus location and broadcast real-time
router.post('/location', async (req, res) => {
  try {
    const { busId, latitude, longitude, speed, heading, driverId } = req.body;
    
    if (!busId || !latitude || !longitude) {
      return res.status(400).json({
        success: false,
        message: 'Bus ID, latitude và longitude là bắt buộc'
      });
    }

    // Save to tracking_data table
    const trackingData = await query(`
      INSERT INTO tracking_data (bus_id, latitude, longitude, speed, heading, timestamp)
      VALUES (?, ?, ?, ?, ?, NOW())
    `, [busId, latitude, longitude, speed || 0, heading || 0]);

    // Get socket.io instance from app
    const io = req.app.get('io');
    
    if (io) {
      // Get bus info for broadcast
      const [busInfo] = await query(`
        SELECT b.*, s.id as school_id 
        FROM buses b 
        LEFT JOIN schools s ON b.school_id = s.id 
        WHERE b.id = ?
      `, [busId]);

      const locationUpdate = {
        busId,
        latitude: parseFloat(latitude),
        longitude: parseFloat(longitude),
        speed: parseFloat(speed) || 0,
        heading: parseFloat(heading) || 0,
        timestamp: new Date().toISOString(),
        busInfo: busInfo[0] || null
      };

      // Broadcast to bus room
      io.to(`bus_${busId}`).emit('locationUpdate', locationUpdate);
      
      // Broadcast to school room if bus belongs to a school
      if (busInfo[0] && busInfo[0].school_id) {
        io.to(`school_${busInfo[0].school_id}`).emit('busLocationUpdate', locationUpdate);
      }

      console.log(`📍 Real-time location update broadcasted for bus ${busId}`);
    }

    res.json({
      success: true,
      message: 'Vị trí xe buýt đã được cập nhật',
      data: {
        trackingId: trackingData.insertId,
        busId,
        latitude,
        longitude,
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Location update error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server nội bộ',
      error: error.message
    });
  }
});

// Update bus status and broadcast
router.post('/status', async (req, res) => {
  try {
    const { busId, status, message, driverId } = req.body;
    
    if (!busId || !status) {
      return res.status(400).json({
        success: false,
        message: 'Bus ID và status là bắt buộc'
      });
    }

    // Update bus status in database
    await query(`
      UPDATE buses SET status = ?, updated_at = NOW() WHERE id = ?
    `, [status, busId]);

    // Get socket.io instance
    const io = req.app.get('io');
    
    if (io) {
      // Get bus and school info
      const [busInfo] = await query(`
        SELECT b.*, s.id as school_id 
        FROM buses b 
        LEFT JOIN schools s ON b.school_id = s.id 
        WHERE b.id = ?
      `, [busId]);

      const statusUpdate = {
        busId,
        status,
        message,
        timestamp: new Date().toISOString(),
        busInfo: busInfo[0] || null
      };

      // Broadcast status change
      io.to(`bus_${busId}`).emit('statusUpdate', statusUpdate);
      
      if (busInfo[0] && busInfo[0].school_id) {
        io.to(`school_${busInfo[0].school_id}`).emit('busStatusUpdate', statusUpdate);
      }

      console.log(`🚌 Real-time status update broadcasted for bus ${busId}: ${status}`);
    }

    res.json({
      success: true,
      message: 'Trạng thái xe buýt đã được cập nhật',
      data: {
        busId,
        status,
        message,
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Status update error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server nội bộ',
      error: error.message
    });
  }
});

// Send emergency alert
router.post('/emergency', async (req, res) => {
  try {
    const { busId, message, severity, latitude, longitude, driverId } = req.body;
    
    if (!busId || !message) {
      return res.status(400).json({
        success: false,
        message: 'Bus ID và message là bắt buộc'
      });
    }

    // Save emergency alert to notifications table
    const alertData = await query(`
      INSERT INTO notifications (type, title, message, user_id, created_at)
      VALUES ('emergency', 'Cảnh báo khẩn cấp từ xe buýt ${busId}', ?, ?, NOW())
    `, [message, driverId || null]);

    // Get socket.io instance
    const io = req.app.get('io');
    
    if (io) {
      // Get bus and school info
      const [busInfo] = await query(`
        SELECT b.*, s.id as school_id 
        FROM buses b 
        LEFT JOIN schools s ON b.school_id = s.id 
        WHERE b.id = ?
      `, [busId]);

      const alert = {
        id: alertData.insertId,
        busId,
        message,
        severity: severity || 'medium',
        location: (latitude && longitude) ? { latitude, longitude } : null,
        timestamp: new Date().toISOString(),
        busInfo: busInfo[0] || null
      };

      // Broadcast emergency alert
      io.to(`bus_${busId}`).emit('emergencyAlert', alert);
      
      if (busInfo[0] && busInfo[0].school_id) {
        io.to(`school_${busInfo[0].school_id}`).emit('emergencyAlert', alert);
      }

      console.log(`🚨 Emergency alert broadcasted for bus ${busId}: ${message}`);
    }

    res.json({
      success: true,
      message: 'Cảnh báo khẩn cấp đã được gửi',
      data: {
        alertId: alertData.insertId,
        busId,
        message,
        severity: severity || 'medium',
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Emergency alert error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server nội bộ',
      error: error.message
    });
  }
});

// Get real-time tracking data for a bus
router.get('/bus/:busId', async (req, res) => {
  try {
    const { busId } = req.params;
    
    // Get latest tracking data
    const trackingData = await query(`
      SELECT * FROM tracking_data 
      WHERE bus_id = ? 
      ORDER BY timestamp DESC 
      LIMIT 1
    `, [busId]);

    // Get bus status
    const [busStatus] = await query(`
      SELECT b.*, s.name as school_name 
      FROM buses b 
      LEFT JOIN schools s ON b.school_id = s.id 
      WHERE b.id = ?
    `, [busId]);

    res.json({
      success: true,
      data: {
        bus: busStatus[0] || null,
        lastLocation: trackingData[0] || null,
        isOnline: trackingData.length > 0
      }
    });

  } catch (error) {
    console.error('Get tracking data error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server nội bộ',
      error: error.message
    });
  }
});

module.exports = router;