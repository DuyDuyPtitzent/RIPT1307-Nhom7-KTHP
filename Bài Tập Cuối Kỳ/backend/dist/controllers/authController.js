"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.logout = exports.resetPassword = exports.forgotPassword = exports.deleteUser = exports.updateUser = exports.getCurrentUser = exports.getUsers = exports.login = exports.register = void 0;
const express_validator_1 = require("express-validator");
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const database_1 = require("../config/database");
const email_1 = require("../utils/email");
const env_1 = require("../config/env");
require("../types/express"); // Import extended Request type
const register = async (req, res) => {
    const errors = (0, express_validator_1.validationResult)(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    const { fullName, email, password } = req.body;
    try {
        console.log('Bắt đầu đăng ký, email:', email);
        const [existingUsers] = await database_1.pool.query('SELECT * FROM users WHERE email = ?', [email]);
        if (existingUsers.length > 0) {
            return res.status(400).json({ message: 'Email đã được đăng ký' });
        }
        const salt = await bcrypt_1.default.genSalt(10);
        const hashedPassword = await bcrypt_1.default.hash(password, salt);
        const [result] = await database_1.pool.query('INSERT INTO users (full_name, email, password, role) VALUES (?, ?, ?, ?)', [fullName, email, hashedPassword, 'user']);
        console.log('Kết quả thêm người dùng:', result);
        try {
            await (0, email_1.sendEmail)(email, 'Đăng ký thành công', `Kính gửi ${fullName},\n\nTài khoản của bạn đã được đăng ký thành công.\n\nTrân trọng,\nĐội ngũ Quản lý Dân cư`);
            console.log('Email đã gửi');
        }
        catch (emailError) {
            console.error('Lỗi gửi email:', emailError);
        }
        res.status(201).json({ message: 'Đăng ký thành công' });
    }
    catch (error) {
        console.error('Lỗi trong hàm register:', error);
        res.status(500).json({ message: 'Lỗi máy chủ', error: error.message });
    }
};
exports.register = register;
const login = async (req, res) => {
    const { email, password } = req.body;
    try {
        const [users] = await database_1.pool.query('SELECT * FROM users WHERE email = ?', [email]);
        if (users.length === 0) {
            return res.status(400).json({ message: 'Email hoặc mật khẩu không đúng' });
        }
        const user = users[0];
        const isMatch = await bcrypt_1.default.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Email hoặc mật khẩu không đúng' });
        }
        const token = jsonwebtoken_1.default.sign({ id: user.id, email: user.email, role: user.role }, env_1.config.JWT_SECRET, { expiresIn: '1h' });
        res.json({
            token,
            user: {
                id: user.id,
                fullName: user.full_name,
                email: user.email,
                role: user.role,
            },
        });
    }
    catch (error) {
        console.error('Lỗi trong hàm login:', error);
        res.status(500).json({ message: 'Lỗi máy chủ', error: error.message });
    }
};
exports.login = login;
const getUsers = async (req, res) => {
    try {
        const [users] = await database_1.pool.query('SELECT id, full_name, email, role, created_at FROM users');
        res.json(users);
    }
    catch (error) {
        console.error('Lỗi trong hàm getUsers:', error);
        res.status(500).json({ message: 'Lỗi máy chủ', error: error.message });
    }
};
exports.getUsers = getUsers;
const getCurrentUser = async (req, res) => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            return res.status(401).json({ message: 'Không tìm thấy thông tin người dùng' });
        }
        const [users] = await database_1.pool.query('SELECT id, full_name, email, role, created_at FROM users WHERE id = ?', [userId]);
        if (users.length === 0) {
            return res.status(404).json({ message: 'Người dùng không tồn tại' });
        }
        res.json(users[0]);
    }
    catch (error) {
        console.error('Lỗi trong hàm getCurrentUser:', error);
        res.status(500).json({ message: 'Lỗi máy chủ', error: error.message });
    }
};
exports.getCurrentUser = getCurrentUser;
const updateUser = async (req, res) => {
    const { id } = req.params;
    const { fullName, email, password, role } = req.body;
    try {
        const [users] = await database_1.pool.query('SELECT * FROM users WHERE id = ?', [id]);
        if (users.length === 0) {
            return res.status(404).json({ message: 'Người dùng không tồn tại' });
        }
        const updates = {};
        if (fullName)
            updates.full_name = fullName;
        if (email)
            updates.email = email;
        if (password) {
            const salt = await bcrypt_1.default.genSalt(10);
            updates.password = await bcrypt_1.default.hash(password, salt);
        }
        if (req.user?.role === 'admin' && role)
            updates.role = role;
        if (Object.keys(updates).length === 0) {
            return res.status(400).json({ message: 'Không có dữ liệu để cập nhật' });
        }
        if (email) {
            const [existingUsers] = await database_1.pool.query('SELECT * FROM users WHERE email = ? AND id != ?', [email, id]);
            if (existingUsers.length > 0) {
                return res.status(400).json({ message: 'Email đã được sử dụng' });
            }
        }
        const fields = Object.keys(updates).map(key => `${key} = ?`).join(', ');
        const values = Object.values(updates);
        await database_1.pool.query(`UPDATE users SET ${fields} WHERE id = ?`, [...values, id]);
        res.json({ message: 'Cập nhật người dùng thành công' });
    }
    catch (error) {
        console.error('Lỗi trong hàm updateUser:', error);
        res.status(500).json({ message: 'Lỗi máy chủ', error: error.message });
    }
};
exports.updateUser = updateUser;
const deleteUser = async (req, res) => {
    const { id } = req.params;
    try {
        const [users] = await database_1.pool.query('SELECT * FROM users WHERE id = ?', [id]);
        if (users.length === 0) {
            return res.status(404).json({ message: 'Người dùng không tồn tại' });
        }
        await database_1.pool.query('DELETE FROM users WHERE id = ?', [id]);
        res.json({ message: 'Xóa người dùng thành công' });
    }
    catch (error) {
        console.error('Lỗi trong hàm deleteUser:', error);
        res.status(500).json({ message: 'Lỗi máy chủ', error: error.message });
    }
};
exports.deleteUser = deleteUser;
const forgotPassword = async (req, res) => {
    const errors = (0, express_validator_1.validationResult)(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    const { email } = req.body;
    try {
        const [users] = await database_1.pool.query('SELECT * FROM users WHERE email = ?', [email]);
        if (users.length === 0) {
            return res.status(404).json({ message: 'Email không tồn tại' });
        }
        const user = users[0];
        const resetToken = jsonwebtoken_1.default.sign({ id: user.id, email: user.email }, env_1.config.JWT_SECRET, { expiresIn: '15m' });
        await database_1.pool.query('UPDATE users SET reset_token = ?, reset_token_expiry = DATE_ADD(NOW(), INTERVAL 15 MINUTE) WHERE id = ?', [resetToken, user.id]);
        const resetLink = `http://localhost:3000/reset-password?token=${resetToken}`;
        await (0, email_1.sendEmail)(email, 'Yêu cầu đặt lại mật khẩu', `Kính gửi ${user.full_name},\n\nVui lòng nhấp vào liên kết sau để đặt lại mật khẩu: ${resetLink}\nLiên kết có hiệu lực trong 15 phút.\n\nTrân trọng,\nĐội ngũ Quản lý Dân cư`);
        res.json({ message: 'Email đặt lại mật khẩu đã được gửi' });
    }
    catch (error) {
        console.error('Lỗi trong hàm forgotPassword:', error);
        res.status(500).json({ message: 'Lỗi máy chủ', error: error.message });
    }
};
exports.forgotPassword = forgotPassword;
const resetPassword = async (req, res) => {
    const errors = (0, express_validator_1.validationResult)(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    const { token, newPassword } = req.body;
    try {
        let decoded;
        try {
            decoded = jsonwebtoken_1.default.verify(token, env_1.config.JWT_SECRET);
        }
        catch (err) {
            return res.status(400).json({ message: 'Token không hợp lệ hoặc đã hết hạn' });
        }
        const [users] = await database_1.pool.query('SELECT * FROM users WHERE id = ? AND reset_token = ? AND reset_token_expiry > NOW()', [decoded.id, token]);
        if (users.length === 0) {
            return res.status(400).json({ message: 'Token không hợp lệ hoặc đã hết hạn' });
        }
        const salt = await bcrypt_1.default.genSalt(10);
        const hashedPassword = await bcrypt_1.default.hash(newPassword, salt);
        await database_1.pool.query('UPDATE users SET password = ?, reset_token = NULL, reset_token_expiry = NULL WHERE id = ?', [hashedPassword, decoded.id]);
        res.json({ message: 'Đặt lại mật khẩu thành công' });
    }
    catch (error) {
        console.error('Lỗi trong hàm resetPassword:', error);
        res.status(500).json({ message: 'Lỗi máy chủ', error: error.message });
    }
};
exports.resetPassword = resetPassword;
const logout = async (req, res) => {
    res.json({ message: 'Đăng xuất thành công' });
};
exports.logout = logout;
