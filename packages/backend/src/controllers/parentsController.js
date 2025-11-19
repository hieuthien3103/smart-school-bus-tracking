const Parent = require('../models/Parent');
const { successResponse, errorResponse } = require('../utils/response');

exports.getAll = async (req, res) => {
  try {
    const parents = await Parent.getAll();
    return successResponse(res, parents, 'Lấy danh sách phụ huynh thành công');
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};

exports.getById = async (req, res) => {
  try {
    const parent = await Parent.getById(req.params.id);
    if (!parent) {
      return errorResponse(res, 'Không tìm thấy phụ huynh', 404);
    }
    return successResponse(res, parent, 'Lấy thông tin phụ huynh thành công');
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};

exports.create = async (req, res) => {
  try {
    const parent = await Parent.create(req.body);
    return successResponse(res, parent, 'Thêm phụ huynh thành công', 201);
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};

exports.update = async (req, res) => {
  try {
    const parent = await Parent.update(req.params.id, req.body);
    return successResponse(res, parent, 'Cập nhật phụ huynh thành công');
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};

exports.delete = async (req, res) => {
  try {
    const result = await Parent.delete(req.params.id);
    return successResponse(res, result, 'Xóa phụ huynh thành công');
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};
