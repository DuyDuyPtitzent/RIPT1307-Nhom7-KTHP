"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.pool = void 0;
const promise_1 = require("mysql2/promise");
const env_1 = require("./env");
exports.pool = (0, promise_1.createPool)({
    host: env_1.config.DB_HOST,
    user: env_1.config.DB_USER,
    password: env_1.config.DB_PASSWORD,
    database: env_1.config.DB_NAME,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
});
exports.pool.getConnection().then(conn => {
    console.log('Kết nối MySQL thành công');
    conn.release();
}).catch(err => {
    console.error('Lỗi kết nối MySQL:', err);
});
