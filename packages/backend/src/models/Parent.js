const db = require('../config/database');

class Parent {
  static async getAll() {
    const query = `
      SELECT ma_phu_huynh, ho_ten, so_dien_thoai, email, dia_chi, tai_khoan
      FROM phuhuynh
      ORDER BY ho_ten ASC
    `;
    const [rows] = await db.execute(query);
    return rows;
  }

  static async getById(ma_phu_huynh) {
    const query = `
      SELECT ma_phu_huynh, ho_ten, so_dien_thoai, email, dia_chi, tai_khoan
      FROM phuhuynh
      WHERE ma_phu_huynh = ?
    `;
    const [rows] = await db.execute(query, [ma_phu_huynh]);
    return rows[0];
  }

  static async create(data) {
    const { ho_ten, so_dien_thoai, email, dia_chi, tai_khoan, mat_khau } = data;
    const query = `
      INSERT INTO phuhuynh (ho_ten, so_dien_thoai, email, dia_chi, tai_khoan, mat_khau)
      VALUES (?, ?, ?, ?, ?, ?)
    `;
    const [result] = await db.execute(query, [
      ho_ten,
      so_dien_thoai,
      email || null,
      dia_chi || null,
      tai_khoan,
      mat_khau,
    ]);

    return {
      ma_phu_huynh: result.insertId,
      ho_ten,
      so_dien_thoai,
      email: email || null,
      dia_chi: dia_chi || null,
      tai_khoan,
    };
  }

  static async update(ma_phu_huynh, data) {
    const { ho_ten, so_dien_thoai, email, dia_chi, tai_khoan, mat_khau } = data;

    const fields = [];
    const values = [];

    if (ho_ten !== undefined) {
      fields.push('ho_ten = ?');
      values.push(ho_ten);
    }
    if (so_dien_thoai !== undefined) {
      fields.push('so_dien_thoai = ?');
      values.push(so_dien_thoai);
    }
    if (email !== undefined) {
      fields.push('email = ?');
      values.push(email);
    }
    if (dia_chi !== undefined) {
      fields.push('dia_chi = ?');
      values.push(dia_chi);
    }
    if (tai_khoan !== undefined) {
      fields.push('tai_khoan = ?');
      values.push(tai_khoan);
    }
    if (mat_khau !== undefined) {
      fields.push('mat_khau = ?');
      values.push(mat_khau);
    }

    if (!fields.length) {
      return this.getById(ma_phu_huynh);
    }

    const query = `
      UPDATE phuhuynh
      SET ${fields.join(', ')}
      WHERE ma_phu_huynh = ?
    `;

    values.push(ma_phu_huynh);
    await db.execute(query, values);

    return this.getById(ma_phu_huynh);
  }

  static async delete(ma_phu_huynh) {
    const query = 'DELETE FROM phuhuynh WHERE ma_phu_huynh = ?';
    await db.execute(query, [ma_phu_huynh]);
    return { message: 'Xóa phụ huynh thành công' };
  }
}

module.exports = Parent;
