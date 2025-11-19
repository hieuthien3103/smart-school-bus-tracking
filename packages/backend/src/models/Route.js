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
}

module.exports = Route;
    