const express = require('express');
const { query } = require('../config/database');

const router = express.Router();

// Lấy tất cả routes
router.get('/', async (req, res) => {
  try {
    const routes = await query(`
      SELECT r.*, s.name as school_name 
      FROM routes r 
      LEFT JOIN schools s ON r.school_id = s.id 
      ORDER BY r.name
    `);

    res.json({
      success: true,
      data: routes
    });

  } catch (error) {
    console.error('Get routes error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server nội bộ'
    });
  }
});

// Lấy route theo ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const routes = await query(`
      SELECT r.*, s.name as school_name 
      FROM routes r 
      LEFT JOIN schools s ON r.school_id = s.id 
      WHERE r.id = ?
    `, [id]);

    if (routes.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Lộ trình không tồn tại'
      });
    }

    res.json({
      success: true,
      data: routes[0]
    });

  } catch (error) {
    console.error('Get route error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server nội bộ'
    });
  }
});

module.exports = router;