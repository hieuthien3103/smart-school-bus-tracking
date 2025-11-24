const { successResponse, errorResponse } = require('../utils/response');
const Route = require('../models/Route');

// GET /api/routes
exports.getAll = async (req, res) => {
  try {
    const routes = await Route.getAll();
    return successResponse(res, routes, 'Lấy danh sách tuyến đường thành công');
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};

// GET /api/routes/:id
exports.getById = async (req, res) => {
  try {
    const { id } = req.params;
    const route = await Route.getById(id);
    if (!route) return errorResponse(res, 'Không tìm thấy tuyến', 404);
    return successResponse(res, route, 'Lấy chi tiết tuyến thành công');
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};

// POST /api/routes
exports.create = async (req, res) => {
  try {
    const newRoute = await Route.create(req.body);
    return successResponse(res, newRoute, 'Tạo tuyến đường thành công', 201);
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};

// PUT /api/routes/:id
exports.update = async (req, res) => {
  try {
    const { id } = req.params;
    const updated = await Route.update(id, req.body);
    return successResponse(res, updated, 'Cập nhật tuyến đường thành công');
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};

// DELETE /api/routes/:id
exports.delete = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await Route.delete(id);
    return successResponse(res, deleted, 'Xóa tuyến đường thành công');
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};

// GET /api/routes/:id/details - Lấy chi tiết tuyến đường (các trạm)
exports.getRouteDetails = async (req, res) => {
  try {
    const { id } = req.params;
    const details = await Route.getRouteDetails(id);
    return successResponse(res, details, 'Lấy chi tiết tuyến đường thành công');
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};

// GET /api/routes/for-role - Lấy tuyến đường theo vai trò
exports.getRoutesForRole = async (req, res) => {
  try {
    const { role, userId } = req.query;

    if (!role) {
      return errorResponse(res, 'Vai trò không được để trống', 400);
    }

    let routes;
    switch (role) {
      case 'admin':
        routes = await Route.getRoutesForAdmin();
        break;
      case 'driver':
        if (!userId) {
          return errorResponse(res, 'ID tài xế không được để trống', 400);
        }
        routes = await Route.getRoutesForDriver(parseInt(userId));
        break;
      case 'parent':
        if (!userId) {
          return errorResponse(res, 'ID phụ huynh không được để trống', 400);
        }
        routes = await Route.getRoutesForParent(parseInt(userId));
        break;
      default:
        return errorResponse(res, 'Vai trò không hợp lệ', 400);
    }

    return successResponse(res, routes, 'Lấy danh sách tuyến đường thành công');
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};