import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { config } from "./config/env.js";
import authRoutes from "./routes/authRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import progressRoutes from "./routes/progressRoutes.js";
import bookmarkRoutes from "./routes/bookmarkRoutes.js";
import rewardRoutes from "./routes/rewardRoutes.js";
import doubtRoutes from "./routes/doubtRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import healthRoutes from "./routes/healthRoutes.js";
import { errorHandler } from "./middleware/errorHandler.js";

const app = express();

// Disable x-powered-by header to avoid leaking backend framework details
app.disable("x-powered-by");

// Trust proxy for rate limiting behind reverse proxies (Render, Cloudflare)
app.set("trust proxy", 1);

// Standard security headers middleware
app.use((req, res, next) => {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "DENY");
  res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
  next();
});

// CORS configuration matching frontend URLs and preview domains with credentials
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (mobile apps, server-to-server, curl, Postman)
      if (!origin) return callback(null, true);

      // Known production & local development origins
      const allowedOrigins = [
        config.frontendUrl,
        "https://pythonlearning.vercel.app",
        "http://localhost:5173",
        "http://localhost:5174",
        "http://localhost:4173",
        "http://127.0.0.1:5173",
        "http://127.0.0.1:5174",
        "http://127.0.0.1:4173",
        "http://127.0.0.1:5000",
        ...config.allowedOrigins
      ].filter(Boolean);

      const isExplicitMatch = allowedOrigins.includes(origin);
      const isCloudflarePages = origin.endsWith(".pages.dev");
      const isVercel = origin.endsWith(".vercel.app");
      const isLocalhost = /^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin);

      if (isExplicitMatch || isCloudflarePages || isVercel || isLocalhost) {
        callback(null, true);
      } else {
        if (config.nodeEnv === "production") {
          callback(new Error(`CORS error: Origin ${origin} not allowed`));
        } else {
          callback(null, true);
        }
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"]
  })
);

app.use(express.json({ limit: "1mb" }));
app.use(cookieParser());

// API Routes
app.use("/api", healthRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/progress", progressRoutes);
app.use("/api/bookmarks", bookmarkRoutes);
app.use("/api/rewards", rewardRoutes);
app.use("/api/doubts", doubtRoutes);

// 404 Not Found Handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: `Endpoint ${req.method} ${req.originalUrl} not found`
  });
});

// Central Error Handler
app.use(errorHandler);

export default app;
