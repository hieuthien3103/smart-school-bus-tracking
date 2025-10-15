const express = require('express');
const router = express.Router();
const { query } = require('../config/database');

// GET /api/students - Lấy tất cả học sinh
router.get('/', async (req, res) => {
  try {
    const students = await query(`
      SELECT 
        hs.*,
        ph.ho_ten as ten_phu_huynh,
        ph.so_dien_thoai as sdt_phu_huynh,
        t1.ten_tram as ten_diem_don,
        t2.ten_tram as ten_diem_tra
      FROM hocsinh hs
      LEFT JOIN phuhuynh ph ON hs.ma_phu_huynh = ph.ma_phu_huynh
      LEFT JOIN tramxe t1 ON hs.ma_diem_don = t1.ma_tram
      LEFT JOIN tramxe t2 ON hs.ma_diem_tra = t2.ma_tram
      ORDER BY hs.ma_hs DESC
    `);
    
    res.json({
      success: true,
      message: 'Lấy danh sách học sinh thành công',
      data: students
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Lỗi server: ' + error.message
    });
  }
});

// GET /api/students/:id - Lấy học sinh theo ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const [student] = await query(`
      SELECT 
        hs.*,
        ph.ho_ten as ten_phu_huynh,
        ph.so_dien_thoai as sdt_phu_huynh,
        ph.email as email_phu_huynh,
        t1.ten_tram as ten_diem_don,
        t1.dia_chi as dia_chi_diem_don,
        t2.ten_tram as ten_diem_tra,
        t2.dia_chi as dia_chi_diem_tra
      FROM hocsinh hs
      LEFT JOIN phuhuynh ph ON hs.ma_phu_huynh = ph.ma_phu_huynh
      LEFT JOIN tramxe t1 ON hs.ma_diem_don = t1.ma_tram
      LEFT JOIN tramxe t2 ON hs.ma_diem_tra = t2.ma_tram
      WHERE hs.ma_hs = ?
    `, [id]);
    
    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy học sinh'
      });
    }
    
    res.json({
      success: true,
      message: 'Lấy thông tin học sinh thành công',
      data: student
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Lỗi server: ' + error.message
    });
  }
});

// POST /api/students - Tạo học sinh mới
router.post('/', async (req, res) => {
  try {
    const { ho_ten, lop, ma_phu_huynh, ma_diem_don, ma_diem_tra, trang_thai } = req.body;
    
    const result = await query(`
      INSERT INTO hocsinh (ho_ten, lop, ma_phu_huynh, ma_diem_don, ma_diem_tra, trang_thai)
      VALUES (?, ?, ?, ?, ?, ?)
    `, [ho_ten, lop, ma_phu_huynh, ma_diem_don, ma_diem_tra, trang_thai || 'hoat_dong']);
    
    res.status(201).json({
      success: true,
      message: 'Tạo học sinh thành công',
      data: { ma_hs: result.insertId }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Lỗi server: ' + error.message
    });
  }
});

module.exports = router;
