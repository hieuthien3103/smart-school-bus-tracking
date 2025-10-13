const express = require('express');
const { query } = require('../config/database');

const router = express.Router();

// Lấy tất cả buses
router.get('/', async (req, res) => {
  try {
    // Query đơn giản trước để test
    const buses = await query(`
      SELECT * FROM buses 
      ORDER BY id
    `);

    res.json({
      success: true,
      data: buses
    });

  } catch (error) {
    console.error('Get buses error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server nội bộ',
      error: error.message
    });
  }
});

// Lấy bus theo ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const buses = await query(
      `SELECT b.*, s.name as school_name, d.name as driver_name 
       FROM buses b 
       LEFT JOIN schools s ON b.school_id = s.id 
       LEFT JOIN drivers dr ON b.id = dr.bus_id 
       LEFT JOIN users d ON dr.user_id = d.id 
       WHERE b.id = ?`,
      [id]
    );

    if (buses.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Xe bus không tồn tại'
      });
    }

    res.json({
      success: true,
      data: buses[0]
    });

  } catch (error) {
    console.error('Get bus error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server nội bộ'
    });
  }
});

// Tạo bus mới
router.post('/', async (req, res) => {
  try {
    const {
      bus_number,
      license_plate,
      model,
      capacity,
      year_manufactured,
      fuel_type,
      status,
      last_maintenance_date,
      next_maintenance_date,
      insurance_expiry,
      inspection_expiry
    } = req.body;

    // Validation
    if (!bus_number || !license_plate || !capacity) {
      return res.status(400).json({
        success: false,
        message: 'Thiếu thông tin bắt buộc: bus_number, license_plate, capacity'
      });
    }

    // Check duplicate bus_number
    const existingBus = await query(
      'SELECT id FROM buses WHERE bus_number = ? OR license_plate = ?',
      [bus_number, license_plate]
    );

    if (existingBus.length > 0) {
      return res.status(409).json({
        success: false,
        message: 'Số xe hoặc biển số đã tồn tại'
      });
    }

    // Insert new bus
    const result = await query(
      `INSERT INTO buses (
        bus_number, license_plate, model, capacity, year_manufactured,
        fuel_type, status, last_maintenance_date, next_maintenance_date,
        insurance_expiry, inspection_expiry
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        bus_number,
        license_plate,
        model || null,
        capacity,
        year_manufactured || null,
        fuel_type || 'diesel',
        status || 'active',
        last_maintenance_date || null,
        next_maintenance_date || null,
        insurance_expiry || null,
        inspection_expiry || null
      ]
    );

    // Get created bus
    const newBus = await query('SELECT * FROM buses WHERE id = ?', [result.insertId]);

    res.status(201).json({
      success: true,
      message: 'Tạo xe bus thành công',
      data: newBus[0]
    });

  } catch (error) {
    console.error('Create bus error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server nội bộ',
      error: error.message
    });
  }
});

// Cập nhật bus
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const {
      bus_number,
      license_plate,
      model,
      capacity,
      year_manufactured,
      fuel_type,
      status,
      last_maintenance_date,
      next_maintenance_date,
      insurance_expiry,
      inspection_expiry
    } = req.body;

    // Check if bus exists
    const existingBus = await query('SELECT * FROM buses WHERE id = ?', [id]);
    if (existingBus.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Xe bus không tồn tại'
      });
    }

    // Check duplicate bus_number/license_plate (excluding current bus)
    if (bus_number || license_plate) {
      const duplicate = await query(
        'SELECT id FROM buses WHERE (bus_number = ? OR license_plate = ?) AND id != ?',
        [bus_number || '', license_plate || '', id]
      );

      if (duplicate.length > 0) {
        return res.status(409).json({
          success: false,
          message: 'Số xe hoặc biển số đã tồn tại'
        });
      }
    }

    // Build update query dynamically
    const updates = [];
    const values = [];

    if (bus_number !== undefined) {
      updates.push('bus_number = ?');
      values.push(bus_number);
    }
    if (license_plate !== undefined) {
      updates.push('license_plate = ?');
      values.push(license_plate);
    }
    if (model !== undefined) {
      updates.push('model = ?');
      values.push(model);
    }
    if (capacity !== undefined) {
      updates.push('capacity = ?');
      values.push(capacity);
    }
    if (year_manufactured !== undefined) {
      updates.push('year_manufactured = ?');
      values.push(year_manufactured);
    }
    if (fuel_type !== undefined) {
      updates.push('fuel_type = ?');
      values.push(fuel_type);
    }
    if (status !== undefined) {
      updates.push('status = ?');
      values.push(status);
    }
    if (last_maintenance_date !== undefined) {
      updates.push('last_maintenance_date = ?');
      values.push(last_maintenance_date);
    }
    if (next_maintenance_date !== undefined) {
      updates.push('next_maintenance_date = ?');
      values.push(next_maintenance_date);
    }
    if (insurance_expiry !== undefined) {
      updates.push('insurance_expiry = ?');
      values.push(insurance_expiry);
    }
    if (inspection_expiry !== undefined) {
      updates.push('inspection_expiry = ?');
      values.push(inspection_expiry);
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
      `UPDATE buses SET ${updates.join(', ')} WHERE id = ?`,
      values
    );

    // Get updated bus
    const updatedBus = await query('SELECT * FROM buses WHERE id = ?', [id]);

    res.json({
      success: true,
      message: 'Cập nhật xe bus thành công',
      data: updatedBus[0]
    });

  } catch (error) {
    console.error('Update bus error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server nội bộ',
      error: error.message
    });
  }
});

// Xóa bus
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // Check if bus exists
    const existingBus = await query('SELECT * FROM buses WHERE id = ?', [id]);
    if (existingBus.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Xe bus không tồn tại'
      });
    }

    // Check if bus is assigned to any driver
    const assignedDrivers = await query(
      'SELECT id FROM drivers WHERE current_bus_id = ?',
      [id]
    );

    if (assignedDrivers.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Không thể xóa xe bus đang được phân công cho tài xế. Vui lòng hủy phân công trước.'
      });
    }

    // Delete bus
    await query('DELETE FROM buses WHERE id = ?', [id]);

    res.json({
      success: true,
      message: 'Xóa xe bus thành công'
    });

  } catch (error) {
    console.error('Delete bus error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server nội bộ',
      error: error.message
    });
  }
});

// Cập nhật trạng thái bus
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
    const validStatuses = ['active', 'maintenance', 'retired', 'breakdown'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Trạng thái không hợp lệ. Chỉ chấp nhận: ' + validStatuses.join(', ')
      });
    }

    // Check if bus exists
    const existingBus = await query('SELECT * FROM buses WHERE id = ?', [id]);
    if (existingBus.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Xe bus không tồn tại'
      });
    }

    // Update status
    await query('UPDATE buses SET status = ? WHERE id = ?', [status, id]);

    // Get updated bus
    const updatedBus = await query('SELECT * FROM buses WHERE id = ?', [id]);

    // Broadcast status change via Socket.IO (if available)
    const io = req.app.get('io');
    if (io) {
      io.emit('busStatusUpdate', {
        busId: id,
        status: status,
        timestamp: new Date().toISOString()
      });
    }

    res.json({
      success: true,
      message: 'Cập nhật trạng thái thành công',
      data: updatedBus[0]
    });

  } catch (error) {
    console.error('Update bus status error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server nội bộ',
      error: error.message
    });
  }
});

module.exports = router;