const express = require('express');
const { query } = require('../config/database');

const router = express.Router();

// Lấy notifications
router.get('/', async (req, res) => {
  try {
    const notifications = await query(`
      SELECT * FROM notifications 
      ORDER BY created_at DESC 
      LIMIT 50
    `);

    res.json({
      success: true,
      data: notifications
    });

  } catch (error) {
    console.error('Get notifications error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server nội bộ'
    });
  }
});

module.exports = router;