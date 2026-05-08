const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const dotenv = require("dotenv");

dotenv.config();

const connectDB = require("./Database/db");
const { errorHandler } = require("./Middleware/errorMiddleware");

const authRouter = require("./Routers/authRouter");
const courseRouter = require("./Routers/courseRouter");
const enrollmentRouter = require("./Routers/enrollmentRouter");
const adminRouter = require("./Routers/adminRouter");

const app = express();

// Connect to MongoDB
connectDB();

// Security Middleware
app.use(helmet());
app.use(cors({ origin: process.env.CLIENT_URL || "*" }));

// Rate limiting (100 requests per 15 min per IP)
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { success: false, message: "Too many requests. Try again later." },
});
app.use("/api/", limiter);

// Stricter limiter for auth routes
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { success: false, message: "Too many login attempts. Try again later." },
});
app.use("/api/auth/login", authLimiter);
app.use("/api/auth/register", authLimiter);

// Body parser
app.use(express.json({ limit: "10kb" }));
app.use(express.urlencoded({ extended: true }));

// Health check
app.get("/", (req, res) => {
  res.json({ success: true, message: "🎓 Skillpath API is running!" });
});

// Routes
app.use("/api/auth", authRouter);
app.use("/api/courses", courseRouter);
app.use("/api/enrollments", enrollmentRouter);
app.use("/api/admin", adminRouter);

// 404 handler
app.use("*", (req, res) => {
  res.status(404).json({ success: false, message: "Route not found." });
});

// Global error handler (must be last)
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Skillpath server running on port ${PORT}`);
});
