"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const teamService_1 = __importDefault(require("../services/teamService"));
const express_validator_1 = require("express-validator");
class TeamController {
    async getAllTeams(req, res, next) {
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
            const result = await teamService_1.default.getAllTeams(req.query);
            res.json(result);
        }
        catch (error) {
            next(error);
        }
    }
    async createTeam(req, res, next) {
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
            // Set the current user as the leader if not specified
            const teamData = {
                ...req.body,
                leaderId: req.body.leaderId || req.user.id,
            };
            const result = await teamService_1.default.createTeam(teamData);
            res.status(201).json(result);
        }
        catch (error) {
            next(error);
        }
    }
    async getTeamById(req, res, next) {
        try {
            const result = await teamService_1.default.getTeamById(req.params.id);
            res.json(result);
        }
        catch (error) {
            next(error);
        }
    }
    async updateTeam(req, res, next) {
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
            const result = await teamService_1.default.updateTeam(req.params.id, req.body);
            res.json(result);
        }
        catch (error) {
            next(error);
        }
    }
    async deleteTeam(req, res, next) {
        try {
            const result = await teamService_1.default.deleteTeam(req.params.id);
            res.json(result);
        }
        catch (error) {
            next(error);
        }
    }
    async getTeamMembers(req, res, next) {
        try {
            const result = await teamService_1.default.getTeamMembers(req.params.id);
            res.json(result);
        }
        catch (error) {
            next(error);
        }
    }
    async addTeamMember(req, res, next) {
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
            const result = await teamService_1.default.addTeamMember(req.params.id, req.body.userId, req.body.role);
            res.status(201).json(result);
        }
        catch (error) {
            next(error);
        }
    }
    async removeTeamMember(req, res, next) {
        try {
            const result = await teamService_1.default.removeTeamMember(req.params.id, req.params.userId);
            res.json(result);
        }
        catch (error) {
            next(error);
        }
    }
    async getUserTeams(req, res, next) {
        try {
            const result = await teamService_1.default.getUserTeams(req.user.id);
            res.json(result);
        }
        catch (error) {
            next(error);
        }
    }
}
exports.default = new TeamController();
