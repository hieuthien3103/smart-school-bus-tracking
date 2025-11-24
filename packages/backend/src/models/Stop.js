const db = require('../config/database');

class Stop {
  static async getAll() {
    const query = `
      SELECT ma_tram, ten_tram, dia_chi, loai_tram, vi_do, kinh_do
      FROM tramxe
      ORDER BY ten_tram ASC
    `;
    const [rows] = await db.execute(query);
    return rows;
  }

  static async getById(ma_tram) {
    const query = `
      SELECT ma_tram, ten_tram, dia_chi, loai_tram, vi_do, kinh_do
      FROM tramxe
      WHERE ma_tram = ?
    `;
    const [rows] = await db.execute(query, [ma_tram]);
    return rows[0];
  }

  static async create(data) {
    const { ten_tram, dia_chi, loai_tram, vi_do, kinh_do } = data;
    const query = `
      INSERT INTO tramxe (ten_tram, dia_chi, loai_tram, vi_do, kinh_do)
      VALUES (?, ?, ?, ?, ?)
    `;
    const [result] = await db.execute(query, [
      ten_tram,
      dia_chi || null,
      loai_tram || 'ca_hai',
      vi_do || null,
      kinh_do || null,
    ]);

    return {
      ma_tram: result.insertId,
      ten_tram,
      dia_chi: dia_chi || null,
      loai_tram: loai_tram || 'ca_hai',
      vi_do: vi_do || null,
      kinh_do: kinh_do || null,
    };
  }

  static async update(ma_tram, data) {
    const { ten_tram, dia_chi, loai_tram, vi_do, kinh_do } = data;

    const fields = [];
    const values = [];

    if (ten_tram !== undefined) {
      fields.push('ten_tram = ?');
      values.push(ten_tram);
    }
    if (dia_chi !== undefined) {
      fields.push('dia_chi = ?');
      values.push(dia_chi);
    }
    if (loai_tram !== undefined) {
      fields.push('loai_tram = ?');
      values.push(loai_tram);
    }
    if (vi_do !== undefined) {
      fields.push('vi_do = ?');
      values.push(vi_do);
    }
    if (kinh_do !== undefined) {
      fields.push('kinh_do = ?');
      values.push(kinh_do);
    }

    if (!fields.length) {
      return this.getById(ma_tram);
    }

    const query = `
      UPDATE tramxe
      SET ${fields.join(', ')}
      WHERE ma_tram = ?
    `;

    values.push(ma_tram);
    await db.execute(query, values);

    return this.getById(ma_tram);
  }

  static async delete(ma_tram) {
    const query = 'DELETE FROM tramxe WHERE ma_tram = ?';
    await db.execute(query, [ma_tram]);
    return { message: 'Xóa trạm xe thành công' };
  }
}

module.exports = Stop;
