const express = require('express');
const router = express.Router();
const { query } = require('../config/database');

// GET /api/drivers - Lấy tất cả tài xế
router.get('/', async (req, res) => {
  try {
    const drivers = await query(`
      SELECT 
        tx.*,
        ql.ho_ten as ten_quan_ly
      FROM taixe tx
      LEFT JOIN quanlytaixe ql ON tx.ma_ql = ql.ma_ql
      ORDER BY tx.ma_tai_xe DESC
    `);
    
    res.json({
      success: true,
      message: 'Lấy danh sách tài xế thành công',
      data: drivers
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Lỗi server: ' + error.message
    });
  }
});

// GET /api/drivers/:id - Lấy tài xế theo ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const [driver] = await query(`
      SELECT 
        tx.*,
        ql.ho_ten as ten_quan_ly,
        ql.so_dien_thoai as sdt_quan_ly
      FROM taixe tx
      LEFT JOIN quanlytaixe ql ON tx.ma_ql = ql.ma_ql
      WHERE tx.ma_tai_xe = ?
    `, [id]);
    
    if (!driver) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy tài xế'
      });
    }
    
    res.json({
      success: true,
      message: 'Lấy thông tin tài xế thành công',
      data: driver
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Lỗi server: ' + error.message
    });
  }
});

// POST /api/drivers - Tạo tài xế mới
router.post('/', async (req, res) => {
  try {
    const { ho_ten, so_dien_thoai, so_gplx, trang_thai, tai_khoan, mat_khau, ma_ql } = req.body;
    
    const result = await query(`
      INSERT INTO taixe (ho_ten, so_dien_thoai, so_gplx, trang_thai, tai_khoan, mat_khau, ma_ql)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `, [ho_ten, so_dien_thoai, so_gplx, trang_thai || 'san_sang', tai_khoan, mat_khau, ma_ql]);
    
    res.status(201).json({
      success: true,
      message: 'Tạo tài xế thành công',
      data: { ma_tai_xe: result.insertId }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Lỗi server: ' + error.message
    });
  }
});

module.exports = router;
