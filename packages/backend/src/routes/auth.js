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

// Get user profile (for token verification)
router.get('/profile', async (req, res) => {
  try {
    // Get token from header
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ 
        success: false, 
        message: 'No token provided' 
      });
    }

    // In a real app, decode JWT token to get user info
    // For now, return mock profile based on localStorage
    // Since we don't have real JWT, just return success
    return res.json({
      success: true,
      data: null, // Frontend will use localStorage data
      message: 'Profile endpoint - use localStorage data'
    });
  } catch (err) {
    res.status(500).json({ 
      success: false, 
      message: 'Lỗi máy chủ', 
      error: err.message 
    });
  }
});

// Logout endpoint
router.post('/logout', async (req, res) => {
  try {
    // In a real app, invalidate token here
    res.json({
      success: true,
      message: 'Đăng xuất thành công'
    });
  } catch (err) {
    res.status(500).json({ 
      success: false, 
      message: 'Lỗi máy chủ', 
      error: err.message 
    });
  }
});

// Refresh token endpoint
router.post('/refresh', async (req, res) => {
  try {
    const { refreshToken } = req.body;
    
    if (!refreshToken) {
      return res.status(401).json({ 
        success: false, 
        message: 'No refresh token provided' 
      });
    }

    // In a real app, verify refresh token and issue new access token
    // For now, return mock tokens
    return res.json({
      success: true,
      data: {
        token: 'dummy-token-refreshed',
        refreshToken: 'dummy-refresh-new',
        expiresIn: 3600
      }
    });
  } catch (err) {
    res.status(500).json({ 
      success: false, 
      message: 'Lỗi máy chủ', 
      error: err.message 
    });
  }
});

module.exports = router;
