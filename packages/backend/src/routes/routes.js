const express = require('express');
const router = express.Router();
const { query } = require('../config/database');

// GET /api/routes - Lấy tất cả tuyến đường
router.get('/', async (req, res) => {
  try {
    const routes = await query(`
      SELECT 
        td.*,
        COUNT(cttd.ma_chi_tiet) as so_tram_dung
      FROM tuyenduong td
      LEFT JOIN chitiettuyenduong cttd ON td.ma_tuyen = cttd.ma_tuyen
      GROUP BY td.ma_tuyen
      ORDER BY td.ten_tuyen ASC
    `);
    
    res.json({
      success: true,
      message: 'Lấy danh sách tuyến đường thành công',
      data: routes
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Lỗi server: ' + error.message
    });
  }
});

// GET /api/routes/:id - Lấy tuyến đường theo ID với chi tiết các trạm
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Lấy thông tin tuyến đường
    const [route] = await query(`
      SELECT * FROM tuyenduong WHERE ma_tuyen = ?
    `, [id]);
    
    if (!route) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy tuyến đường'
      });
    }
    
    // Lấy danh sách trạm dừng của tuyến
    const stops = await query(`
      SELECT 
        cttd.ma_chi_tiet,
        cttd.thu_tu,
        cttd.thoi_gian_den,
        cttd.thoi_gian_di,
        tx.ten_tram,
        tx.dia_chi,
        tx.kinh_do,
        tx.vi_do
      FROM chitiettuyenduong cttd
      LEFT JOIN tramxe tx ON cttd.ma_tram = tx.ma_tram
      WHERE cttd.ma_tuyen = ?
      ORDER BY cttd.thu_tu ASC
    `, [id]);
    
    res.json({
      success: true,
      message: 'Lấy thông tin tuyến đường thành công',
      data: {
        ...route,
        tram_dung: stops
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Lỗi server: ' + error.message
    });
  }
});

// GET /api/routes/:id/stops - Lấy danh sách trạm dừng của tuyến
router.get('/:id/stops', async (req, res) => {
  try {
    const { id } = req.params;
    
    const stops = await query(`
      SELECT 
        cttd.ma_chi_tiet,
        cttd.thu_tu,
        cttd.thoi_gian_den,
        cttd.thoi_gian_di,
        tx.ma_tram,
        tx.ten_tram,
        tx.dia_chi,
        tx.kinh_do,
        tx.vi_do
      FROM chitiettuyenduong cttd
      LEFT JOIN tramxe tx ON cttd.ma_tram = tx.ma_tram
      WHERE cttd.ma_tuyen = ?
      ORDER BY cttd.thu_tu ASC
    `, [id]);
    
    res.json({
      success: true,
      message: 'Lấy danh sách trạm dừng thành công',
      data: stops
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Lỗi server: ' + error.message
    });
  }
});

// POST /api/routes - Tạo tuyến đường mới
router.post('/', async (req, res) => {
  try {
    const { ten_tuyen, diem_bat_dau, diem_ket_thuc, do_dai_km, thoi_gian_uoc_tinh, trang_thai } = req.body;
    
    const result = await query(`
      INSERT INTO tuyenduong (ten_tuyen, diem_bat_dau, diem_ket_thuc, do_dai_km, thoi_gian_uoc_tinh, trang_thai)
      VALUES (?, ?, ?, ?, ?, ?)
    `, [ten_tuyen, diem_bat_dau, diem_ket_thuc, do_dai_km, thoi_gian_uoc_tinh, trang_thai || 'hoat_dong']);
    
    res.status(201).json({
      success: true,
      message: 'Tạo tuyến đường thành công',
      data: { ma_tuyen: result.insertId }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Lỗi server: ' + error.message
    });
  }
});

// POST /api/routes/:id/stops - Thêm trạm dừng vào tuyến
router.post('/:id/stops', async (req, res) => {
  try {
    const { id } = req.params;
    const { ma_tram, thu_tu, thoi_gian_den, thoi_gian_di } = req.body;
    
    const result = await query(`
      INSERT INTO chitiettuyenduong (ma_tuyen, ma_tram, thu_tu, thoi_gian_den, thoi_gian_di)
      VALUES (?, ?, ?, ?, ?)
    `, [id, ma_tram, thu_tu, thoi_gian_den, thoi_gian_di]);
    
    res.status(201).json({
      success: true,
      message: 'Thêm trạm dừng thành công',
      data: { ma_chi_tiet: result.insertId }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Lỗi server: ' + error.message
    });
  }
});

module.exports = router;
