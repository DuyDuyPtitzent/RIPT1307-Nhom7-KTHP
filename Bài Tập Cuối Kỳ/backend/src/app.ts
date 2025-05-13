import express from 'express';
import cors from 'cors';
import authRoutes from './routes/authRoutes';
import { config } from './config/env';

const app = express();

app.use(express.json());
app.use(cors());

// Định tuyến
app.use('/api/auth', authRoutes);

app.listen(config.PORT, () => {
  console.log(`Server chạy trên cổng ${config.PORT}`);
});