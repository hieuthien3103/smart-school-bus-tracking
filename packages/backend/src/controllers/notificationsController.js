const Notification = require('../models/Notification');
const { successResponse, errorResponse } = require('../utils/response');

exports.getAll = async (req, res) => {
  try {
    const { ma_phu_huynh, ma_tai_xe } = req.query;
    const notifications = await Notification.getAll({ ma_phu_huynh, ma_tai_xe });
    return successResponse(res, notifications, 'Lấy danh sách thông báo thành công');
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};

exports.getById = async (req, res) => {
  try {
    const notification = await Notification.getById(req.params.id);
    if (!notification) {
      return errorResponse(res, 'Không tìm thấy thông báo', 404);
    }
    return successResponse(res, notification, 'Lấy thông báo thành công');
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};

exports.create = async (req, res) => {
  try {
    const notification = await Notification.create(req.body);
    return successResponse(res, notification, 'Tạo thông báo thành công', 201);
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};

exports.delete = async (req, res) => {
  try {
    const result = await Notification.delete(req.params.id);
    return successResponse(res, result, 'Xóa thông báo thành công');
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};
