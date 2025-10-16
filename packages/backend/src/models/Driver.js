const db = require('../config/database');

class Driver {
  static async getAll() {
    const [rows] = await db.execute(`SELECT * FROM taixe ORDER BY ma_tai_xe DESC`);
    return rows;
  }

  static async getById(id) {
    const [rows] = await db.execute(`SELECT * FROM taixe WHERE ma_tai_xe = ?`, [id]);
    return rows[0];
  }

  static async create(data) {
    const { ho_ten, so_dien_thoai, so_gplx, trang_thai } = data;
    const [result] = await db.execute(
      `INSERT INTO taixe (ho_ten, so_dien_thoai, so_gplx, trang_thai) VALUES (?, ?, ?, ?)`,
      [ho_ten, so_dien_thoai, so_gplx, trang_thai || 'san_sang']
    );
    return { ma_tai_xe: result.insertId, ...data };
  }

  static async update(id, data) {
    const { ho_ten, so_dien_thoai, so_gplx, trang_thai } = data;
    await db.execute(
      `UPDATE taixe SET ho_ten=?, so_dien_thoai=?, so_gplx=?, trang_thai=? WHERE ma_tai_xe=?`,
      [ho_ten, so_dien_thoai, so_gplx, trang_thai, id]
    );
    return { ma_tai_xe: id, ...data };
  }

  static async delete(id) {
    await db.execute(`DELETE FROM taixe WHERE ma_tai_xe = ?`, [id]);
    return { message: 'Đã xóa tài xế thành công' };
  }
}

module.exports = Driver;
