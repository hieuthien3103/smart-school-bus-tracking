const db = require('../config/database');

class BusLocation {
  // Lấy vị trí mới nhất của một xe
  static async getLatest(ma_xe) {
    const query = `
      SELECT * FROM vitrixe 
      WHERE ma_xe = ? 
      ORDER BY thoi_gian DESC 
      LIMIT 1
    `;
    const [rows] = await db.execute(query, [ma_xe]);
    return rows[0] || null;
  }

  // Lấy lịch sử vị trí của một xe
  static async getHistory(ma_xe, limit = 100) {
    const query = `
      SELECT * FROM vitrixe 
      WHERE ma_xe = ? 
      ORDER BY thoi_gian DESC 
      LIMIT ?
    `;
    const [rows] = await db.execute(query, [ma_xe, limit]);
    return rows;
  }

  // Lưu vị trí mới của xe
  static async create(data) {
    const { ma_xe, vi_do, kinh_do, toc_do } = data;
    
    if (!ma_xe || vi_do == null || kinh_do == null) {
      throw new Error('Thiếu thông tin vị trí (ma_xe, vi_do, kinh_do)');
    }

    const query = `
      INSERT INTO vitrixe (ma_xe, vi_do, kinh_do, toc_do, thoi_gian)
      VALUES (?, ?, ?, ?, NOW())
    `;
    
    const [result] = await db.execute(query, [
      ma_xe,
      vi_do,
      kinh_do,
      toc_do || null
    ]);

    return {
      ma_vitri: result.insertId,
      ma_xe,
      vi_do,
      kinh_do,
      toc_do: toc_do || null,
      thoi_gian: new Date().toISOString()
    };
  }

  // Lấy vị trí mới nhất của tất cả xe đang hoạt động
  static async getActiveBusesLocations() {
    const query = `
      SELECT v.*, x.bien_so, x.trang_thai, tx.ho_ten as ten_tai_xe
      FROM vitrixe v
      INNER JOIN (
        SELECT ma_xe, MAX(thoi_gian) as latest_time
        FROM vitrixe
        GROUP BY ma_xe
      ) latest ON v.ma_xe = latest.ma_xe AND v.thoi_gian = latest.latest_time
      LEFT JOIN xebuyt x ON v.ma_xe = x.ma_xe
      LEFT JOIN taixe tx ON x.ma_tai_xe = tx.ma_tai_xe
      WHERE x.trang_thai = 'dang_su_dung'
      ORDER BY v.thoi_gian DESC
    `;
    const [rows] = await db.execute(query);
    return rows;
  }
}

module.exports = BusLocation;

