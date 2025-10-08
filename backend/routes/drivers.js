const express = require('express');
const { query } = require('../config/database');

const router = express.Router();

// Lấy tất cả drivers
router.get('/', async (req, res) => {
  try {
    const drivers = await query(`
      SELECT d.*, u.name, u.email, u.phone, b.license_plate 
      FROM drivers d 
      JOIN users u ON d.user_id = u.id 
      LEFT JOIN buses b ON d.bus_id = b.id 
      WHERE u.status = 'active'
      ORDER BY u.name
    `);

    res.json({
      success: true,
      data: drivers
    });

  } catch (error) {
    console.error('Get drivers error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server nội bộ'
    });
  }
});

// Lấy driver theo ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const drivers = await query(`
      SELECT d.*, u.name, u.email, u.phone, b.license_plate 
      FROM drivers d 
      JOIN users u ON d.user_id = u.id 
      LEFT JOIN buses b ON d.bus_id = b.id 
      WHERE d.id = ?
    `, [id]);

    if (drivers.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Tài xế không tồn tại'
      });
    }

    res.json({
      success: true,
      data: drivers[0]
    });

  } catch (error) {
    console.error('Get driver error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server nội bộ'
    });
  }
});

module.exports = router;