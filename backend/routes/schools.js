const express = require('express');
const { query } = require('../config/database');

const router = express.Router();

// Lấy tất cả schools
router.get('/', async (req, res) => {
  try {
    const { status = 'active', page = 1, limit = 10 } = req.query;
    
    const offset = (page - 1) * limit;
    
    const schools = await query(
      'SELECT * FROM schools WHERE status = ? ORDER BY name LIMIT ? OFFSET ?',
      [status, parseInt(limit), parseInt(offset)]
    );

    const totalResult = await query(
      'SELECT COUNT(*) as total FROM schools WHERE status = ?',
      [status]
    );

    res.json({
      success: true,
      data: schools,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: totalResult[0].total,
        totalPages: Math.ceil(totalResult[0].total / limit)
      }
    });

  } catch (error) {
    console.error('Get schools error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server nội bộ'
    });
  }
});

// Lấy school theo ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const schools = await query('SELECT * FROM schools WHERE id = ?', [id]);

    if (schools.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Trường học không tồn tại'
      });
    }

    res.json({
      success: true,
      data: schools[0]
    });

  } catch (error) {
    console.error('Get school error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server nội bộ'
    });
  }
});

module.exports = router;