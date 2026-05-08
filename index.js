import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';

import connectDB from './Database/connection.js';
import { errorHandler } from './Middleware/errorMiddleware.js';

import authRouter from './Routers/authRouter.js';
import courseRouter from './Routers/courseRouter.js';
import enrollmentRouter from './Routers/enrollmentRouter.js';
import adminRouter from './Routers/adminRouter.js';
import statsRouter from './Routers/statsRouter.js';

dotenv.config();

const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(helmet());
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));
app.use(cookieParser());

// Allow credentialed requests from the frontend. In development reflect the
// request origin when a specific CLIENT_URL isn't provided so browsers accept
// Access-Control-Allow-Credentials with a non-wildcard origin.
// Flexible CORS: allow credentialed requests from the configured CLIENT_URL
// or, during development, reflect any localhost origin (e.g. 5173/5174).
app.use(cors({
  origin: (origin, callback) => {
    // No origin (e.g. same-origin tools) -> allow
    if (!origin) return callback(null, true);
    // If a specific CLIENT_URL is configured, allow it
    if (process.env.CLIENT_URL && origin === process.env.CLIENT_URL) return callback(null, true);
    // Allow any localhost origin during development (ports may vary)
    if (origin.includes('localhost')) return callback(null, true);
    // Otherwise reject
    return callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { success: false, message: 'Too many requests. Try again later.' },
});
app.use('/api/', limiter);

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { success: false, message: 'Too many login attempts. Try again later.' },
});
app.use('/api/auth/login', authLimiter);
app.use('/api/auth/register', authLimiter);

// Health check
app.get('/', (req, res) => {
    res.json({ success: true, message: '🎓 Course Management API is running!' });
});

// Routes
app.use('/api/auth', authRouter);
app.use('/api/courses', courseRouter);
app.use('/api/enrollments', enrollmentRouter);
app.use('/api/admin', adminRouter);
app.use('/api/stats', statsRouter);

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ success: false, message: 'Route not found.' });
});

// Global error handler (must be last)
app.use(errorHandler);

// Start Server
app.listen(port, () => {
    connectDB();
    console.log(`🚀 Server running on port ${port}`);
});
