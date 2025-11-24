const BusLocation = require('../models/BusLocation');
const { successResponse, errorResponse } = require('../utils/response');
const asyncHandler = require('../utils/asyncHandler');

// GET /api/bus-locations/:busId - Lấy vị trí mới nhất của xe
exports.getLatest = asyncHandler(async (req, res) => {
  const { busId } = req.params;
  const location = await BusLocation.getLatest(busId);
  if (!location) {
    return errorResponse(res, 'Không tìm thấy vị trí của xe', 404);
  }
  return successResponse(res, location, 'Lấy vị trí xe thành công');
});

// GET /api/bus-locations/:busId/history - Lấy lịch sử vị trí
exports.getHistory = asyncHandler(async (req, res) => {
  const { busId } = req.params;
  const limit = parseInt(req.query.limit) || 100;
  const history = await BusLocation.getHistory(busId, limit);
  return successResponse(res, history, 'Lấy lịch sử vị trí thành công');
});

// GET /api/bus-locations/active - Lấy vị trí tất cả xe đang hoạt động
exports.getActiveBuses = asyncHandler(async (req, res) => {
  const locations = await BusLocation.getActiveBusesLocations();
  return successResponse(res, locations, 'Lấy vị trí xe đang hoạt động thành công');
});

// POST /api/bus-locations - Lưu vị trí mới (có thể dùng từ API hoặc để socket tự động lưu)
exports.create = asyncHandler(async (req, res) => {
  const location = await BusLocation.create(req.body);
  return successResponse(res, location, 'Lưu vị trí xe thành công', 201);
});

