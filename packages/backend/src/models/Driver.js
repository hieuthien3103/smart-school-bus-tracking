const db = require('../config/database');

class Driver {

  // Lấy toàn bộ tài xế
  static async getAll() {
    const [rows] = await db.execute(`
        SELECT 
            t.ma_tai_xe, 
            t.ho_ten, 
            t.so_dien_thoai, 
            t.so_gplx, 
            t.tai_khoan,
            t.mat_khau,
            t.ma_ql,
            t.trang_thai,
<<<<<<< HEAD
            t.kinh_nghiem,     -- thêm cột kinh nghiệm
=======
            t.kinh_nghiem,     -- 🆕 thêm cột kinh nghiệm
>>>>>>> a00a86b85727eebe641474e9b77a5f155a756b65
            
            xb.bien_so AS xe_hien_tai, 
            td.ten_tuyen AS tuyen_hien_tai
            
        FROM taixe t
        LEFT JOIN xebuyt xb 
            ON t.ma_tai_xe = xb.ma_tai_xe
            
        LEFT JOIN lichtrinh lt 
            ON t.ma_tai_xe = lt.ma_tai_xe 
           AND lt.trang_thai_lich IN ('cho_chay', 'dang_chay')
           
        LEFT JOIN tuyenduong td 
            ON lt.ma_tuyen = td.ma_tuyen
        
        ORDER BY t.ma_tai_xe DESC
    `);

    return rows;
  }

  // Lấy 1 tài xế
  static async getById(id) {
    const [rows] = await db.execute(
      `SELECT * FROM taixe WHERE ma_tai_xe = ?`, 
      [id]
    );
    return rows[0];
  }

  // Thêm tài xế
  static async create(data) {
    const { ho_ten, so_dien_thoai, so_gplx, trang_thai, kinh_nghiem } = data;

    const tai_khoan = `tx${Date.now()}`;
    const mat_khau = '123456';

    const [result] = await db.execute(
      `INSERT INTO taixe 
        (ho_ten, so_dien_thoai, so_gplx, trang_thai, tai_khoan, mat_khau, kinh_nghiem)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        ho_ten,
        so_dien_thoai,
        so_gplx,
        trang_thai || 'san_sang',
        tai_khoan,
        mat_khau,
        kinh_nghiem || 5        
      ]
    );

    return { ma_tai_xe: result.insertId, ...data };
  }

  // Cập nhật tài xế
  static async update(id, data) {
    const updates = [];
    const values = [];
    
    if (data.ho_ten !== undefined) {
      updates.push('ho_ten=?');
      values.push(data.ho_ten);
    }
    if (data.so_dien_thoai !== undefined) {
      updates.push('so_dien_thoai=?');
      values.push(data.so_dien_thoai);
    }
    if (data.so_gplx !== undefined) {
      updates.push('so_gplx=?');
      values.push(data.so_gplx);
    }
    if (data.trang_thai !== undefined) {
      updates.push('trang_thai=?');
      values.push(data.trang_thai);
    }
    if (data.kinh_nghiem !== undefined) {   
      updates.push('kinh_nghiem=?');
      values.push(data.kinh_nghiem);
    }

    if (updates.length === 0) {
      throw new Error('No fields provided for update');
    }

    values.push(id);

    await db.execute(
      `UPDATE taixe SET ${updates.join(', ')} WHERE ma_tai_xe=?`,
      values
    );

    return { ma_tai_xe: id, ...data };
  }

  // Xóa tài xế
  static async delete(id) {
    await db.execute(
      `DELETE FROM taixe WHERE ma_tai_xe = ?`, 
      [id]
    );
    return { message: 'Đã xóa tài xế thành công' };
  }
}

module.exports = Driver;
