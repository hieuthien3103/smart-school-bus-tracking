const express = require('express');
const { query } = require('../config/database');

const router = express.Router();

// GET /api/schedules - Get all schedules with filters
router.get('/', async (req, res) => {
  try {
    const { route_id, bus_id, driver_id, date, status = 'active' } = req.query;
    
    let baseQuery = `
      SELECT 
        s.*,
        r.route_name,
        b.license_plate,
        b.bus_number,
        d.employee_id as driver_employee_id,
        u.name as driver_name
      FROM schedules s
      LEFT JOIN routes r ON s.route_id = r.id
      LEFT JOIN buses b ON s.bus_id = b.id
      LEFT JOIN drivers d ON s.driver_id = d.id
      LEFT JOIN users u ON d.user_id = u.id
      WHERE 1=1
    `;

    const params = [];

    // Apply filters
    if (route_id) {
      baseQuery += ' AND s.route_id = ?';
      params.push(route_id);
    }

    if (bus_id) {
      baseQuery += ' AND s.bus_id = ?';
      params.push(bus_id);
    }

    if (driver_id) {
      baseQuery += ' AND s.driver_id = ?';
      params.push(driver_id);
    }

    if (date) {
      baseQuery += ' AND DATE(s.schedule_date) = ?';
      params.push(date);
    }

    if (status) {
      baseQuery += ' AND s.status = ?';
      params.push(status);
    }

    baseQuery += ' ORDER BY s.schedule_date DESC, s.start_time ASC';

    const schedules = await query(baseQuery, params);

    res.json({
      success: true,
      data: schedules,
      count: schedules.length
    });

  } catch (error) {
    console.error('Get schedules error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server nội bộ',
      error: error.message
    });
  }
});

