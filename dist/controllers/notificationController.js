"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const notificationService_1 = __importDefault(require("../services/notificationService"));
const express_validator_1 = require("express-validator");
class NotificationController {
    async getNotifications(req, res, next) {
        try {
            const errors = (0, express_validator_1.validationResult)(req);
            if (!errors.isEmpty()) {
                res.status(400).json({
                    success: false,
                    message: "Validation failed",
                    errors: errors.array(),
                });
                return;
            }
            const result = await notificationService_1.default.getNotifications(req.user.id, req.query);
            res.json(result);
        }
        catch (error) {
            next(error);
        }
    }
    async getNotificationById(req, res, next) {
        try {
            const result = await notificationService_1.default.getNotificationById(req.params.id, req.user.id);
            res.json(result);
        }
        catch (error) {
            next(error);
        }
    }
    async createNotification(req, res, next) {
        try {
            const errors = (0, express_validator_1.validationResult)(req);
            if (!errors.isEmpty()) {
                res.status(400).json({
                    success: false,
                    message: "Validation failed",
                    errors: errors.array(),
                });
                return;
            }
            // Set the current user as the recipient if not specified
            const notificationData = {
                ...req.body,
                userId: req.body.userId || req.user.id,
            };
            const result = await notificationService_1.default.createNotification(notificationData);
            res.status(201).json(result);
        }
        catch (error) {
            next(error);
        }
    }
    async markAsRead(req, res, next) {
        try {
            const result = await notificationService_1.default.markAsRead(req.params.id, req.user.id);
            res.json(result);
        }
        catch (error) {
            next(error);
        }
    }
    async markAllAsRead(req, res, next) {
        try {
            const result = await notificationService_1.default.markAllAsRead(req.user.id);
            res.json(result);
        }
        catch (error) {
            next(error);
        }
    }
    async deleteNotification(req, res, next) {
        try {
            const result = await notificationService_1.default.deleteNotification(req.params.id, req.user.id);
            res.json(result);
        }
        catch (error) {
            next(error);
        }
    }
    async getUnreadCount(req, res, next) {
        try {
            const result = await notificationService_1.default.getUnreadCount(req.user.id);
            res.json(result);
        }
        catch (error) {
            next(error);
        }
    }
}
exports.default = new NotificationController();
