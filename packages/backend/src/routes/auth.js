const express = require('express');
const router = express.Router();
const mysql = require('mysql2/promise');
require('dotenv').config();

// Tạo pool kết nối MySQL
const db = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'ssb1',
  port: process.env.DB_PORT ? parseInt(process.env.DB_PORT) : 3306,
});

// Đăng nhập phân quyền
router.post('/login', async (req, res) => {
  const { username, password } = req.body;
  try {
    // 1. Check admin
    const [adminRows] = await db.query(
      'SELECT * FROM quanlytaixe WHERE tai_khoan = ? AND mat_khau = ?',
      [username, password]
    );
    if (adminRows.length > 0) {
      return res.json({
        success: true,
        data: {
          user: { ...adminRows[0], role: 'admin' },
          token: 'dummy-token',
          refreshToken: 'dummy-refresh',
          expiresIn: 3600
        }
      });
    }
    // 2. Check parent
    const [parentRows] = await db.query(
      'SELECT * FROM phuhuynh WHERE tai_khoan = ? AND mat_khau = ?',
      [username, password]
    );
    if (parentRows.length > 0) {
      return res.json({
        success: true,
        data: {
          user: { ...parentRows[0], role: 'parent' },
          token: 'dummy-token',
          refreshToken: 'dummy-refresh',
          expiresIn: 3600
        }
      });
    }
    // 3. Check driver
    const [driverRows] = await db.query(
      'SELECT * FROM taixe WHERE tai_khoan = ? AND mat_khau = ?',
      [username, password]
    );
    if (driverRows.length > 0) {
      return res.json({
        success: true,
        data: {
          user: { ...driverRows[0], role: 'driver' },
          token: 'dummy-token',
          refreshToken: 'dummy-refresh',
          expiresIn: 3600
        }
      });
    }
    // 4. Not found
    res.status(401).json({ success: false, message: 'Sai tài khoản hoặc mật khẩu' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Lỗi máy chủ', error: err.message });
  }
});

module.exports = router;
