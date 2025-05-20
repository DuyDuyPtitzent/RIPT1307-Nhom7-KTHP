import express from 'express';
import cors from 'cors';
import authRoutes from './routes/authRoutes';
import userRoutes from './routes/userRoutes';
import residentRoutes from './routes/residentRoutes';
import materialRoutes from './routes/materialRoutes';
import financeRoutes from './routes/financeRoutes';
import vehicleRoutes from './routes/vehicleRoutes';
import statsRoutes from './routes/statsRoutes';
import { errorHandler } from './middlewares/errorHandler';

const app = express();

app.use(cors({
  origin: ['http://localhost:8000', 'http://192.168.244.1:8000'],
  credentials: true,
}));


app.use(express.json());
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/residents', residentRoutes);
app.use('/api/materials', materialRoutes); 
app.use('/api/finance', financeRoutes);
app.use('/api/vehicles', vehicleRoutes);
app.use('/api/stats', statsRoutes);

app.use(errorHandler);

app.listen(5000, () => console.log('Server running on port 5000'));