import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import connectDB from './Database/connection.js';
import authRouter from './Routers/authRouter.js';
import trainingRouter from './Routers/trainingRouter.js';
import enrollmentRouter from './Routers/enrollmentRouter.js';

dotenv.config();

const app = express();
const port = process.env.PORT || 8080;

// Middleware
app.use(express.json());
app.use(cookieParser());
app.use(cors({
    origin: process.env.CLIENT_URL || '*', // Allow all for now or specified client
    credentials: true
}));

// Routes
app.use('/api/auth', authRouter);
app.use('/api/trainings', trainingRouter);
app.use('/api/enrollments', enrollmentRouter);

app.get('/', (req, res) => {
    res.send('Training Enrollment System API is running');
});

// Start Server
app.listen(port, () => {
    connectDB();
    console.log(`Server is running on port ${port}`);
});
