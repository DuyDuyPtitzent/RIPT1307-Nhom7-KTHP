"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const authRoutes_1 = __importDefault(require("./routes/authRoutes"));
const env_1 = require("./config/env");
const app = (0, express_1.default)();
app.use(express_1.default.json());
app.use((0, cors_1.default)());
// Định tuyến
app.use('/api/auth', authRoutes_1.default);
app.listen(env_1.config.PORT, () => {
    console.log(`Server chạy trên cổng ${env_1.config.PORT}`);
});
