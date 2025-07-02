import jwt from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";
import { getUserById } from "../methods/users.prisma";
import { UserRole } from "../types/index";

export const authenticateToken = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1]; // Bearer TOKEN

    if (!token) {
      res.status(401).json({
        success: false,
        message: "Access token is required",
      });
      return;
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as {
      userId: string;
    };
    const user = await getUserById(decoded.userId);

    if (!user) {
      res.status(401).json({
        success: false,
        message: "Invalid token - user not found",
      });
      return;
    }

    if (!user.isActive) {
      res.status(401).json({
        success: false,
        message: "Account is deactivated",
      });
      return;
    }

    // Assign user to request object
    req.user = {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      avatar: user.avatar ?? null,
      role: user.role,
      isActive: user.isActive,
      emailVerified: user.emailVerified,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      ...(user.lastLogin ? { lastLogin: user.lastLogin } : {}),
    };
    next();
  } catch (error) {
    if (error instanceof Error && error.name === "TokenExpiredError") {
      res.status(401).json({
        success: false,
        message: "Token has expired",
      });
      return;
    }

    res.status(403).json({
      success: false,
      message: "Invalid token",
    });
  }
};

export const authorizeRoles = (...roles: UserRole[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: "Authentication required",
      });
      return;
    }

    if (!roles.includes(req.user.role)) {
      res.status(403).json({
        success: false,
        message: "Insufficient permissions",
      });
      return;
    }

    next();
  };
};

export const optionalAuth = async (
  req: Request,
  _res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];

    if (token) {
      const decoded = jwt.verify(token, process.env.JWT_SECRET!) as {
        userId: string;
      };
      const user = await getUserById(decoded.userId);

      if (user && user.isActive) {
        req.user = {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          avatar: user.avatar ?? null,
          role: user.role,
          isActive: user.isActive,
          emailVerified: user.emailVerified,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt,
          ...(user.lastLogin ? { lastLogin: user.lastLogin } : {}),
        };
      }
    }

    next();
  } catch (error) {
    // If token is invalid, continue without user
    next();
  }
};
