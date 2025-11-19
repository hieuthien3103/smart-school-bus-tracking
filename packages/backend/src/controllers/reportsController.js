const { successResponse, errorResponse } = require('../utils/response');
const Report = require('../models/Report');

// GET /api/reports/overview
exports.getOverview = async (req, res) => {
  try {
    const data = await Report.getOverview();
    return successResponse(res, data, 'Lấy báo cáo tổng quan thành công');
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};

// GET /api/reports/schedules?start_date=...&end_date=...
exports.getScheduleReport = async (req, res) => {
  try {
    const { start_date, end_date } = req.query;
    const data = await Report.getScheduleReport(start_date, end_date);
    return successResponse(res, data, 'Lấy báo cáo lịch trình thành công');
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};

// GET /api/reports/drivers
exports.getDriverPerformance = async (req, res) => {
  try {
    const data = await Report.getDriverPerformance();
    return successResponse(res, data, 'Lấy hiệu suất tài xế thành công');
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};

// GET /api/reports/performance - Performance data over time
exports.getPerformanceData = async (req, res) => {
  try {
    const { startDate, endDate, schoolId } = req.query;
    
    // Mock data for now - replace with actual DB query
    const mockData = [
      { month: 'T1', trips: 420, onTime: 95, students: 850, fuel: 2800, cost: 45000000 },
      { month: 'T2', trips: 398, onTime: 93, students: 845, fuel: 2650, cost: 42000000 },
      { month: 'T3', trips: 445, onTime: 96, students: 870, fuel: 2900, cost: 48000000 },
      { month: 'T4', trips: 410, onTime: 94, students: 860, fuel: 2750, cost: 44000000 },
      { month: 'T5', trips: 435, onTime: 97, students: 880, fuel: 2850, cost: 46000000 },
      { month: 'T6', trips: 425, onTime: 95, students: 875, fuel: 2800, cost: 45000000 }
    ];
    
    return successResponse(res, mockData, 'Lấy dữ liệu hiệu suất thành công');
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};

// GET /api/reports/routes - Route analysis
exports.getRouteAnalysis = async (req, res) => {
  try {
    const { schoolId, period } = req.query;
    
    // Mock data for now - replace with actual DB query
    const mockData = [
      { route: 'Tuyến A1', efficiency: 92, cost: 12500000, distance: 45, students: 180 },
      { route: 'Tuyến B2', efficiency: 88, cost: 15000000, distance: 52, students: 210 },
      { route: 'Tuyến C3', efficiency: 95, cost: 10000000, distance: 38, students: 150 },
      { route: 'Tuyến D4', efficiency: 85, cost: 18000000, distance: 65, students: 240 },
      { route: 'Tuyến E5', efficiency: 90, cost: 13500000, distance: 48, students: 195 }
    ];
    
    return successResponse(res, mockData, 'Lấy phân tích tuyến đường thành công');
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};

// GET /api/reports/maintenance - Maintenance statistics
exports.getMaintenanceData = async (req, res) => {
  try {
    const { schoolId, period } = req.query;
    
    // Mock data for now - replace with actual DB query
    const mockData = [
      { type: 'Bảo dưỡng định kỳ', count: 45, cost: 85000000, color: '#3b82f6' },
      { type: 'Sửa chữa khẩn cấp', count: 12, cost: 35000000, color: '#ef4444' },
      { type: 'Thay thế phụ tùng', count: 28, cost: 52000000, color: '#f59e0b' },
      { type: 'Kiểm tra an toàn', count: 60, cost: 25000000, color: '#10b981' },
      { type: 'Bảo trì hệ thống', count: 18, cost: 28000000, color: '#8b5cf6' }
    ];
    
    return successResponse(res, mockData, 'Lấy dữ liệu bảo trì thành công');
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};
