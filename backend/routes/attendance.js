const express = require('express');
const { query } = require('../config/database');

const router = express.Router();

// Lấy attendance records
router.get('/', async (req, res) => {
  try {
    const attendance = await query(`
      SELECT a.*, s.name as student_name, sch.schedule_date 
      FROM attendance a 
      LEFT JOIN students st ON a.student_id = st.id 
      LEFT JOIN schedules sch ON a.schedule_id = sch.id 
      ORDER BY sch.schedule_date DESC, a.actual_time DESC 
      LIMIT 100
    `);

    res.json({
      success: true,
      data: attendance
    });

  } catch (error) {
    console.error('Get attendance error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server nội bộ'
    });
  }
});

module.exports = router;