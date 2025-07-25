"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateRequestBody = void 0;
/**
 * Middleware để kiểm tra và log request body.
 * Nếu body không tồn tại hoặc không hợp lệ, trả về lỗi 400.
 */
const validateRequestBody = (req, res, next) => {
    if (!req.body || Object.keys(req.body).length === 0) {
        res.status(400).json({ message: 'Request body không được để trống!' });
        return;
    }
    console.log('Headers:', req.headers); // Log headers để kiểm tra Content-Type
    console.log('Raw body:', req.body); // Log raw body để kiểm tra dữ liệu được gửi
    console.log('Request body:', req.body); // Log request body để debug
    next();
};
exports.validateRequestBody = validateRequestBody;
