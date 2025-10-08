const express = require('express');
const { query } = require('../config/database');

const router = express.Router();

// Lấy tất cả schedules
router.get('/', async (req, res) => {
  try {
    const schedules = await query(`
      SELECT s.*, r.name as route_name, d.name as driver_name, b.license_plate 
      FROM schedules s 
      LEFT JOIN routes r ON s.route_id = r.id 
      LEFT JOIN drivers dr ON s.driver_id = dr.id 
      LEFT JOIN users d ON dr.user_id = d.id 
      LEFT JOIN buses b ON s.bus_id = b.id 
      ORDER BY s.schedule_date DESC, s.start_time
    `);

    res.json({
      success: true,
      data: schedules
    });

  } catch (error) {
    console.error('Get schedules error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server nội bộ'
    });
  }
});

module.exports = router;