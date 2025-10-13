const express = require('express');
const { query } = require('../config/database');

const router = express.Router();

// Lấy tất cả drivers
router.get('/', async (req, res) => {
  try {
    // Query đơn giản trước để test
    const drivers = await query(`
      SELECT * FROM drivers 
      ORDER BY id
    `);

    res.json({
      success: true,
      data: drivers
    });

  } catch (error) {
    console.error('Get drivers error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server nội bộ',
      error: error.message
    });
  }
});

// Lấy driver theo ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const drivers = await query(`
      SELECT d.*, u.name, u.email, u.phone, b.license_plate 
      FROM drivers d 
      JOIN users u ON d.user_id = u.id 
      LEFT JOIN buses b ON d.current_bus_id = b.id 
      WHERE d.id = ?
    `, [id]);

    if (drivers.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Tài xế không tồn tại'
      });
    }

    res.json({
      success: true,
      data: drivers[0]
    });

  } catch (error) {
    console.error('Get driver error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server nội bộ'
    });
  }
});

// Tạo driver mới
router.post('/', async (req, res) => {
  try {
    const {
      user_id,
      employee_id,
      license_number,
      license_type,
      license_expiry,
      experience_years,
      current_bus_id,
      status,
      hire_date,
      emergency_contact_name,
      emergency_contact_phone
    } = req.body;

    // Validation
    if (!user_id || !employee_id || !license_number || !license_type || !license_expiry) {
      return res.status(400).json({
        success: false,
        message: 'Thiếu thông tin bắt buộc: user_id, employee_id, license_number, license_type, license_expiry'
      });
    }

    // Check if user_id exists
    const user = await query('SELECT id FROM users WHERE id = ?', [user_id]);
    if (user.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'User ID không tồn tại'
      });
    }

    // Check duplicate employee_id or license_number
    const existingDriver = await query(
      'SELECT id FROM drivers WHERE employee_id = ? OR license_number = ?',
      [employee_id, license_number]
    );

    if (existingDriver.length > 0) {
      return res.status(409).json({
        success: false,
        message: 'Mã nhân viên hoặc số GPLX đã tồn tại'
      });
    }

    // Check if bus exists and is not assigned to another driver
    if (current_bus_id) {
      const bus = await query('SELECT id FROM buses WHERE id = ?', [current_bus_id]);
      if (bus.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'ID xe bus không tồn tại'
        });
      }

      const assignedDriver = await query(
        'SELECT id FROM drivers WHERE current_bus_id = ? AND status = "active"',
        [current_bus_id]
      );
      if (assignedDriver.length > 0) {
        return res.status(400).json({
          success: false,
          message: 'Xe bus đã được phân công cho tài xế khác'
        });
      }
    }

    // Insert new driver
    const result = await query(
      `INSERT INTO drivers (
        user_id, employee_id, license_number, license_type, license_expiry,
        experience_years, current_bus_id, status, hire_date,
        emergency_contact_name, emergency_contact_phone
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        user_id,
        employee_id,
        license_number,
        license_type,
        license_expiry,
        experience_years || 0,
        current_bus_id || null,
        status || 'active',
        hire_date || null,
        emergency_contact_name || null,
        emergency_contact_phone || null
      ]
    );

    // Get created driver with user info
    const newDriver = await query(`
      SELECT d.*, u.name, u.email, u.phone 
      FROM drivers d 
      JOIN users u ON d.user_id = u.id 
      WHERE d.id = ?
    `, [result.insertId]);

    res.status(201).json({
      success: true,
      message: 'Tạo tài xế thành công',
      data: newDriver[0]
    });

  } catch (error) {
    console.error('Create driver error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server nội bộ',
      error: error.message
    });
  }
});

