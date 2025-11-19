const Stop = require('../models/Stop');
const { successResponse, errorResponse } = require('../utils/response');

exports.getAll = async (req, res) => {
  try {
    const stops = await Stop.getAll();
    return successResponse(res, stops, 'Lấy danh sách trạm xe thành công');
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};

exports.getById = async (req, res) => {
  try {
    const stop = await Stop.getById(req.params.id);
    if (!stop) {
      return errorResponse(res, 'Không tìm thấy trạm xe', 404);
    }
    return successResponse(res, stop, 'Lấy thông tin trạm xe thành công');
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};

exports.create = async (req, res) => {
  try {
    const stop = await Stop.create(req.body);
    return successResponse(res, stop, 'Thêm trạm xe thành công', 201);
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};

exports.update = async (req, res) => {
  try {
    const stop = await Stop.update(req.params.id, req.body);
    return successResponse(res, stop, 'Cập nhật trạm xe thành công');
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};

exports.delete = async (req, res) => {
  try {
    const result = await Stop.delete(req.params.id);
    return successResponse(res, result, 'Xóa trạm xe thành công');
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};
