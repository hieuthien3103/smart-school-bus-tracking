const db = require('../config/database');

class Schedule {
  // Lấy tất cả lịch trình
  static async getAll(filters = {}) {
    let query = `
      SELECT 
        l.ma_lich,
        l.ma_tuyen,
        l.ma_xe,
        l.ma_tai_xe,
        l.nhay_chay AS date,
        l.gio_bat_dau,
        l.gio_ket_thuc,
        l.trang_thai_lich AS trang_thai,
        t.ten_tuyen,
        t.diem_bat_dau AS start_point,
        t.diem_ket_thuc AS end_point,
        t.do_dai_km AS distance,
        COUNT(DISTINCT pc.ma_hs) AS so_hoc_sinh
      FROM lichtrinh l
      LEFT JOIN tuyenduong t ON l.ma_tuyen = t.ma_tuyen
      LEFT JOIN phancong pc ON l.ma_lich = pc.ma_lich
      WHERE 1=1
    `;
    const params = [];

    if (filters.ma_tuyen) {
      query += " AND l.ma_tuyen = ?";
      params.push(filters.ma_tuyen);
    }

    if (filters.trang_thai) {
      query += " AND l.trang_thai_lich = ?";
      params.push(filters.trang_thai);
    }

    if (filters.date) {
      query += " AND l.nhay_chay = ?";
      params.push(filters.date);
    }

    query += " GROUP BY l.ma_lich ORDER BY l.nhay_chay DESC, l.gio_bat_dau ASC";

    const [rows] = await db.execute(query, params);
    return rows;
  }

  // Lấy chi tiết 1 lịch trình
  static async getById(ma_lich) {
    const query = `
      SELECT 
        l.ma_lich,
        l.ma_tuyen,
        l.ma_xe,
        l.ma_tai_xe,
        l.nhay_chay AS date,
        l.gio_bat_dau,
        l.gio_ket_thuc,
        l.trang_thai_lich AS trang_thai,
        t.ten_tuyen,
        t.diem_bat_dau AS start_point,
        t.diem_ket_thuc AS end_point,
        t.do_dai_km AS distance,
        COUNT(DISTINCT pc.ma_hs) AS so_hoc_sinh
      FROM lichtrinh l
      LEFT JOIN tuyenduong t ON l.ma_tuyen = t.ma_tuyen
      LEFT JOIN phancong pc ON l.ma_lich = pc.ma_lich
      WHERE l.ma_lich = ?
      GROUP BY l.ma_lich
    `;
    const [rows] = await db.execute(query, [ma_lich]);
    return rows[0] || null;
  }

  // Lấy danh sách học sinh trong lịch trình
  static async getStudents(ma_lich) {
    const query = `
      SELECT 
        hs.ma_hs, hs.ho_ten, hs.lop,
        ph.ho_ten AS ten_phu_huynh, ph.so_dien_thoai AS sdt_phu_huynh
      FROM phancong pc
      JOIN hocsinh hs ON pc.ma_hs = hs.ma_hs
      JOIN phuhuynh ph ON hs.ma_phu_huynh = ph.ma_phu_huynh
      WHERE pc.ma_lich = ?
      ORDER BY hs.lop, hs.ho_ten
    `;
    const [rows] = await db.execute(query, [ma_lich]);
    return rows;
  }

  // Tạo lịch trình
  static async create(data) {
    const { ma_tuyen, ma_xe, ma_tai_xe, nhay_chay, gio_bat_dau, gio_ket_thuc } = data;

    const [result] = await db.execute(
      `INSERT INTO lichtrinh (ma_tuyen, ma_xe, ma_tai_xe, nhay_chay, gio_bat_dau, gio_ket_thuc, trang_thai_lich)
       VALUES (?, ?, ?, ?, ?, ?, 'cho_chay')`,
      [ma_tuyen, ma_xe, ma_tai_xe, nhay_chay, gio_bat_dau, gio_ket_thuc]
    );

    return { ma_lich: result.insertId, ...data, trang_thai: 'cho_chay' };
  }

  // Cập nhật lịch trình
  static async update(ma_lich, data) {
    const { ma_tuyen, ma_xe, ma_tai_xe, nhay_chay, gio_bat_dau, gio_ket_thuc, trang_thai } = data;

    await db.execute(
      `UPDATE lichtrinh 
       SET ma_tuyen=?, ma_xe=?, ma_tai_xe=?, nhay_chay=?, gio_bat_dau=?, gio_ket_thuc=?, trang_thai_lich=?
       WHERE ma_lich=?`,
      [ma_tuyen, ma_xe, ma_tai_xe, nhay_chay, gio_bat_dau, gio_ket_thuc, trang_thai, ma_lich]
    );

    return { ma_lich, ...data };
  }

  // Xóa lịch trình
  static async delete(ma_lich) {
    await db.execute(`DELETE FROM lichtrinh WHERE ma_lich=?`, [ma_lich]);
    return { message: 'Đã xóa lịch trình thành công' };
  }
}

module.exports = Schedule;
