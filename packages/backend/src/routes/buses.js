const express = require('express');
const router = express.Router();
const { query } = require('../config/database');

// GET /api/buses - Lấy tất cả xe buýt
router.get('/', async (req, res) => {
  try {
    const buses = await query(`
      SELECT 
        xb.*,
        tx.ho_ten as ten_tai_xe,
        tx.so_dien_thoai as sdt_tai_xe
      FROM xebuyt xb
      LEFT JOIN taixe tx ON xb.ma_tai_xe = tx.ma_tai_xe
      ORDER BY xb.ma_xe DESC
    `);
    
    res.json({
      success: true,
      message: 'Lấy danh sách xe buýt thành công',
      data: buses
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Lỗi server: ' + error.message
    });
  }
});

// GET /api/buses/:id - Lấy xe buýt theo ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const [bus] = await query(`
      SELECT 
        xb.*,
        tx.ho_ten as ten_tai_xe,
        tx.so_dien_thoai as sdt_tai_xe,
        tx.so_gplx
      FROM xebuyt xb
      LEFT JOIN taixe tx ON xb.ma_tai_xe = tx.ma_tai_xe
      WHERE xb.ma_xe = ?
    `, [id]);
    
    if (!bus) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy xe buýt'
      });
    }
    
    res.json({
      success: true,
      message: 'Lấy thông tin xe buýt thành công',
      data: bus
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Lỗi server: ' + error.message
    });
  }
});

// POST /api/buses - Tạo xe buýt mới
router.post('/', async (req, res) => {
  try {
    const { bien_so, suc_chua, trang_thai, ma_tai_xe } = req.body;
    
    const result = await query(`
      INSERT INTO xebuyt (bien_so, suc_chua, trang_thai, ma_tai_xe)
      VALUES (?, ?, ?, ?)
    `, [bien_so, suc_chua, trang_thai || 'san_sang', ma_tai_xe]);
    
    res.status(201).json({
      success: true,
      message: 'Tạo xe buýt thành công',
      data: { ma_xe: result.insertId }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Lỗi server: ' + error.message
    });
  }
});

module.exports = router;
