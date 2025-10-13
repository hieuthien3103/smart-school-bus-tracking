const express = require('express');
const router = express.Router();
const { executeQuery } = require('../config/database');

// GET /api/students - Get all students
router.get('/', async (req, res) => {
  try {
    const { route_id, school_id, grade, status = 'active' } = req.query;
    
    let query = `
      SELECT 
        s.id,
        s.student_code,
        s.name,
        s.grade,
        s.class,
        s.date_of_birth,
        s.gender,
        s.address,
        s.pickup_address,
        s.dropoff_address,
        s.status,
        sc.name as school_name,
        r.route_name,
        rs.stop_name
      FROM students s
      LEFT JOIN schools sc ON s.school_id = sc.id
      LEFT JOIN routes r ON s.route_id = r.id
      LEFT JOIN route_stops rs ON s.stop_id = rs.id
      WHERE s.status = ?
    `;
    
    const params = [status];
    
    if (route_id) {
      query += ' AND s.route_id = ?';
      params.push(route_id);
    }
    
    if (school_id) {
      query += ' AND s.school_id = ?';
      params.push(school_id);
    }
    
    if (grade) {
      query += ' AND s.grade LIKE ?';
      params.push(`%${grade}%`);
    }
    
    query += ' ORDER BY s.name ASC';
    
    const result = await executeQuery(query, params);
    
    if (result.success) {
      res.json({
        success: true,
        data: result.data,
        total: result.data.length
      });
    } else {
      res.status(500).json({
        success: false,
        message: 'Failed to fetch students',
        error: result.error
      });
    }
  } catch (error) {
    console.error('Error fetching students:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// GET /api/students/:id - Get student by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const query = `
      SELECT 
        s.*,
        sc.name as school_name,
        r.route_name,
        rs.stop_name,
        rs.pickup_time_morning,
        rs.dropoff_time_afternoon
      FROM students s
      LEFT JOIN schools sc ON s.school_id = sc.id
      LEFT JOIN routes r ON s.route_id = r.id
      LEFT JOIN route_stops rs ON s.stop_id = rs.id
      WHERE s.id = ?
    `;
    
    const result = await executeQuery(query, [id]);
    
    if (result.success && result.data.length > 0) {
      // Get parents information
      const parentsQuery = `
        SELECT 
          p.id,
          p.parent_type,
          p.occupation,
          p.workplace,
          u.name,
          u.email,
          u.phone,
          sp.relationship,
          sp.is_primary_contact,
          sp.is_emergency_contact,
          sp.can_pickup
        FROM student_parents sp
        JOIN parents p ON sp.parent_id = p.id
        JOIN users u ON p.user_id = u.id
        WHERE sp.student_id = ?
      `;
      
      const parentsResult = await executeQuery(parentsQuery, [id]);
      
      const studentData = {
        ...result.data[0],
        parents: parentsResult.success ? parentsResult.data : []
      };
      
      res.json({
        success: true,
        data: studentData
      });
    } else {
      res.status(404).json({
        success: false,
        message: 'Student not found'
      });
    }
  } catch (error) {
    console.error('Error fetching student:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// GET /api/students/by-route/:routeId - Get students by route
router.get('/by-route/:routeId', async (req, res) => {
  try {
    const { routeId } = req.params;
    
    const query = `
      SELECT 
        s.id,
        s.student_code,
        s.name,
        s.grade,
        s.class,
        rs.stop_name,
        rs.pickup_time_morning,
        rs.dropoff_time_afternoon,
        rs.stop_order
      FROM students s
      JOIN route_stops rs ON s.stop_id = rs.id
      WHERE s.route_id = ? AND s.status = 'active'
      ORDER BY rs.stop_order ASC, s.name ASC
    `;
    
    const result = await executeQuery(query, [routeId]);
    
    if (result.success) {
      res.json({
        success: true,
        data: result.data
      });
    } else {
      res.status(500).json({
        success: false,
        message: 'Failed to fetch students by route',
        error: result.error
      });
    }
  } catch (error) {
    console.error('Error fetching students by route:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// POST /api/students - Create new student
router.post('/', async (req, res) => {
  try {
    const {
      student_code,
      name,
      date_of_birth,
      gender,
      grade,
      class: studentClass,
      school_id,
      route_id,
      stop_id,
      pickup_address,
      dropoff_address,
      address,
      parent_name,
      parent_phone,
      parent_email,
      emergency_contact_name,
      emergency_contact_phone,
      status = 'active'
    } = req.body;

    // Validation
    if (!student_code || !name || !date_of_birth || !gender || !grade || !school_id) {
      return res.status(400).json({
        success: false,
        message: 'Thiếu thông tin bắt buộc: student_code, name, date_of_birth, gender, grade, school_id'
      });
    }

    // Check duplicate student_code
    const existingStudent = await executeQuery(
      'SELECT id FROM students WHERE student_code = ?',
      [student_code]
    );

    if (existingStudent.success && existingStudent.data.length > 0) {
      return res.status(409).json({
        success: false,
        message: 'Mã học sinh đã tồn tại'
      });
    }

    // Validate school exists
    const school = await executeQuery('SELECT id FROM schools WHERE id = ?', [school_id]);
    if (!school.success || school.data.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'School ID không tồn tại'
      });
    }

    // Validate route if provided
    if (route_id) {
      const route = await executeQuery('SELECT id FROM routes WHERE id = ?', [route_id]);
      if (!route.success || route.data.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'Route ID không tồn tại'
        });
      }
    }

    // Validate stop if provided
    if (stop_id) {
      const stop = await executeQuery('SELECT id FROM route_stops WHERE id = ?', [stop_id]);
      if (!stop.success || stop.data.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'Stop ID không tồn tại'
        });
      }
    }

    // Create student
    const result = await executeQuery(`
      INSERT INTO students (
        student_code, name, date_of_birth, gender, grade, class, 
        school_id, route_id, stop_id, pickup_address, dropoff_address, 
        address, parent_name, parent_phone, parent_email, 
        emergency_contact_name, emergency_contact_phone, status, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())
    `, [
      student_code, name, date_of_birth, gender, grade, studentClass,
      school_id, route_id, stop_id, pickup_address, dropoff_address,
      address, parent_name, parent_phone, parent_email,
      emergency_contact_name, emergency_contact_phone, status
    ]);

    if (result.success) {
      // Get created student with related data
      const newStudent = await executeQuery(`
        SELECT 
          s.*, 
          sc.name as school_name,
          r.route_name,
          rs.stop_name
        FROM students s
        LEFT JOIN schools sc ON s.school_id = sc.id
        LEFT JOIN routes r ON s.route_id = r.id
        LEFT JOIN route_stops rs ON s.stop_id = rs.id
        WHERE s.id = ?
      `, [result.insertId]);

      // Broadcast to Socket.IO for real-time updates
      if (req.app.get('io')) {
        req.app.get('io').emit('student_created', {
          student: newStudent.success ? newStudent.data[0] : null
        });
      }

      res.status(201).json({
        success: true,
        message: 'Tạo học sinh thành công',
        data: newStudent.success ? newStudent.data[0] : { id: result.insertId, ...req.body }
      });
    } else {
      res.status(500).json({
        success: false,
        message: 'Lỗi khi tạo học sinh',
        error: result.error
      });
    }

  } catch (error) {
    console.error('Create student error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server nội bộ',
      error: error.message
    });
  }
});

// PUT /api/students/:id - Update student
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const {
      student_code,
      name,
      date_of_birth,
      gender,
      grade,
      class: studentClass,
      school_id,
      route_id,
      stop_id,
      pickup_address,
      dropoff_address,
      address,
      parent_name,
      parent_phone,
      parent_email,
      emergency_contact_name,
      emergency_contact_phone,
      status
    } = req.body;

    // Check if student exists
    const existingStudent = await executeQuery('SELECT * FROM students WHERE id = ?', [id]);
    if (!existingStudent.success || existingStudent.data.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Học sinh không tồn tại'
      });
    }

    // Check duplicate student_code (excluding current student)
    if (student_code) {
      const duplicateCheck = await executeQuery(
        'SELECT id FROM students WHERE student_code = ? AND id != ?',
        [student_code, id]
      );
      if (duplicateCheck.success && duplicateCheck.data.length > 0) {
        return res.status(409).json({
          success: false,
          message: 'Mã học sinh đã tồn tại'
        });
      }
    }

    // Validate foreign keys if provided
    if (school_id) {
      const school = await executeQuery('SELECT id FROM schools WHERE id = ?', [school_id]);
      if (!school.success || school.data.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'School ID không tồn tại'
        });
      }
    }

    if (route_id) {
      const route = await executeQuery('SELECT id FROM routes WHERE id = ?', [route_id]);
      if (!route.success || route.data.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'Route ID không tồn tại'
        });
      }
    }

    if (stop_id) {
      const stop = await executeQuery('SELECT id FROM route_stops WHERE id = ?', [stop_id]);
      if (!stop.success || stop.data.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'Stop ID không tồn tại'
        });
      }
    }

    // Build dynamic UPDATE query
    const updates = [];
    const values = [];

    const fields = {
      student_code, name, date_of_birth, gender, grade,
      class: studentClass, school_id, route_id, stop_id,
      pickup_address, dropoff_address, address, parent_name,
      parent_phone, parent_email, emergency_contact_name,
      emergency_contact_phone, status
    };

    Object.entries(fields).forEach(([key, value]) => {
      if (value !== undefined) {
        updates.push(`${key === 'class' ? 'class' : key} = ?`);
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

    const result = await executeQuery(
      `UPDATE students SET ${updates.join(', ')} WHERE id = ?`,
      values
    );

    if (result.success) {
      // Get updated student with related data
      const updatedStudent = await executeQuery(`
        SELECT 
          s.*, 
          sc.name as school_name,
          r.route_name,
          rs.stop_name
        FROM students s
        LEFT JOIN schools sc ON s.school_id = sc.id
        LEFT JOIN routes r ON s.route_id = r.id
        LEFT JOIN route_stops rs ON s.stop_id = rs.id
        WHERE s.id = ?
      `, [id]);

      // Broadcast to Socket.IO
      if (req.app.get('io')) {
        req.app.get('io').emit('student_updated', {
          student: updatedStudent.success ? updatedStudent.data[0] : null
        });
      }

      res.json({
        success: true,
        message: 'Cập nhật học sinh thành công',
        data: updatedStudent.success ? updatedStudent.data[0] : null
      });
    } else {
      res.status(500).json({
        success: false,
        message: 'Lỗi khi cập nhật học sinh',
        error: result.error
      });
    }

  } catch (error) {
    console.error('Update student error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server nội bộ',
      error: error.message
    });
  }
});

// DELETE /api/students/:id - Delete student
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // Check if student exists
    const student = await executeQuery('SELECT * FROM students WHERE id = ?', [id]);
    if (!student.success || student.data.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Học sinh không tồn tại'
      });
    }

    // Check for dependent records (student_tracking, attendance, etc.)
    const dependencies = await executeQuery(`
      SELECT 
        (SELECT COUNT(*) FROM student_tracking WHERE student_id = ?) as tracking_count,
        (SELECT COUNT(*) FROM attendance WHERE student_id = ?) as attendance_count
    `, [id, id]);

    if (dependencies.success && dependencies.data[0]) {
      const { tracking_count, attendance_count } = dependencies.data[0];
      if (tracking_count > 0 || attendance_count > 0) {
        return res.status(400).json({
          success: false,
          message: 'Không thể xóa học sinh có dữ liệu tracking hoặc điểm danh. Hãy đặt status = "inactive" thay thế.'
        });
      }
    }

    const result = await executeQuery('DELETE FROM students WHERE id = ?', [id]);

    if (result.success) {
      // Broadcast to Socket.IO
      if (req.app.get('io')) {
        req.app.get('io').emit('student_deleted', {
          student_id: parseInt(id)
        });
      }

      res.json({
        success: true,
        message: 'Xóa học sinh thành công'
      });
    } else {
      res.status(500).json({
        success: false,
        message: 'Lỗi khi xóa học sinh',
        error: result.error
      });
    }

  } catch (error) {
    console.error('Delete student error:', error);
    if (error.code === 'ER_ROW_IS_REFERENCED_2') {
      res.status(400).json({
        success: false,
        message: 'Không thể xóa học sinh vì có dữ liệu liên quan. Hãy đặt status = "inactive".'
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

// PATCH /api/students/:id/status - Update student status
router.patch('/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    // Validate status
    const validStatuses = ['active', 'inactive', 'graduated', 'transferred'];
    if (!status || !validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Status không hợp lệ. Chỉ chấp nhận: ' + validStatuses.join(', ')
      });
    }

    // Check if student exists
    const student = await executeQuery('SELECT * FROM students WHERE id = ?', [id]);
    if (!student.success || student.data.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Học sinh không tồn tại'
      });
    }

    const result = await executeQuery(
      'UPDATE students SET status = ?, updated_at = NOW() WHERE id = ?',
      [status, id]
    );

    if (result.success) {
      // Get updated student
      const updatedStudent = await executeQuery(`
        SELECT 
          s.*, 
          sc.name as school_name,
          r.route_name,
          rs.stop_name
        FROM students s
        LEFT JOIN schools sc ON s.school_id = sc.id
        LEFT JOIN routes r ON s.route_id = r.id
        LEFT JOIN route_stops rs ON s.stop_id = rs.id
        WHERE s.id = ?
      `, [id]);

      // Broadcast to Socket.IO
      if (req.app.get('io')) {
        req.app.get('io').emit('student_status_updated', {
          student: updatedStudent.success ? updatedStudent.data[0] : null,
          old_status: student.data[0].status,
          new_status: status
        });
      }

      res.json({
        success: true,
        message: 'Cập nhật trạng thái học sinh thành công',
        data: updatedStudent.success ? updatedStudent.data[0] : null
      });
    } else {
      res.status(500).json({
        success: false,
        message: 'Lỗi khi cập nhật trạng thái',
        error: result.error
      });
    }

  } catch (error) {
    console.error('Update student status error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server nội bộ',
      error: error.message
    });
  }
});

// PATCH /api/students/:id/assign-route - Assign student to route and stop
router.patch('/:id/assign-route', async (req, res) => {
  try {
    const { id } = req.params;
    const { route_id, stop_id } = req.body;

    if (!route_id) {
      return res.status(400).json({
        success: false,
        message: 'Route ID là bắt buộc'
      });
    }

    // Check if student exists and is active
    const student = await executeQuery('SELECT * FROM students WHERE id = ?', [id]);
    if (!student.success || student.data.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Học sinh không tồn tại'
      });
    }

    if (student.data[0].status !== 'active') {
      return res.status(400).json({
        success: false,
        message: 'Chỉ có thể phân tuyến cho học sinh đang hoạt động'
      });
    }

    // Validate route exists
    const route = await executeQuery('SELECT * FROM routes WHERE id = ?', [route_id]);
    if (!route.success || route.data.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Route không tồn tại'
      });
    }

    // Validate stop exists and belongs to route
    if (stop_id) {
      const stop = await executeQuery(
        'SELECT * FROM route_stops WHERE id = ? AND route_id = ?',
        [stop_id, route_id]
      );
      if (!stop.success || stop.data.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'Stop không tồn tại hoặc không thuộc route này'
        });
      }
    }

    const result = await executeQuery(
      'UPDATE students SET route_id = ?, stop_id = ?, updated_at = NOW() WHERE id = ?',
      [route_id, stop_id, id]
    );

    if (result.success) {
      // Get updated student with route info
      const updatedStudent = await executeQuery(`
        SELECT 
          s.*, 
          sc.name as school_name,
          r.route_name,
          rs.stop_name
        FROM students s
        LEFT JOIN schools sc ON s.school_id = sc.id
        LEFT JOIN routes r ON s.route_id = r.id
        LEFT JOIN route_stops rs ON s.stop_id = rs.id
        WHERE s.id = ?
      `, [id]);

      // Broadcast to Socket.IO
      if (req.app.get('io')) {
        req.app.get('io').emit('student_route_assigned', {
          student: updatedStudent.success ? updatedStudent.data[0] : null,
          route_name: route.data[0].route_name
        });
      }

      res.json({
        success: true,
        message: 'Phân tuyến cho học sinh thành công',
        data: updatedStudent.success ? updatedStudent.data[0] : null
      });
    } else {
      res.status(500).json({
        success: false,
        message: 'Lỗi khi phân tuyến',
        error: result.error
      });
    }

  } catch (error) {
    console.error('Assign route error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server nội bộ',
      error: error.message
    });
  }
});

module.exports = router;