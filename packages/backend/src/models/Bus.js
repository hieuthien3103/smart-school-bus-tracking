const db = require('../config/database');

class Bus {
  static async getAll() {
    const [rows] = await db.execute(`SELECT * FROM xebuyt ORDER BY ma_xe DESC`);
    return rows;
  }

  static async getById(ma_xe) {
    const [rows] = await db.execute(`SELECT * FROM xebuyt WHERE ma_xe = ?`, [ma_xe]);
    return rows[0];
  }

  static async create(data) {
    const { bien_so, suc_chua, trang_thai } = data;
    const [result] = await db.execute(
      `INSERT INTO xebuyt (bien_so, suc_chua, trang_thai) VALUES (?, ?, ?)`,
      [bien_so, suc_chua, trang_thai || 'san_sang']
    );
    return { ma_xe: result.insertId, ...data };
  }

  static async update(ma_xe, data) {
    const { bien_so, suc_chua, trang_thai } = data;
    await db.execute(
      `UPDATE xebuyt SET bien_so=?, suc_chua=?, trang_thai=? WHERE ma_xe=?`,
      [bien_so, suc_chua, trang_thai, ma_xe]
    );
    return { ma_xe, ...data };
  }

  static async delete(ma_xe) {
    await db.execute(`DELETE FROM xebuyt WHERE ma_xe=?`, [ma_xe]);
    return { message: 'Đã xóa xe buýt thành công' };
  }
}

module.exports = Bus;
