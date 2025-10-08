const express = require('express');
const { query } = require('../config/database');

const router = express.Router();

// Lấy tất cả buses
router.get('/', async (req, res) => {
  try {
    // Query đơn giản trước để test
    const buses = await query(`
      SELECT * FROM buses 
      ORDER BY id
    `);

    res.json({
      success: true,
      data: buses
    });

  } catch (error) {
    console.error('Get buses error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server nội bộ',
      error: error.message
    });
  }
});

// Lấy bus theo ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const buses = await query(
      `SELECT b.*, s.name as school_name, d.name as driver_name 
       FROM buses b 
       LEFT JOIN schools s ON b.school_id = s.id 
       LEFT JOIN drivers dr ON b.id = dr.bus_id 
       LEFT JOIN users d ON dr.user_id = d.id 
       WHERE b.id = ?`,
      [id]
    );

    if (buses.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Xe bus không tồn tại'
      });
    }

    res.json({
      success: true,
      data: buses[0]
    });

  } catch (error) {
    console.error('Get bus error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server nội bộ'
    });
  }
});

module.exports = router;