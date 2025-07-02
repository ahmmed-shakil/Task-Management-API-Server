"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUserTeams = exports.isTeamMember = exports.removeTeamMember = exports.addTeamMember = exports.getTeamMembers = exports.deleteTeam = exports.updateTeam = exports.getTeamById = exports.createTeam = exports.getAllTeams = void 0;
const prisma_1 = require("../config/prisma");
// Helper function to map Prisma team to Team interface
const mapPrismaTeamToTeam = (prismaTeam) => {
    return {
        id: prismaTeam.id,
        name: prismaTeam.name,
        description: prismaTeam.description,
        leaderId: prismaTeam.leaderId,
        isActive: prismaTeam.isActive,
        createdAt: prismaTeam.createdAt,
        updatedAt: prismaTeam.updatedAt,
    };
};
// Helper function to map Prisma team member to TeamMember interface
const mapPrismaTeamMemberToTeamMember = (prismaTeamMember) => {
    return {
        id: prismaTeamMember.id,
        teamId: prismaTeamMember.teamId,
        userId: prismaTeamMember.userId,
        role: prismaTeamMember.role,
    };
};
// Get all teams with filters
const getAllTeams = async (filters = {}) => {
    try {
        const { page = 1, limit = 10, search, leaderId } = filters;
        const skip = (page - 1) * limit;
        const where = {
            isActive: true,
        };
        if (search) {
            where.OR = [
                { name: { contains: search, mode: "insensitive" } },
                { description: { contains: search, mode: "insensitive" } },
            ];
        }
        if (leaderId) {
            where.leaderId = leaderId;
        }
        const [teams, total] = await Promise.all([
            prisma_1.prisma.team.findMany({
                where,
                orderBy: { name: "asc" },
                skip,
                take: limit,
            }),
            prisma_1.prisma.team.count({ where }),
        ]);
        return {
            teams: teams.map(mapPrismaTeamToTeam),
            total,
            page,
            limit,
        };
    }
    catch (error) {
        console.error("Error getting teams:", error);
        throw new Error("Failed to get teams");
    }
};
exports.getAllTeams = getAllTeams;
// Create a new team
const createTeam = async (data) => {
    try {
        const team = await prisma_1.prisma.team.create({
            data: {
                name: data.name,
                description: data.description === undefined ? null : data.description,
                leaderId: data.leaderId,
            },
        });
        // Add the leader as a member with "leader" role
        await prisma_1.prisma.teamMember.create({
            data: {
                teamId: team.id,
                userId: data.leaderId,
                role: "leader",
            },
        });
        return mapPrismaTeamToTeam(team);
    }
    catch (error) {
        console.error("Error creating team:", error);
        throw new Error("Failed to create team");
    }
};
exports.createTeam = createTeam;
// Get team by ID
const getTeamById = async (id) => {
    try {
        const team = await prisma_1.prisma.team.findUnique({
            where: { id },
            include: {
                leader: {
                    select: {
                        id: true,
                        email: true,
                        firstName: true,
                        lastName: true,
                        avatar: true,
                    },
                },
                members: {
                    include: {
                        user: {
                            select: {
                                id: true,
                                email: true,
                                firstName: true,
                                lastName: true,
                                avatar: true,
                            },
                        },
                    },
                },
            },
        });
        if (!team) {
            return null;
        }
        return {
            ...mapPrismaTeamToTeam(team),
            leader: team.leader,
            members: team.members,
        };
    }
    catch (error) {
        console.error("Error getting team by ID:", error);
        throw new Error("Failed to get team");
    }
};
exports.getTeamById = getTeamById;
// Update team
const updateTeam = async (id, data) => {
    try {
        const team = await prisma_1.prisma.team.update({
            where: { id },
            data,
        });
        return mapPrismaTeamToTeam(team);
    }
    catch (error) {
        console.error("Error updating team:", error);
        throw new Error("Failed to update team");
    }
};
exports.updateTeam = updateTeam;
// Delete team
const deleteTeam = async (id) => {
    try {
        await prisma_1.prisma.team.delete({
            where: { id },
        });
    }
    catch (error) {
        console.error("Error deleting team:", error);
        throw new Error("Failed to delete team");
    }
};
exports.deleteTeam = deleteTeam;
// Get team members
const getTeamMembers = async (teamId) => {
    try {
        const members = await prisma_1.prisma.teamMember.findMany({
            where: { teamId },
            include: {
                user: {
                    select: {
                        id: true,
                        email: true,
                        firstName: true,
                        lastName: true,
                        avatar: true,
                    },
                },
            },
        });
        return members.map(mapPrismaTeamMemberToTeamMember);
    }
    catch (error) {
        console.error("Error getting team members:", error);
        throw new Error("Failed to get team members");
    }
};
exports.getTeamMembers = getTeamMembers;
// Add team member
const addTeamMember = async (teamId, userId, role = "member") => {
    try {
        // Check if user is already a member
        const existingMember = await prisma_1.prisma.teamMember.findFirst({
            where: {
                teamId,
                userId,
            },
        });
        if (existingMember) {
            throw new Error("User is already a member of this team");
        }
        const member = await prisma_1.prisma.teamMember.create({
            data: {
                teamId,
                userId,
                role,
            },
            include: {
                user: {
                    select: {
                        id: true,
                        email: true,
                        firstName: true,
                        lastName: true,
                        avatar: true,
                    },
                },
            },
        });
        return mapPrismaTeamMemberToTeamMember(member);
    }
    catch (error) {
        console.error("Error adding team member:", error);
        throw new Error("Failed to add team member");
    }
};
exports.addTeamMember = addTeamMember;
// Remove team member
const removeTeamMember = async (teamId, userId) => {
    try {
        // Check if user is the team leader
        const team = await prisma_1.prisma.team.findUnique({
            where: { id: teamId },
        });
        if (!team) {
            throw new Error("Team not found");
        }
        if (team.leaderId === userId) {
            throw new Error("Cannot remove the team leader");
        }
        await prisma_1.prisma.teamMember.deleteMany({
            where: {
                teamId,
                userId,
            },
        });
    }
    catch (error) {
        console.error("Error removing team member:", error);
        throw new Error("Failed to remove team member");
    }
};
exports.removeTeamMember = removeTeamMember;
// Check if user is a member of a team
const isTeamMember = async (teamId, userId) => {
    try {
        const count = await prisma_1.prisma.teamMember.count({
            where: {
                teamId,
                userId,
            },
        });
        return count > 0;
    }
    catch (error) {
        console.error("Error checking team membership:", error);
        throw new Error("Failed to check team membership");
    }
};
exports.isTeamMember = isTeamMember;
// Get teams for a user
const getUserTeams = async (userId) => {
    try {
        const teamMembers = await prisma_1.prisma.teamMember.findMany({
            where: { userId },
            include: {
                team: true,
            },
        });
        return teamMembers.map((member) => mapPrismaTeamToTeam(member.team));
    }
    catch (error) {
        console.error("Error getting user teams:", error);
        throw new Error("Failed to get user teams");
    }
};
exports.getUserTeams = getUserTeams;
