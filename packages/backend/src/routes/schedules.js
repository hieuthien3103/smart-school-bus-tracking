const express = require('express');
const router = express.Router();
const { query } = require('../config/database');

// GET /api/schedules - Lấy tất cả lịch trình
router.get('/', async (req, res) => {
  try {
    const schedules = await query(`
      SELECT 
        lt.*,
        td.ten_tuyen,
        xb.bien_so,
        tx.ho_ten as ten_tai_xe
      FROM lichtrinh lt
      LEFT JOIN tuyenduong td ON lt.ma_tuyen = td.ma_tuyen
      LEFT JOIN xebuyt xb ON lt.ma_xe = xb.ma_xe
      LEFT JOIN taixe tx ON lt.ma_tai_xe = tx.ma_tai_xe
      ORDER BY lt.ngay_chay DESC, lt.gio_bat_dau DESC
    `);
    
    res.json({
      success: true,
      message: 'Lấy danh sách lịch trình thành công',
      data: schedules
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Lỗi server: ' + error.message
    });
  }
});

// GET /api/schedules/today - Lấy lịch trình hôm nay
router.get('/today', async (req, res) => {
  try {
    const schedules = await query(`
      SELECT 
        lt.*,
        td.ten_tuyen,
        xb.bien_so,
        tx.ho_ten as ten_tai_xe
      FROM lichtrinh lt
      LEFT JOIN tuyenduong td ON lt.ma_tuyen = td.ma_tuyen
      LEFT JOIN xebuyt xb ON lt.ma_xe = xb.ma_xe
      LEFT JOIN taixe tx ON lt.ma_tai_xe = tx.ma_tai_xe
      WHERE DATE(lt.ngay_chay) = CURDATE()
      ORDER BY lt.gio_bat_dau ASC
    `);
    
    res.json({
      success: true,
      message: 'Lấy lịch trình hôm nay thành công',
      data: schedules
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Lỗi server: ' + error.message
    });
  }
});

// GET /api/schedules/:id - Lấy lịch trình theo ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const [schedule] = await query(`
      SELECT 
        lt.*,
        td.ten_tuyen,
        td.diem_bat_dau,
        td.diem_ket_thuc,
        td.do_dai_km,
        xb.bien_so,
        xb.suc_chua,
        tx.ho_ten as ten_tai_xe,
        tx.so_dien_thoai as sdt_tai_xe
      FROM lichtrinh lt
      LEFT JOIN tuyenduong td ON lt.ma_tuyen = td.ma_tuyen
      LEFT JOIN xebuyt xb ON lt.ma_xe = xb.ma_xe
      LEFT JOIN taixe tx ON lt.ma_tai_xe = tx.ma_tai_xe
      WHERE lt.ma_lich = ?
    `, [id]);
    
    if (!schedule) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy lịch trình'
      });
    }
    
    res.json({
      success: true,
      message: 'Lấy thông tin lịch trình thành công',
      data: schedule
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Lỗi server: ' + error.message
    });
  }
});

// POST /api/schedules - Tạo lịch trình mới
router.post('/', async (req, res) => {
  try {
    const { ma_tuyen, ma_xe, ma_tai_xe, ngay_chay, gio_bat_dau, gio_ket_thuc, trang_thai_lich } = req.body;
    
    const result = await query(`
      INSERT INTO lichtrinh (ma_tuyen, ma_xe, ma_tai_xe, ngay_chay, gio_bat_dau, gio_ket_thuc, trang_thai_lich)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `, [ma_tuyen, ma_xe, ma_tai_xe, ngay_chay, gio_bat_dau, gio_ket_thuc, trang_thai_lich || 'cho_chay']);
    
    res.status(201).json({
      success: true,
      message: 'Tạo lịch trình thành công',
      data: { ma_lich: result.insertId }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Lỗi server: ' + error.message
    });
  }
});

module.exports = router;
