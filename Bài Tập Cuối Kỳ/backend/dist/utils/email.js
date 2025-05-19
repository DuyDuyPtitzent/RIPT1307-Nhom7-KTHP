"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendEmail = void 0;
const nodemailer_1 = __importDefault(require("nodemailer"));
const env_1 = require("../config/env");
const transporter = nodemailer_1.default.createTransport({
    host: env_1.config.SMTP_HOST,
    port: env_1.config.SMTP_PORT,
    auth: {
        user: env_1.config.SMTP_USER,
        pass: env_1.config.SMTP_PASS,
    },
});
transporter.verify((error, success) => {
    if (error) {
        console.error('Lỗi SMTP:', error);
    }
    else {
        console.log('SMTP sẵn sàng');
    }
});
const sendEmail = async (to, subject, text) => {
    const mailOptions = {
        from: '"Quản lý Dân cư" <Duydvdhtb172005@gmail.com>',
        to,
        subject,
        text,
    };
    await transporter.sendMail(mailOptions);
};
exports.sendEmail = sendEmail;
