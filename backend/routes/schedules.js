const express = require('express');
const { query } = require('../config/database');

const router = express.Router();

// Lấy tất cả schedules
router.get('/', async (req, res) => {
  try {
    // Query đơn giản trước để test
    const schedules = await query(`
      SELECT * FROM schedules 
      ORDER BY schedule_date DESC, start_time
    `);

    res.json({
      success: true,
      data: schedules
    });

  } catch (error) {
    console.error('Get schedules error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server nội bộ',
      error: error.message
    });
  }
});

module.exports = router;