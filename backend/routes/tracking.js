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

module.exports = router;