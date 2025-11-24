// src/models/Route.js
const db = require('../config/database');

class Route {
  // Lấy danh sách tuyến
  static async getAll() {
    const query = `
      SELECT ma_tuyen, ten_tuyen, diem_bat_dau, diem_ket_thuc, do_dai_km
      FROM tuyenduong
      ORDER BY ma_tuyen DESC
    `;
    const [rows] = await db.execute(query);
    return rows;
  }

  // Lấy chi tiết 1 tuyến
  static async getById(ma_tuyen) {
    const query = `SELECT * FROM tuyenduong WHERE ma_tuyen = ?`;
    const [rows] = await db.execute(query, [ma_tuyen]);
    return rows[0];
  }

  // Tạo tuyến mới
  static async create(data) {
    const query = `
      INSERT INTO tuyenduong (ten_tuyen, diem_bat_dau, diem_ket_thuc, do_dai_km)
      VALUES (?, ?, ?, ?)
    `;
    const [result] = await db.execute(query, [
      data.ten_tuyen,
      data.diem_bat_dau,
      data.diem_ket_thuc,
      data.do_dai_km || 0
    ]);
    return this.getById(result.insertId);
  }

  // Cập nhật tuyến
  static async update(ma_tuyen, data) {
    const fields = [];
    const values = [];

    if (data.ten_tuyen !== undefined) {
      fields.push('ten_tuyen = ?');
      values.push(data.ten_tuyen);
    }
    if (data.diem_bat_dau !== undefined) {
      fields.push('diem_bat_dau = ?');
      values.push(data.diem_bat_dau);
    }
    if (data.diem_ket_thuc !== undefined) {
      fields.push('diem_ket_thuc = ?');
      values.push(data.diem_ket_thuc);
    }
    if (data.do_dai_km !== undefined) {
      fields.push('do_dai_km = ?');
      values.push(data.do_dai_km);
    }

    if (!fields.length) {
      return this.getById(ma_tuyen);
    }

    const query = `
      UPDATE tuyenduong
      SET ${fields.join(', ')}
      WHERE ma_tuyen = ?
    `;

    values.push(ma_tuyen);
    await db.execute(query, values);
    return this.getById(ma_tuyen);
  }

  // Xóa tuyến
  static async delete(ma_tuyen) {
    const query = `DELETE FROM tuyenduong WHERE ma_tuyen = ?`;
    await db.execute(query, [ma_tuyen]);
    return { message: 'Xóa tuyến thành công' };
  }

  // Lấy chi tiết tuyến đường với các trạm (stops)
  static async getRouteDetails(ma_tuyen) {
    const query = `
      SELECT 
        ctd.ma_ct,
        ctd.ma_tuyen,
        ctd.ma_tram,
        ctd.thu_tu,
        t.ten_tram,
        t.dia_chi,
        t.loai_tram,
        t.vi_do,
        t.kinh_do
      FROM chitiettuyenduong ctd
      JOIN tramxe t ON ctd.ma_tram = t.ma_tram
      WHERE ctd.ma_tuyen = ?
      ORDER BY ctd.thu_tu ASC
    `;
    const [rows] = await db.execute(query, [ma_tuyen]);
    return rows;
  }

  // Lấy tuyến đường cho admin (tất cả tuyến)
  static async getRoutesForAdmin() {
    const query = `
      SELECT 
        t.ma_tuyen,
        t.ten_tuyen,
        t.diem_bat_dau,
        t.diem_ket_thuc,
        t.do_dai_km,
        COUNT(DISTINCT l.ma_lich) as so_lich_trinh
      FROM tuyenduong t
      LEFT JOIN lichtrinh l ON t.ma_tuyen = l.ma_tuyen
      GROUP BY t.ma_tuyen, t.ten_tuyen, t.diem_bat_dau, t.diem_ket_thuc, t.do_dai_km
      ORDER BY t.ma_tuyen DESC
    `;
    const [rows] = await db.execute(query);
    return rows;
  }

  // Lấy tuyến đường cho tài xế (tuyến thuộc ca làm của họ)
  static async getRoutesForDriver(ma_tai_xe) {
    const query = `
      SELECT DISTINCT
        t.ma_tuyen,
        t.ten_tuyen,
        t.diem_bat_dau,
        t.diem_ket_thuc,
        t.do_dai_km,
        l.ma_lich,
        l.ngay_chay,
        l.gio_bat_dau,
        l.gio_ket_thuc,
        l.trang_thai_lich
      FROM tuyenduong t
      JOIN lichtrinh l ON t.ma_tuyen = l.ma_tuyen
      WHERE l.ma_tai_xe = ?
        AND l.trang_thai_lich IN ('cho_chay', 'dang_chay')
        AND (l.ngay_chay = CURDATE() OR l.ngay_chay >= CURDATE())
      ORDER BY l.ngay_chay ASC, l.gio_bat_dau ASC
    `;
    const [rows] = await db.execute(query, [ma_tai_xe]);
    return rows;
  }

  // Lấy tuyến đường cho phụ huynh (tuyến của học sinh là con của họ)
  static async getRoutesForParent(ma_phu_huynh) {
    const query = `
      SELECT DISTINCT
        t.ma_tuyen,
        t.ten_tuyen,
        t.diem_bat_dau,
        t.diem_ket_thuc,
        t.do_dai_km,
        l.ma_lich,
        l.ngay_chay,
        l.gio_bat_dau,
        l.gio_ket_thuc,
        l.trang_thai_lich,
        hs.ma_hs,
        hs.ho_ten as ten_hoc_sinh
      FROM tuyenduong t
      JOIN lichtrinh l ON t.ma_tuyen = l.ma_tuyen
      JOIN phancong pc ON l.ma_lich = pc.ma_lich
      JOIN hocsinh hs ON pc.ma_hs = hs.ma_hs
      WHERE hs.ma_phu_huynh = ?
        AND l.trang_thai_lich IN ('cho_chay', 'dang_chay')
        AND (l.ngay_chay = CURDATE() OR l.ngay_chay >= CURDATE())
      ORDER BY l.ngay_chay ASC, l.gio_bat_dau ASC
    `;
    const [rows] = await db.execute(query, [ma_phu_huynh]);
    return rows;
  }
}

module.exports = Route;
    