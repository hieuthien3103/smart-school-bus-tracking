const express = require('express');
const { query } = require('../config/database');

const router = express.Router();

// Lấy tất cả buses
router.get('/', async (req, res) => {
  try {
    const { status, schoolId, page = 1, limit = 10 } = req.query;
    
    let sql = `
      SELECT b.*, s.name as school_name, d.name as driver_name 
      FROM buses b 
      LEFT JOIN schools s ON b.school_id = s.id 
      LEFT JOIN drivers dr ON b.id = dr.bus_id 
      LEFT JOIN users d ON dr.user_id = d.id 
      WHERE 1=1
    `;
    const params = [];

    if (status) {
      sql += ' AND b.status = ?';
      params.push(status);
    }

    if (schoolId) {
      sql += ' AND b.school_id = ?';
      params.push(schoolId);
    }

    const offset = (page - 1) * limit;
    sql += ' ORDER BY b.license_plate LIMIT ? OFFSET ?';
    params.push(parseInt(limit), parseInt(offset));

    const buses = await query(sql, params);

    res.json({
      success: true,
      data: buses
    });

  } catch (error) {
    console.error('Get buses error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server nội bộ'
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