// Cập nhật driver
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const {
      employee_id,
      license_number,
      license_type,
      license_expiry,
      experience_years,
      current_bus_id,
      status,
      hire_date,
      emergency_contact_name,
      emergency_contact_phone
    } = req.body;

    // Check if driver exists
    const existingDriver = await query('SELECT * FROM drivers WHERE id = ?', [id]);
    if (existingDriver.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Tài xế không tồn tại'
      });
    }

    // Check duplicate employee_id/license_number (excluding current driver)
    if (employee_id || license_number) {
      const duplicate = await query(
        'SELECT id FROM drivers WHERE (employee_id = ? OR license_number = ?) AND id != ?',
        [employee_id || '', license_number || '', id]
      );

      if (duplicate.length > 0) {
        return res.status(409).json({
          success: false,
          message: 'Mã nhân viên hoặc số GPLX đã tồn tại'
        });
      }
    }

    // Check bus assignment
    if (current_bus_id && current_bus_id !== existingDriver[0].current_bus_id) {
      const bus = await query('SELECT id FROM buses WHERE id = ?', [current_bus_id]);
      if (bus.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'ID xe bus không tồn tại'
        });
      }

      const assignedDriver = await query(
        'SELECT id FROM drivers WHERE current_bus_id = ? AND status = "active" AND id != ?',
        [current_bus_id, id]
      );
      if (assignedDriver.length > 0) {
        return res.status(400).json({
          success: false,
          message: 'Xe bus đã được phân công cho tài xế khác'
        });
      }
    }

    // Build update query dynamically
    const updates = [];
    const values = [];

    if (employee_id !== undefined) {
      updates.push('employee_id = ?');
      values.push(employee_id);
    }
    if (license_number !== undefined) {
      updates.push('license_number = ?');
      values.push(license_number);
    }
    if (license_type !== undefined) {
      updates.push('license_type = ?');
      values.push(license_type);
    }
    if (license_expiry !== undefined) {
      updates.push('license_expiry = ?');
      values.push(license_expiry);
    }
    if (experience_years !== undefined) {
      updates.push('experience_years = ?');
      values.push(experience_years);
    }
    if (current_bus_id !== undefined) {
      updates.push('current_bus_id = ?');
      values.push(current_bus_id);
    }
    if (status !== undefined) {
      updates.push('status = ?');
      values.push(status);
    }
    if (hire_date !== undefined) {
      updates.push('hire_date = ?');
      values.push(hire_date);
    }
    if (emergency_contact_name !== undefined) {
      updates.push('emergency_contact_name = ?');
      values.push(emergency_contact_name);
    }
    if (emergency_contact_phone !== undefined) {
      updates.push('emergency_contact_phone = ?');
      values.push(emergency_contact_phone);
    }

    if (updates.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Không có thông tin nào để cập nhật'
      });
    }

    // Add id to values for WHERE clause
    values.push(id);

    // Execute update
    await query(
      `UPDATE drivers SET ${updates.join(', ')} WHERE id = ?`,
      values
    );

    // Get updated driver with user info
    const updatedDriver = await query(`
      SELECT d.*, u.name, u.email, u.phone, b.license_plate 
      FROM drivers d 
      JOIN users u ON d.user_id = u.id 
      LEFT JOIN buses b ON d.current_bus_id = b.id 
      WHERE d.id = ?
    `, [id]);

    res.json({
      success: true,
      message: 'Cập nhật tài xế thành công',
      data: updatedDriver[0]
    });

  } catch (error) {
    console.error('Update driver error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server nội bộ',
      error: error.message
    });
  }
});

// Xóa driver
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // Check if driver exists
    const existingDriver = await query('SELECT * FROM drivers WHERE id = ?', [id]);
    if (existingDriver.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Tài xế không tồn tại'
      });
    }

    // Check if driver is currently assigned to a bus and active
    if (existingDriver[0].current_bus_id && existingDriver[0].status === 'active') {
      return res.status(400).json({
        success: false,
        message: 'Không thể xóa tài xế đang hoạt động. Vui lòng cập nhật trạng thái trước.'
      });
    }

    // Delete driver (Note: This might fail due to foreign key constraints)
    // In production, you might want to set status to 'deleted' instead
    await query('DELETE FROM drivers WHERE id = ?', [id]);

    res.json({
      success: true,
      message: 'Xóa tài xế thành công'
    });

  } catch (error) {
    console.error('Delete driver error:', error);
    
    // If foreign key constraint error, suggest soft delete
    if (error.code === 'ER_ROW_IS_REFERENCED_2') {
      return res.status(400).json({
        success: false,
        message: 'Không thể xóa tài xế có dữ liệu liên quan. Vui lòng cập nhật trạng thái thành "retired".'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Lỗi server nội bộ',
      error: error.message
    });
  }
});

