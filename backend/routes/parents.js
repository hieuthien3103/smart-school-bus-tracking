const express = require('express');
const { query } = require('../config/database');

const router = express.Router();

// Lấy tất cả parents
router.get('/', async (req, res) => {
  try {
    const parents = await query(`
      SELECT p.*, u.name, u.email, u.phone 
      FROM parents p 
      JOIN users u ON p.user_id = u.id 
      WHERE u.status = 'active'
      ORDER BY u.name
    `);

    res.json({
      success: true,
      data: parents
    });

  } catch (error) {
    console.error('Get parents error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server nội bộ'
    });
  }
});

module.exports = router;