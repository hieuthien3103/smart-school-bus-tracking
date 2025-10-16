// src/middleware/errorHandler.js
const errorHandler = (err, req, res, next) => {
  console.error('Error:', err);

  // Validation error
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      success: false,
      statusCode: 400,
      message: 'Dữ liệu không hợp lệ',
      errors: err.errors
    });
  }

  // Database error
  if (err.code === 'ER_DUP_ENTRY') {
    return res.status(409).json({
      success: false,
      statusCode: 409,
      message: 'Dữ liệu đã tồn tại'
    });
  }

  // Default error
  res.status(err.statusCode || 500).json({
    success: false,
    statusCode: err.statusCode || 500,
    message: err.message || 'Lỗi server',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
};

module.exports = errorHandler;