// GET /api/schedules/:id - Get schedule by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const schedules = await query(`
      SELECT 
        s.*,
        r.route_name,
        r.description as route_description,
        b.license_plate,
        b.bus_number,
        b.capacity,
        d.employee_id as driver_employee_id,
        u.name as driver_name,
        u.phone as driver_phone
      FROM schedules s
      LEFT JOIN routes r ON s.route_id = r.id
      LEFT JOIN buses b ON s.bus_id = b.id
      LEFT JOIN drivers d ON s.driver_id = d.id
      LEFT JOIN users u ON d.user_id = u.id
      WHERE s.id = ?
    `, [id]);

    if (schedules.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Lịch trình không tồn tại'
      });
    }

    res.json({
      success: true,
      data: schedules[0]
    });

  } catch (error) {
    console.error('Get schedule error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server nội bộ',
      error: error.message
    });
  }
});

// POST /api/schedules - Create new schedule
router.post('/', async (req, res) => {
  try {
    const {
      route_id,
      bus_id,
      driver_id,
      schedule_date,
      start_time,
      end_time,
      trip_type = 'morning', // morning, afternoon, round_trip
      status = 'scheduled',
      notes
    } = req.body;

    // Validation
    if (!route_id || !bus_id || !driver_id || !schedule_date || !start_time) {
      return res.status(400).json({
        success: false,
        message: 'Thiếu thông tin bắt buộc: route_id, bus_id, driver_id, schedule_date, start_time'
      });
    }

    // Validate foreign keys
    const route = await query('SELECT id FROM routes WHERE id = ?', [route_id]);
    if (route.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Route không tồn tại'
      });
    }

    const bus = await query('SELECT id, status FROM buses WHERE id = ?', [bus_id]);
    if (bus.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Bus không tồn tại'
      });
    }

    if (bus[0].status !== 'active') {
      return res.status(400).json({
        success: false,
        message: 'Bus không ở trạng thái hoạt động'
      });
    }

    const driver = await query('SELECT id, status FROM drivers WHERE id = ?', [driver_id]);
    if (driver.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Driver không tồn tại'
      });
    }

    if (driver[0].status !== 'active') {
      return res.status(400).json({
        success: false,
        message: 'Driver không ở trạng thái hoạt động'
      });
    }

    // Check for scheduling conflicts
    const conflicts = await query(`
      SELECT id FROM schedules 
      WHERE (bus_id = ? OR driver_id = ?) 
        AND schedule_date = ? 
        AND status != 'cancelled'
        AND (
          (start_time <= ? AND end_time >= ?) OR
          (start_time <= ? AND end_time >= ?) OR
          (start_time >= ? AND end_time <= ?)
        )
    `, [
      bus_id, driver_id, schedule_date,
      start_time, start_time,
      end_time, end_time,
      start_time, end_time
    ]);

    if (conflicts.length > 0) {
      return res.status(409).json({
        success: false,
        message: 'Bus hoặc driver đã có lịch trình trùng thời gian'
      });
    }

    // Validate trip type
    const validTripTypes = ['morning', 'afternoon', 'round_trip', 'special'];
    if (!validTripTypes.includes(trip_type)) {
      return res.status(400).json({
        success: false,
        message: 'Trip type không hợp lệ: ' + validTripTypes.join(', ')
      });
    }

    // Create schedule
    const result = await query(`
      INSERT INTO schedules (
        route_id, bus_id, driver_id, schedule_date, start_time, end_time,
        trip_type, status, notes, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())
    `, [
      route_id, bus_id, driver_id, schedule_date, start_time, end_time,
      trip_type, status, notes
    ]);

    if (result.affectedRows > 0) {
      // Get created schedule with related data
      const newSchedule = await query(`
        SELECT 
          s.*,
          r.route_name,
          b.license_plate,
          b.bus_number,
          d.employee_id as driver_employee_id,
          u.name as driver_name
        FROM schedules s
        LEFT JOIN routes r ON s.route_id = r.id
        LEFT JOIN buses b ON s.bus_id = b.id
        LEFT JOIN drivers d ON s.driver_id = d.id
        LEFT JOIN users u ON d.user_id = u.id
        WHERE s.id = ?
      `, [result.insertId]);

      // Broadcast to Socket.IO
      if (req.app.get('io')) {
        req.app.get('io').emit('schedule_created', {
          schedule: newSchedule[0]
        });
      }

      res.status(201).json({
        success: true,
        message: 'Tạo lịch trình thành công',
        data: newSchedule[0]
      });
    } else {
      res.status(500).json({
        success: false,
        message: 'Lỗi khi tạo lịch trình'
      });
    }

  } catch (error) {
    console.error('Create schedule error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server nội bộ',
      error: error.message
    });
  }
});

// PUT /api/schedules/:id - Update schedule
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const {
      route_id,
      bus_id,
      driver_id,
      schedule_date,
      start_time,
      end_time,
      trip_type,
      status,
      notes
    } = req.body;

    // Check if schedule exists
    const existingSchedule = await query('SELECT * FROM schedules WHERE id = ?', [id]);
    if (existingSchedule.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Lịch trình không tồn tại'
      });
    }

    // Validate foreign keys if provided
    if (route_id) {
      const route = await query('SELECT id FROM routes WHERE id = ?', [route_id]);
      if (route.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'Route không tồn tại'
        });
      }
    }

    if (bus_id) {
      const bus = await query('SELECT id, status FROM buses WHERE id = ?', [bus_id]);
      if (bus.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'Bus không tồn tại'
        });
      }
    }

    if (driver_id) {
      const driver = await query('SELECT id, status FROM drivers WHERE id = ?', [driver_id]);
      if (driver.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'Driver không tồn tại'
        });
      }
    }

    // Check for conflicts if changing critical fields
    if ((bus_id || driver_id || schedule_date || start_time || end_time) && status !== 'cancelled') {
      const checkBusId = bus_id || existingSchedule[0].bus_id;
      const checkDriverId = driver_id || existingSchedule[0].driver_id;
      const checkDate = schedule_date || existingSchedule[0].schedule_date;
      const checkStart = start_time || existingSchedule[0].start_time;
      const checkEnd = end_time || existingSchedule[0].end_time;

      const conflicts = await query(`
        SELECT id FROM schedules 
        WHERE (bus_id = ? OR driver_id = ?) 
          AND schedule_date = ? 
          AND status != 'cancelled'
          AND id != ?
          AND (
            (start_time <= ? AND end_time >= ?) OR
            (start_time <= ? AND end_time >= ?) OR
            (start_time >= ? AND end_time <= ?)
          )
      `, [
        checkBusId, checkDriverId, checkDate, id,
        checkStart, checkStart,
        checkEnd, checkEnd,
        checkStart, checkEnd
      ]);

      if (conflicts.length > 0) {
        return res.status(409).json({
          success: false,
          message: 'Thay đổi này sẽ tạo xung đột lịch trình'
        });
      }
    }

    // Build dynamic UPDATE query
    const updates = [];
    const values = [];

    const fields = {
      route_id, bus_id, driver_id, schedule_date,
      start_time, end_time, trip_type, status, notes
    };

    Object.entries(fields).forEach(([key, value]) => {
      if (value !== undefined) {
        updates.push(`${key} = ?`);
        values.push(value);
      }
    });

    if (updates.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Không có thông tin nào để cập nhật'
      });
    }

    updates.push('updated_at = NOW()');
    values.push(id);

    const result = await query(
      `UPDATE schedules SET ${updates.join(', ')} WHERE id = ?`,
      values
    );

    if (result.affectedRows > 0) {
      // Get updated schedule
      const updatedSchedule = await query(`
        SELECT 
          s.*,
          r.route_name,
          b.license_plate,
          b.bus_number,
          d.employee_id as driver_employee_id,
          u.name as driver_name
        FROM schedules s
        LEFT JOIN routes r ON s.route_id = r.id
        LEFT JOIN buses b ON s.bus_id = b.id
        LEFT JOIN drivers d ON s.driver_id = d.id
        LEFT JOIN users u ON d.user_id = u.id
        WHERE s.id = ?
      `, [id]);

      // Broadcast to Socket.IO
      if (req.app.get('io')) {
        req.app.get('io').emit('schedule_updated', {
          schedule: updatedSchedule[0]
        });
      }

      res.json({
        success: true,
        message: 'Cập nhật lịch trình thành công',
        data: updatedSchedule[0]
      });
    } else {
      res.status(500).json({
        success: false,
        message: 'Lỗi khi cập nhật lịch trình'
      });
    }

  } catch (error) {
    console.error('Update schedule error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server nội bộ',
      error: error.message
    });
  }
});

// DELETE /api/schedules/:id - Delete schedule
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // Check if schedule exists
    const schedule = await query('SELECT * FROM schedules WHERE id = ?', [id]);
    if (schedule.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Lịch trình không tồn tại'
      });
    }

    // Check if schedule is in progress
    if (schedule[0].status === 'in_progress') {
      return res.status(400).json({
        success: false,
        message: 'Không thể xóa lịch trình đang thực hiện. Hãy hủy trước.'
      });
    }

    // Check for dependent records (tracking, attendance)
    const dependencies = await query(`
      SELECT 
        (SELECT COUNT(*) FROM student_tracking WHERE schedule_id = ?) as tracking_count,
        (SELECT COUNT(*) FROM attendance WHERE schedule_id = ?) as attendance_count
    `, [id, id]);

    if (dependencies.length > 0 && dependencies[0]) {
      const { tracking_count, attendance_count } = dependencies[0];
      if (tracking_count > 0 || attendance_count > 0) {
        return res.status(400).json({
          success: false,
          message: 'Không thể xóa lịch trình có dữ liệu tracking hoặc điểm danh. Hãy đặt status = "cancelled".'
        });
      }
    }

    const result = await query('DELETE FROM schedules WHERE id = ?', [id]);

    if (result.affectedRows > 0) {
      // Broadcast to Socket.IO
      if (req.app.get('io')) {
        req.app.get('io').emit('schedule_deleted', {
          schedule_id: parseInt(id)
        });
      }

      res.json({
        success: true,
        message: 'Xóa lịch trình thành công'
      });
    } else {
      res.status(500).json({
        success: false,
        message: 'Lỗi khi xóa lịch trình'
      });
    }

  } catch (error) {
    console.error('Delete schedule error:', error);
    if (error.code === 'ER_ROW_IS_REFERENCED_2') {
      res.status(400).json({
        success: false,
        message: 'Không thể xóa lịch trình vì có dữ liệu liên quan. Hãy đặt status = "cancelled".'
      });
    } else {
      res.status(500).json({
        success: false,
        message: 'Lỗi server nội bộ',
        error: error.message
      });
    }
  }
});

// PATCH /api/schedules/:id/status - Update schedule status
router.patch('/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    // Validate status
    const validStatuses = ['scheduled', 'in_progress', 'completed', 'cancelled', 'delayed'];
    if (!status || !validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Status không hợp lệ. Chỉ chấp nhận: ' + validStatuses.join(', ')
      });
    }

    // Check if schedule exists
    const schedule = await query('SELECT * FROM schedules WHERE id = ?', [id]);
    if (schedule.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Lịch trình không tồn tại'
      });
    }

    const oldStatus = schedule[0].status;

    // Business logic validation
    if (oldStatus === 'completed' && status !== 'completed') {
      return res.status(400).json({
        success: false,
        message: 'Không thể thay đổi trạng thái của lịch trình đã hoàn thành'
      });
    }

    if (oldStatus === 'cancelled' && status !== 'cancelled' && status !== 'scheduled') {
      return res.status(400).json({
        success: false,
        message: 'Lịch trình đã hủy chỉ có thể thay đổi thành scheduled'
      });
    }

    const result = await query(
      'UPDATE schedules SET status = ?, updated_at = NOW() WHERE id = ?',
      [status, id]
    );

    if (result.affectedRows > 0) {
      // Get updated schedule
      const updatedSchedule = await query(`
        SELECT 
          s.*,
          r.route_name,
          b.license_plate,
          b.bus_number,
          d.employee_id as driver_employee_id,
          u.name as driver_name
        FROM schedules s
        LEFT JOIN routes r ON s.route_id = r.id
        LEFT JOIN buses b ON s.bus_id = b.id
        LEFT JOIN drivers d ON s.driver_id = d.id
        LEFT JOIN users u ON d.user_id = u.id
        WHERE s.id = ?
      `, [id]);

      // Broadcast to Socket.IO
      if (req.app.get('io')) {
        req.app.get('io').emit('schedule_status_updated', {
          schedule: updatedSchedule[0],
          old_status: oldStatus,
          new_status: status
        });
      }

      res.json({
        success: true,
        message: 'Cập nhật trạng thái lịch trình thành công',
        data: updatedSchedule[0]
      });
    } else {
      res.status(500).json({
        success: false,
        message: 'Lỗi khi cập nhật trạng thái'
      });
    }

  } catch (error) {
    console.error('Update schedule status error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server nội bộ',
      error: error.message
    });
  }
});

module.exports = router;