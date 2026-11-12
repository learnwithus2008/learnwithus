import { authService } from "../services/authService.js";
import { config } from "../config/env.js";

export async function requireAuth(req, res, next) {
  try {
    let sessionToken = req.cookies?.[config.cookieName];

    // Fallback to Bearer token header if cookie is not present
    if (!sessionToken && req.headers.authorization?.startsWith("Bearer ")) {
      sessionToken = req.headers.authorization.split(" ")[1];
    }

    if (!sessionToken) {
      return res.status(401).json({
        success: false,
        error: "Authentication required. Please sign in."
      });
    }

    const user = await authService.getSessionUser(sessionToken);
    if (!user) {
      // Clear invalid cookie
      res.clearCookie(config.cookieName, {
        httpOnly: true,
        secure: config.cookieSecure,
        sameSite: config.cookieSameSite
      });

      return res.status(401).json({
        success: false,
        error: "Session expired or invalid. Please sign in again."
      });
    }

    req.user = user;
    req.sessionToken = sessionToken;
    next();
  } catch (err) {
    next(err);
  }
}

export function requireAdmin(req, res, next) {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      error: "Authentication required. Please sign in."
    });
  }

  if (req.user.role !== "admin") {
    return res.status(403).json({
      success: false,
      error: "Access denied. Administrator privileges required."
    });
  }

  next();
}

