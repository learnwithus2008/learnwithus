import app from "./app.js";
import { config } from "./config/env.js";
import { pool, checkDatabaseHealth } from "./config/db.js";
import { runMigrations } from "../migrations/migrate.js";
import { runSeeds } from "../seeds/seed.js";

async function startServer() {
  const isDbHealthy = await checkDatabaseHealth();
  if (!isDbHealthy) {
    console.warn("WARNING: Unable to verify initial PostgreSQL connection on startup.");
  } else {
    console.log("Connected to PostgreSQL successfully.");
    try {
      console.log("Ensuring database migrations are up to date...");
      await runMigrations(config.databaseUrl);
      console.log("Database migrations verified.");
      if (config.seedOnStartup) {
        try {
          await runSeeds(config.databaseUrl);
          console.log("Demo test accounts verified.");
        } catch (seedErr) {
          console.warn("Seed verification note:", seedErr.message);
        }
      } else {
        console.log("Seed on startup disabled for production environment.");
      }
    } catch (migErr) {
      console.warn("Migration verification note:", migErr.message);
    }
  }

  const server = app.listen(config.port, config.host, () => {
    console.log(`Backend API Server running at http://${config.host}:${config.port}`);
    console.log(`Health Check available at: http://${config.host}:${config.port}/api/health`);
    console.log(`Configured Frontend Origin: ${config.frontendUrl}`);
  });

  const shutdown = async (signal, exitCode = 0) => {
    console.log(`\n[${new Date().toISOString()}] Received ${signal}. Shutting down gracefully...`);
    try {
      server.close(() => {
        console.log("HTTP server closed.");
      });
    } catch (closeErr) {
      console.error("Error closing HTTP server:", closeErr);
    }

    try {
      await pool.end();
      console.log("PostgreSQL connection pool closed.");
    } catch (err) {
      console.error("Error closing PostgreSQL pool:", err);
    }
    process.exit(exitCode);
  };

  process.on("SIGINT", () => shutdown("SIGINT", 0));
  process.on("SIGTERM", () => shutdown("SIGTERM", 0));

  process.on("unhandledRejection", (reason, promise) => {
    console.error(`[${new Date().toISOString()}] [CRITICAL] Unhandled Promise Rejection at:`, promise, "reason:", reason);
  });

  process.on("uncaughtException", (err) => {
    console.error(`[${new Date().toISOString()}] [FATAL] Uncaught Exception:`, err);
    // Graceful shutdown after flushing log to prevent undefined application state
    shutdown("FATAL_UNCAUGHT_EXCEPTION", 1);
  });
}

startServer().catch((err) => {
  console.error("Fatal server startup error:", err);
  process.exit(1);
});
