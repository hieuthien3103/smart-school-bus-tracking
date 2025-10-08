const express = require('express');
const { query } = require('../config/database');

const router = express.Router();

// Lấy tất cả users
router.get('/', async (req, res) => {
  try {
    const { role, status, page = 1, limit = 10 } = req.query;
    
    let sql = 'SELECT id, name, email, role, phone, status, created_at, updated_at FROM users WHERE 1=1';
    const params = [];

    if (role) {
      sql += ' AND role = ?';
      params.push(role);
    }

    if (status) {
      sql += ' AND status = ?';
      params.push(status);
    }

    // Pagination
    const offset = (page - 1) * limit;
    sql += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
    params.push(parseInt(limit), parseInt(offset));

    const users = await query(sql, params);

    // Count total
    let countSql = 'SELECT COUNT(*) as total FROM users WHERE 1=1';
    const countParams = [];

    if (role) {
      countSql += ' AND role = ?';
      countParams.push(role);
    }

    if (status) {
      countSql += ' AND status = ?';
      countParams.push(status);
    }

    const totalResult = await query(countSql, countParams);
    const total = totalResult[0].total;

    res.json({
      success: true,
      data: users,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server nội bộ'
    });
  }
});

// Lấy user theo ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const users = await query(
      'SELECT id, name, email, role, phone, status, created_at, updated_at FROM users WHERE id = ?',
      [id]
    );

    if (users.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Người dùng không tồn tại'
      });
    }

    res.json({
      success: true,
      data: users[0]
    });

  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server nội bộ'
    });
  }
});

// Lấy users theo role
router.get('/role/:role', async (req, res) => {
  try {
    const { role } = req.params;

    const users = await query(
      'SELECT id, name, email, role, phone, status, created_at FROM users WHERE role = ? AND status = "active"',
      [role]
    );

    res.json({
      success: true,
      data: users
    });

  } catch (error) {
    console.error('Get users by role error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server nội bộ'
    });
  }
});

// Tạo user mới
router.post('/', async (req, res) => {
  try {
    const { name, email, password, role, phone } = req.body;

    // Validation
    if (!name || !email || !password || !role) {
      return res.status(400).json({
        success: false,
        message: 'Tên, email, password và role là bắt buộc'
      });
    }

    // Kiểm tra email đã tồn tại
    const existingUsers = await query('SELECT id FROM users WHERE email = ?', [email]);
    if (existingUsers.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Email đã được sử dụng'
      });
    }

    // Hash password
    const bcrypt = require('bcryptjs');
    const hashedPassword = await bcrypt.hash(password, 12);

    // Insert user
    const result = await query(
      'INSERT INTO users (name, email, password, role, phone, status) VALUES (?, ?, ?, ?, ?, "active")',
      [name, email, hashedPassword, role, phone || null]
    );

    // Lấy user vừa tạo
    const newUsers = await query(
      'SELECT id, name, email, role, phone, status, created_at FROM users WHERE id = ?',
      [result.insertId]
    );

    res.status(201).json({
      success: true,
      message: 'Tạo người dùng thành công',
      data: newUsers[0]
    });

  } catch (error) {
    console.error('Create user error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server nội bộ'
    });
  }
});

// Cập nhật user
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, role, phone, status } = req.body;

    // Kiểm tra user tồn tại
    const existingUsers = await query('SELECT id FROM users WHERE id = ?', [id]);
    if (existingUsers.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Người dùng không tồn tại'
      });
    }

    // Kiểm tra email trùng (nếu email thay đổi)
    if (email) {
      const emailUsers = await query('SELECT id FROM users WHERE email = ? AND id != ?', [email, id]);
      if (emailUsers.length > 0) {
        return res.status(400).json({
          success: false,
          message: 'Email đã được sử dụng'
        });
      }
    }

    // Cập nhật
    const updates = [];
    const params = [];

    if (name) {
      updates.push('name = ?');
      params.push(name);
    }
    if (email) {
      updates.push('email = ?');
      params.push(email);
    }
    if (role) {
      updates.push('role = ?');
      params.push(role);
    }
    if (phone !== undefined) {
      updates.push('phone = ?');
      params.push(phone);
    }
    if (status) {
      updates.push('status = ?');
      params.push(status);
    }

    if (updates.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Không có dữ liệu để cập nhật'
      });
    }

    updates.push('updated_at = CURRENT_TIMESTAMP');
    params.push(id);

    await query(`UPDATE users SET ${updates.join(', ')} WHERE id = ?`, params);

    // Lấy user đã cập nhật
    const updatedUsers = await query(
      'SELECT id, name, email, role, phone, status, created_at, updated_at FROM users WHERE id = ?',
      [id]
    );

    res.json({
      success: true,
      message: 'Cập nhật người dùng thành công',
      data: updatedUsers[0]
    });

  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server nội bộ'
    });
  }
});

// Xóa user
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // Kiểm tra user tồn tại
    const existingUsers = await query('SELECT id FROM users WHERE id = ?', [id]);
    if (existingUsers.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Người dùng không tồn tại'
      });
    }

    // Soft delete (đặt status = 'deleted')
    await query('UPDATE users SET status = "deleted", updated_at = CURRENT_TIMESTAMP WHERE id = ?', [id]);

    res.json({
      success: true,
      message: 'Xóa người dùng thành công'
    });

  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server nội bộ'
    });
  }
});

module.exports = router;