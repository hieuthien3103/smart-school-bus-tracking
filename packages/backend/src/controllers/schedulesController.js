// src/controllers/scheduleController.js
const { successResponse, errorResponse } = require('../utils/response');

// GET /api/schedules
exports.getAll = async (req, res) => {
  try {
    // TODO: Implement logic
    const mockData = [
      {
        ma_lich: 1,
        ma_tuyen: 1,
        ten_tuyen: 'Tuyến 1',
        ngay_chay: '2025-10-20',
        gio_bat_dau: '06:30:00',
        trang_thai_lich: 'cho_chay'
      }
    ];
    
    return successResponse(res, mockData, 'Lấy danh sách lịch trình thành công');
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};

// GET /api/schedules/:id
exports.getById = async (req, res) => {
  try {
    const { id } = req.params;
    
    // TODO: Implement logic
    const mockData = {
      ma_lich: id,
      ma_tuyen: 1,
      ten_tuyen: 'Tuyến 1',
      ngay_chay: '2025-10-20',
      gio_bat_dau: '06:30:00'
    };
    
    return successResponse(res, mockData, 'Lấy chi tiết lịch trình thành công');
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};

// GET /api/schedules/:id/students
exports.getStudents = async (req, res) => {
  try {
    const { id } = req.params;
    
    // TODO: Implement logic
    const mockData = [];
    
    return successResponse(res, mockData, 'Lấy danh sách học sinh thành công');
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};

// POST /api/schedules
exports.create = async (req, res) => {
  try {
    const data = req.body;
    
    // TODO: Implement logic
    return successResponse(res, { ma_lich: 1, ...data }, 'Tạo lịch trình thành công', 201);
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};

// PUT /api/schedules/:id
exports.update = async (req, res) => {
  try {
    const { id } = req.params;
    const data = req.body;
    
    // TODO: Implement logic
    return successResponse(res, { ma_lich: id, ...data }, 'Cập nhật lịch trình thành công');
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};

// PATCH /api/schedules/:id/status
exports.updateStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { trang_thai } = req.body;
    
    // TODO: Implement logic
    return successResponse(res, { ma_lich: id, trang_thai }, 'Cập nhật trạng thái thành công');
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};

// POST /api/schedules/:id/assign-students
exports.assignStudents = async (req, res) => {
  try {
    const { id } = req.params;
    const { student_ids } = req.body;
    
    // TODO: Implement logic
    return successResponse(res, { message: 'Đã phân công học sinh' }, 'Phân công học sinh thành công');
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};

// DELETE /api/schedules/:id
exports.delete = async (req, res) => {
  try {
    const { id } = req.params;
    
    // TODO: Implement logic
    return successResponse(res, { message: 'Đã xóa' }, 'Xóa lịch trình thành công');
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};

// GET /api/schedules/statistics
exports.getStatistics = async (req, res) => {
  try {
    const { start_date, end_date } = req.query;
    
    // TODO: Implement logic
    const mockData = [];
    
    return successResponse(res, mockData, 'Lấy thống kê thành công');
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};