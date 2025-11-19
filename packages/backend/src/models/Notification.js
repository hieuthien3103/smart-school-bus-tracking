const db = require('../config/database');

class Notification {
  static async getAll(filters = {}) {
    const conditions = [];
    const values = [];

    if (filters.ma_phu_huynh) {
      conditions.push('ma_phu_huynh = ?');
      values.push(filters.ma_phu_huynh);
    }

    if (filters.ma_tai_xe) {
      conditions.push('ma_tai_xe = ?');
      values.push(filters.ma_tai_xe);
    }

    const whereClause = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

    const query = `
      SELECT ma_tb, noi_dung, thoi_gian, ma_phu_huynh, ma_tai_xe
      FROM thongbao
      ${whereClause}
      ORDER BY thoi_gian DESC
    `;

    const [rows] = await db.execute(query, values);
    return rows;
  }

  static async getById(ma_tb) {
    const query = `
      SELECT ma_tb, noi_dung, thoi_gian, ma_phu_huynh, ma_tai_xe
      FROM thongbao
      WHERE ma_tb = ?
    `;
    const [rows] = await db.execute(query, [ma_tb]);
    return rows[0];
  }

  static async create(data) {
    const { noi_dung, ma_phu_huynh, ma_tai_xe } = data;
    const query = `
      INSERT INTO thongbao (noi_dung, ma_phu_huynh, ma_tai_xe)
      VALUES (?, ?, ?)
    `;
    const [result] = await db.execute(query, [
      noi_dung,
      ma_phu_huynh || null,
      ma_tai_xe || null,
    ]);

    return this.getById(result.insertId);
  }

  static async delete(ma_tb) {
    const query = 'DELETE FROM thongbao WHERE ma_tb = ?';
    await db.execute(query, [ma_tb]);
    return { message: 'Xóa thông báo thành công' };
  }
}

module.exports = Notification;
