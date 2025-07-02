"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.optionalAuth = exports.authorizeRoles = exports.authenticateToken = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const users_prisma_1 = require("../methods/users.prisma");
const authenticateToken = async (req, res, next) => {
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
        const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET);
        const user = await (0, users_prisma_1.getUserById)(decoded.userId);
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
    }
    catch (error) {
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
exports.authenticateToken = authenticateToken;
const authorizeRoles = (...roles) => {
    return (req, res, next) => {
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
exports.authorizeRoles = authorizeRoles;
const optionalAuth = async (req, _res, next) => {
    try {
        const authHeader = req.headers["authorization"];
        const token = authHeader && authHeader.split(" ")[1];
        if (token) {
            const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET);
            const user = await (0, users_prisma_1.getUserById)(decoded.userId);
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
    }
    catch (error) {
        // If token is invalid, continue without user
        next();
    }
};
exports.optionalAuth = optionalAuth;
