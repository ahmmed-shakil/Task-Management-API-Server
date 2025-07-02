"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const projectService_1 = __importDefault(require("../services/projectService"));
const express_validator_1 = require("express-validator");
class ProjectController {
    async getAllProjects(req, res, next) {
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
            const result = await projectService_1.default.getAllProjects(req.user.id, req.query);
            res.json(result);
        }
        catch (error) {
            next(error);
        }
    }
    async createProject(req, res, next) {
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
            const result = await projectService_1.default.createProject(req.user.id, req.body);
            res.status(201).json(result);
        }
        catch (error) {
            next(error);
        }
    }
    async getProjectById(req, res, next) {
        try {
            const result = await projectService_1.default.getProjectById(req.params.id, req.user.id);
            res.json(result);
        }
        catch (error) {
            next(error);
        }
    }
    async updateProject(req, res, next) {
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
            const result = await projectService_1.default.updateProject(req.params.id, req.user.id, req.body);
            res.json(result);
        }
        catch (error) {
            next(error);
        }
    }
    async deleteProject(req, res, next) {
        try {
            const result = await projectService_1.default.deleteProject(req.params.id, req.user.id);
            res.json(result);
        }
        catch (error) {
            next(error);
        }
    }
    async getProjectMembers(req, res, next) {
        try {
            const result = await projectService_1.default.getProjectMembers(req.params.id, req.user.id);
            res.json(result);
        }
        catch (error) {
            next(error);
        }
    }
    async addProjectMember(req, res, next) {
        try {
            const result = await projectService_1.default.addProjectMember(req.params.id, req.user.id, req.body);
            res.status(201).json(result);
        }
        catch (error) {
            next(error);
        }
    }
    async removeProjectMember(req, res, next) {
        try {
            const result = await projectService_1.default.removeProjectMember(req.params.id, req.params.memberId, req.user.id);
            res.json(result);
        }
        catch (error) {
            next(error);
        }
    }
    async getUserProjects(req, res, next) {
        try {
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 10;
            const result = await projectService_1.default.getUserProjects(req.user.id, page, limit);
            res.json(result);
        }
        catch (error) {
            next(error);
        }
    }
}
exports.default = new ProjectController();
