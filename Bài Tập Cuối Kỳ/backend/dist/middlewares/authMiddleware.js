"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authorizeSelfOrAdmin = exports.authorizeAdmin = exports.authenticateToken = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const env_1 = require("../config/env");
require("../types/express");
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) {
        return res.status(401).json({ message: 'Không có token, truy cập bị từ chối' });
    }
    try {
        const decoded = jsonwebtoken_1.default.verify(token, env_1.config.JWT_SECRET);
        req.user = decoded;
        next();
    }
    catch (error) {
        res.status(403).json({ message: 'Token không hợp lệ' });
    }
};
exports.authenticateToken = authenticateToken;
const authorizeAdmin = (req, res, next) => {
    if (!req.user || req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Chỉ admin mới có quyền truy cập' });
    }
    next();
};
exports.authorizeAdmin = authorizeAdmin;
const authorizeSelfOrAdmin = (req, res, next) => {
    const userId = req.user?.id;
    const requestedId = parseInt(req.params.id);
    if (!req.user || (req.user.role !== 'admin' && userId !== requestedId)) {
        return res.status(403).json({ message: 'Không có quyền chỉnh sửa hoặc xóa người dùng này' });
    }
    next();
};
exports.authorizeSelfOrAdmin = authorizeSelfOrAdmin;
