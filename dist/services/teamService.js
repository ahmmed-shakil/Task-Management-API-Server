"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const teamMethods = __importStar(require("../methods/teams.prisma"));
class TeamService {
    async getAllTeams(query = {}) {
        try {
            const { page = 1, limit = 10, search, leaderId } = query;
            const result = await teamMethods.getAllTeams({
                page: parseInt(page),
                limit: parseInt(limit),
                search,
                leaderId,
            });
            return {
                success: true,
                message: "Teams retrieved successfully",
                data: {
                    teams: result.teams,
                    total: result.total,
                    page: result.page,
                    limit: result.limit,
                    totalPages: Math.ceil(result.total / result.limit),
                },
            };
        }
        catch (error) {
            throw new Error(`Failed to get teams: ${error.message}`);
        }
    }
    async createTeam(data) {
        try {
            const team = await teamMethods.createTeam({
                name: data.name,
                description: data.description,
                leaderId: data.leaderId,
            });
            return {
                success: true,
                message: "Team created successfully",
                data: team,
            };
        }
        catch (error) {
            throw new Error(`Failed to create team: ${error.message}`);
        }
    }
    async getTeamById(id) {
        try {
            const team = await teamMethods.getTeamById(id);
            if (!team) {
                return {
                    success: false,
                    message: "Team not found",
                    data: null,
                };
            }
            return {
                success: true,
                message: "Team retrieved successfully",
                data: team,
            };
        }
        catch (error) {
            throw new Error(`Failed to get team: ${error.message}`);
        }
    }
    async updateTeam(id, data) {
        try {
            const team = await teamMethods.updateTeam(id, data);
            if (!team) {
                return {
                    success: false,
                    message: "Team not found",
                    data: null,
                };
            }
            return {
                success: true,
                message: "Team updated successfully",
                data: team,
            };
        }
        catch (error) {
            throw new Error(`Failed to update team: ${error.message}`);
        }
    }
    async deleteTeam(id) {
        try {
            const team = await teamMethods.getTeamById(id);
            if (!team) {
                return {
                    success: false,
                    message: "Team not found",
                    data: null,
                };
            }
            await teamMethods.deleteTeam(id);
            return {
                success: true,
                message: "Team deleted successfully",
                data: null,
            };
        }
        catch (error) {
            throw new Error(`Failed to delete team: ${error.message}`);
        }
    }
    async getTeamMembers(teamId) {
        try {
            const team = await teamMethods.getTeamById(teamId);
            if (!team) {
                return {
                    success: false,
                    message: "Team not found",
                    data: null,
                };
            }
            const members = await teamMethods.getTeamMembers(teamId);
            return {
                success: true,
                message: "Team members retrieved successfully",
                data: members,
            };
        }
        catch (error) {
            throw new Error(`Failed to get team members: ${error.message}`);
        }
    }
    async addTeamMember(teamId, userId, role = "member") {
        try {
            const team = await teamMethods.getTeamById(teamId);
            if (!team) {
                return {
                    success: false,
                    message: "Team not found",
                    data: null,
                };
            }
            const member = await teamMethods.addTeamMember(teamId, userId, role);
            return {
                success: true,
                message: "Team member added successfully",
                data: member,
            };
        }
        catch (error) {
            throw new Error(`Failed to add team member: ${error.message}`);
        }
    }
    async removeTeamMember(teamId, userId) {
        try {
            const team = await teamMethods.getTeamById(teamId);
            if (!team) {
                return {
                    success: false,
                    message: "Team not found",
                    data: null,
                };
            }
            await teamMethods.removeTeamMember(teamId, userId);
            return {
                success: true,
                message: "Team member removed successfully",
                data: null,
            };
        }
        catch (error) {
            throw new Error(`Failed to remove team member: ${error.message}`);
        }
    }
    async getUserTeams(userId) {
        try {
            const teams = await teamMethods.getUserTeams(userId);
            return {
                success: true,
                message: "User teams retrieved successfully",
                data: teams,
            };
        }
        catch (error) {
            throw new Error(`Failed to get user teams: ${error.message}`);
        }
    }
}
exports.default = new TeamService();