// Cập nhật trạng thái driver
router.patch('/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({
        success: false,
        message: 'Thiếu thông tin trạng thái'
      });
    }

    // Validate status
    const validStatuses = ['active', 'on_leave', 'suspended', 'retired'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Trạng thái không hợp lệ. Chỉ chấp nhận: ' + validStatuses.join(', ')
      });
    }

    // Check if driver exists
    const existingDriver = await query('SELECT * FROM drivers WHERE id = ?', [id]);
    if (existingDriver.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Tài xế không tồn tại'
      });
    }

    // If setting to inactive, remove bus assignment
    if (status !== 'active' && existingDriver[0].current_bus_id) {
      await query('UPDATE drivers SET status = ?, current_bus_id = NULL WHERE id = ?', [status, id]);
    } else {
      await query('UPDATE drivers SET status = ? WHERE id = ?', [status, id]);
    }

    // Get updated driver
    const updatedDriver = await query(`
      SELECT d.*, u.name, u.email, u.phone 
      FROM drivers d 
      JOIN users u ON d.user_id = u.id 
      WHERE d.id = ?
    `, [id]);

    // Broadcast status change via Socket.IO (if available)
    const io = req.app.get('io');
    if (io) {
      io.emit('driverStatusUpdate', {
        driverId: id,
        status: status,
        timestamp: new Date().toISOString()
      });
    }

    res.json({
      success: true,
      message: 'Cập nhật trạng thái tài xế thành công',
      data: updatedDriver[0]
    });

  } catch (error) {
    console.error('Update driver status error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server nội bộ',
      error: error.message
    });
  }
});

// Phân công xe bus cho tài xế
router.patch('/:id/assign-bus', async (req, res) => {
  try {
    const { id } = req.params;
    const { bus_id } = req.body;

    if (!bus_id) {
      return res.status(400).json({
        success: false,
        message: 'Thiếu ID xe bus'
      });
    }

    // Check if driver exists and is active
    const driver = await query('SELECT * FROM drivers WHERE id = ?', [id]);
    if (driver.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Tài xế không tồn tại'
      });
    }

    if (driver[0].status !== 'active') {
      return res.status(400).json({
        success: false,
        message: 'Chỉ có thể phân công cho tài xế đang hoạt động'
      });
    }

    // Check if bus exists and is available
    const bus = await query('SELECT * FROM buses WHERE id = ? AND status = "active"', [bus_id]);
    if (bus.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Xe bus không tồn tại hoặc không hoạt động'
      });
    }

    // Check if bus is already assigned
    const assignedDriver = await query(
      'SELECT id FROM drivers WHERE current_bus_id = ? AND status = "active"',
      [bus_id]
    );
    if (assignedDriver.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Xe bus đã được phân công cho tài xế khác'
      });
    }

    // Update driver's bus assignment
    await query('UPDATE drivers SET current_bus_id = ? WHERE id = ?', [bus_id, id]);

    // Get updated driver info
    const updatedDriver = await query(`
      SELECT d.*, u.name, b.bus_number, b.license_plate 
      FROM drivers d 
      JOIN users u ON d.user_id = u.id 
      LEFT JOIN buses b ON d.current_bus_id = b.id 
      WHERE d.id = ?
    `, [id]);

    res.json({
      success: true,
      message: 'Phân công xe bus thành công',
      data: updatedDriver[0]
    });

  } catch (error) {
    console.error('Assign bus error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server nội bộ',
      error: error.message
    });
  }
});

module.exports = router;