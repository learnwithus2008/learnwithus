import path from "path";
import dotenv from "dotenv";

dotenv.config({ path: path.resolve(process.cwd(), "server/.env") });
dotenv.config();

const isProduction =
  process.env.NODE_ENV === "production" ||
  process.env.RENDER === "true" ||
  process.env.IS_RENDER === "true";

export const config = {
  port: parseInt(process.env.PORT || "5000", 10),
  host: process.env.HOST || "0.0.0.0",
  nodeEnv: process.env.NODE_ENV || (isProduction ? "production" : "development"),
  databaseUrl: process.env.DATABASE_URL || "postgresql://postgres:12345@localhost:5432/python_adaptive_db",
  testDatabaseUrl: process.env.TEST_DATABASE_URL || "postgresql://postgres:12345@localhost:5432/python_adaptive_test_db",
  sessionSecret: process.env.SESSION_SECRET || "default_session_secret_change_me",
  sessionExpiryDays: parseInt(process.env.SESSION_EXPIRY_DAYS || "14", 10),
  cookieSecure: process.env.COOKIE_SECURE === "true" || isProduction,
  cookieSameSite: process.env.COOKIE_SAME_SITE || (isProduction ? "none" : "lax"),
  frontendUrl: process.env.FRONTEND_URL || "https://pythonlearning.vercel.app",
  allowedOrigins: (process.env.ALLOWED_ORIGINS || "")
    .split(",")
    .map((o) => o.trim())
    .filter(Boolean),
  seedOnStartup: process.env.SEED_ON_STARTUP === "true" || !isProduction,
  cookieName: "py_adaptive_session_id"
};
