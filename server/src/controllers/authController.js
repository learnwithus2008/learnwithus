import { authService } from "../services/authService.js";
import { config } from "../config/env.js";

function setSessionCookie(res, sessionToken, expiresAt) {
  res.cookie(config.cookieName, sessionToken, {
    httpOnly: true,
    secure: config.cookieSecure,
    sameSite: config.cookieSameSite,
    expires: new Date(expiresAt)
  });
}

function clearSessionCookie(res) {
  res.clearCookie(config.cookieName, {
    httpOnly: true,
    secure: config.cookieSecure,
    sameSite: config.cookieSameSite
  });
}

export const authController = {
  async register(req, res, next) {
    try {
      const meta = {
        ipAddress: req.ip || req.headers["x-forwarded-for"],
        userAgent: req.headers["user-agent"]
      };

      const { user, sessionToken, expiresAt } = await authService.register(req.body, meta);
      setSessionCookie(res, sessionToken, expiresAt);

      res.status(201).json({
        success: true,
        data: {
          user,
          token: sessionToken
        },
        message: "Account created successfully"
      });
    } catch (err) {
      next(err);
    }
  },

  async login(req, res, next) {
    try {
      const meta = {
        ipAddress: req.ip || req.headers["x-forwarded-for"],
        userAgent: req.headers["user-agent"]
      };

      const { user, sessionToken, expiresAt } = await authService.login(req.body, meta);
      setSessionCookie(res, sessionToken, expiresAt);

      res.status(200).json({
        success: true,
        data: {
          user,
          token: sessionToken
        },
        message: "Signed in successfully"
      });
    } catch (err) {
      next(err);
    }
  },

  async logout(req, res, next) {
    try {
      const authHeader = req.headers.authorization?.startsWith("Bearer ")
        ? req.headers.authorization.split(" ")[1]
        : null;
      const sessionToken = req.sessionToken || req.cookies?.[config.cookieName] || authHeader;
      if (sessionToken) {
        await authService.logout(sessionToken);
      }
      clearSessionCookie(res);

      res.status(200).json({
        success: true,
        message: "Signed out successfully"
      });
    } catch (err) {
      next(err);
    }
  },

  async getMe(req, res) {
    res.status(200).json({
      success: true,
      data: {
        user: req.user
      }
    });
  },

  async forgotPassword(req, res, next) {
    try {
      const result = await authService.forgotPassword(req.body.email);
      res.status(200).json({
        success: true,
        message: result.message,
        ...(process.env.NODE_ENV !== "production" && result.resetToken ? { data: { resetToken: result.resetToken } } : {})
      });
    } catch (err) {
      next(err);
    }
  },

  async resetPassword(req, res, next) {
    try {
      await authService.resetPassword(req.body);
      clearSessionCookie(res);

      res.status(200).json({
        success: true,
        message: "Password reset successfully. Please sign in with your new password."
      });
    } catch (err) {
      next(err);
    }
  }
};
