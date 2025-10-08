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

// POST /api/students - Create new student
router.post('/', async (req, res) => {
  try {
    const {
      student_code,
      name,
      grade,
      class: studentClass,
      date_of_birth,
      gender,
      address,
      pickup_address,
      dropoff_address,
      school_id,
      route_id,
      stop_id
    } = req.body;
    
    // Validate required fields
    if (!student_code || !name || !grade || !studentClass || !date_of_birth || !gender || !school_id) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields'
      });
    }
    
    const query = `
      INSERT INTO students (
        student_code, name, grade, class, date_of_birth, gender,
        address, pickup_address, dropoff_address, school_id, route_id, stop_id, status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'active')
    `;
    
    const params = [
      student_code, name, grade, studentClass, date_of_birth, gender,
      address, pickup_address || address, dropoff_address || address,
      school_id, route_id || null, stop_id || null
    ];
    
    const result = await executeQuery(query, params);
    
    if (result.success) {
      res.status(201).json({
        success: true,
        message: 'Student created successfully',
        data: { id: result.data.insertId }
      });
    } else {
      res.status(500).json({
        success: false,
        message: 'Failed to create student',
        error: result.error
      });
    }
  } catch (error) {
    console.error('Error creating student:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// PUT /api/students/:id - Update student
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updateFields = req.body;
    
    // Remove id from updateFields if present
    delete updateFields.id;
    
    const setClause = Object.keys(updateFields).map(key => `${key} = ?`).join(', ');
    const values = Object.values(updateFields);
    
    const query = `UPDATE students SET ${setClause}, updated_at = NOW() WHERE id = ?`;
    values.push(id);
    
    const result = await executeQuery(query, values);
    
    if (result.success) {
      res.json({
        success: true,
        message: 'Student updated successfully'
      });
    } else {
      res.status(500).json({
        success: false,
        message: 'Failed to update student',
        error: result.error
      });
    }
  } catch (error) {
    console.error('Error updating student:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// DELETE /api/students/:id - Delete student (soft delete)
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const query = 'UPDATE students SET status = "inactive", updated_at = NOW() WHERE id = ?';
    const result = await executeQuery(query, [id]);
    
    if (result.success) {
      res.json({
        success: true,
        message: 'Student deleted successfully'
      });
    } else {
      res.status(500).json({
        success: false,
        message: 'Failed to delete student',
        error: result.error
      });
    }
  } catch (error) {
    console.error('Error deleting student:', error);
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

module.exports = router;