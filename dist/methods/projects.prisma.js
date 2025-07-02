"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAllProjects = exports.getUserProjects = exports.removeProjectMember = exports.addProjectMember = exports.getProjectMembers = exports.isProjectMember = exports.calculateProjectProgress = exports.restoreProject = exports.archiveProject = exports.updateProjectStatus = exports.updateProjectProgress = exports.getProjectsByTeam = exports.getProjectsByOwner = exports.getProjects = exports.deleteProject = exports.updateProject = exports.createProject = exports.getProjectWithDetails = exports.getProjectById = void 0;
const prisma_1 = require("../config/prisma");
const client_1 = require("@prisma/client");
// Helper function to map Prisma project to Project interface
const mapPrismaProjectToProject = (prismaProject) => {
    return {
        id: prismaProject.id,
        name: prismaProject.name,
        description: prismaProject.description,
        status: prismaProject.status,
        priority: prismaProject.priority,
        start_date: prismaProject.startDate,
        end_date: prismaProject.endDate,
        owner_id: prismaProject.ownerId,
        team_id: prismaProject.teamId,
        budget: prismaProject.budget
            ? parseFloat(prismaProject.budget.toString())
            : null,
        progress: prismaProject.progress,
        is_active: prismaProject.isActive,
        created_at: prismaProject.createdAt,
        updated_at: prismaProject.updatedAt,
    };
};
// Get project by ID
const getProjectById = async (id) => {
    try {
        const project = await prisma_1.prisma.project.findUnique({
            where: { id },
        });
        if (!project) {
            return null;
        }
        return mapPrismaProjectToProject(project);
    }
    catch (error) {
        console.error("Error getting project by ID:", error);
        throw new Error("Failed to get project");
    }
};
exports.getProjectById = getProjectById;
// Get project with details
const getProjectWithDetails = async (id) => {
    try {
        const project = await prisma_1.prisma.project.findUnique({
            where: { id },
            include: {
                owner: {
                    select: {
                        id: true,
                        email: true,
                        firstName: true,
                        lastName: true,
                        avatar: true,
                    },
                },
                team: {
                    select: {
                        id: true,
                        name: true,
                        _count: {
                            select: {
                                members: true,
                            },
                        },
                    },
                },
                tasks: {
                    select: {
                        status: true,
                    },
                    where: {
                        isArchived: false,
                    },
                },
            },
        });
        if (!project) {
            return null;
        }
        const baseProject = mapPrismaProjectToProject(project);
        // Calculate task statistics
        const taskStats = {
            total: project.tasks.length,
            completed: project.tasks.filter((task) => task.status === "completed")
                .length,
            inProgress: project.tasks.filter((task) => task.status === "in_progress")
                .length,
            todo: project.tasks.filter((task) => task.status === "todo").length,
        };
        return {
            ...baseProject,
            owner: {
                id: project.owner.id,
                email: project.owner.email,
                firstName: project.owner.firstName,
                lastName: project.owner.lastName,
                avatar: project.owner.avatar,
            },
            team: project.team
                ? {
                    id: project.team.id,
                    name: project.team.name,
                    memberCount: project.team._count.members,
                }
                : null,
            taskStats,
        };
    }
    catch (error) {
        console.error("Error getting project with details:", error);
        throw new Error("Failed to get project details");
    }
};
exports.getProjectWithDetails = getProjectWithDetails;
// Create new project
const createProject = async (projectData) => {
    const { name, description, status = "planning", priority = "medium", startDate, endDate, ownerId, teamId, budget, } = projectData;
    try {
        const project = await prisma_1.prisma.project.create({
            data: {
                name,
                description: description ?? null,
                status: status,
                priority: priority,
                startDate: startDate ? new Date(startDate) : null,
                endDate: endDate ? new Date(endDate) : null,
                ownerId,
                teamId: teamId ?? null,
                budget: budget ? new client_1.Prisma.Decimal(budget) : null,
            },
        });
        return mapPrismaProjectToProject(project);
    }
    catch (error) {
        console.error("Error creating project:", error);
        throw new Error("Failed to create project");
    }
};
exports.createProject = createProject;
// Update project
const updateProject = async (id, updateData) => {
    try {
        const updateFields = {};
        if (updateData.name !== undefined)
            updateFields.name = updateData.name;
        if (updateData.description !== undefined)
            updateFields.description = updateData.description ?? null;
        if (updateData.status !== undefined)
            updateFields.status = updateData.status;
        if (updateData.priority !== undefined)
            updateFields.priority = updateData.priority;
        if (updateData.startDate !== undefined)
            updateFields.startDate = updateData.startDate
                ? new Date(updateData.startDate)
                : null;
        if (updateData.endDate !== undefined)
            updateFields.endDate = updateData.endDate
                ? new Date(updateData.endDate)
                : null;
        if (updateData.teamId !== undefined)
            updateFields.teamId = updateData.teamId ?? null;
        if (updateData.budget !== undefined)
            updateFields.budget = updateData.budget
                ? new client_1.Prisma.Decimal(updateData.budget)
                : null;
        const project = await prisma_1.prisma.project.update({
            where: { id },
            data: updateFields,
        });
        return mapPrismaProjectToProject(project);
    }
    catch (error) {
        if (error instanceof client_1.Prisma.PrismaClientKnownRequestError) {
            if (error.code === "P2025") {
                return null; // Project not found
            }
        }
        console.error("Error updating project:", error);
        throw new Error("Failed to update project");
    }
};
exports.updateProject = updateProject;
// Delete project
const deleteProject = async (id) => {
    try {
        await prisma_1.prisma.project.delete({
            where: { id },
        });
        return true;
    }
    catch (error) {
        if (error instanceof client_1.Prisma.PrismaClientKnownRequestError) {
            if (error.code === "P2025") {
                return false; // Project not found
            }
        }
        console.error("Error deleting project:", error);
        throw new Error("Failed to delete project");
    }
};
exports.deleteProject = deleteProject;
// Get all projects with pagination and filters
const getProjects = async (filters) => {
    const { page = 1, limit = 10, search, status, priority, ownerId, teamId, isActive, } = filters;
    try {
        const skip = (page - 1) * limit;
        const where = {};
        if (search) {
            where.OR = [
                { name: { contains: search, mode: "insensitive" } },
                { description: { contains: search, mode: "insensitive" } },
            ];
        }
        if (status) {
            if (Array.isArray(status)) {
                where.status = { in: status };
            }
            else {
                where.status = status;
            }
        }
        if (priority) {
            if (Array.isArray(priority)) {
                where.priority = { in: priority };
            }
            else {
                where.priority = priority;
            }
        }
        if (ownerId) {
            where.ownerId = ownerId;
        }
        if (teamId) {
            where.teamId = teamId;
        }
        if (isActive !== undefined) {
            where.isActive = isActive;
        }
        const [projects, total] = await Promise.all([
            prisma_1.prisma.project.findMany({
                where,
                include: {
                    owner: {
                        select: {
                            id: true,
                            email: true,
                            firstName: true,
                            lastName: true,
                            avatar: true,
                        },
                    },
                    team: {
                        select: {
                            id: true,
                            name: true,
                            _count: {
                                select: {
                                    members: true,
                                },
                            },
                        },
                    },
                    tasks: {
                        select: {
                            status: true,
                        },
                        where: {
                            isArchived: false,
                        },
                    },
                },
                skip,
                take: limit,
                orderBy: { createdAt: "desc" },
            }),
            prisma_1.prisma.project.count({ where }),
        ]);
        const projectsWithDetails = projects.map((project) => {
            const baseProject = mapPrismaProjectToProject(project);
            // Calculate task statistics
            const taskStats = {
                total: project.tasks.length,
                completed: project.tasks.filter((task) => task.status === "completed")
                    .length,
                inProgress: project.tasks.filter((task) => task.status === "in_progress").length,
                todo: project.tasks.filter((task) => task.status === "todo").length,
            };
            return {
                ...baseProject,
                owner: project.owner,
                team: project.team
                    ? {
                        id: project.team.id,
                        name: project.team.name,
                        memberCount: project.team._count.members,
                    }
                    : null,
                taskStats,
            };
        });
        return {
            projects: projectsWithDetails,
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
        };
    }
    catch (error) {
        console.error("Error getting projects:", error);
        throw new Error("Failed to get projects");
    }
};
exports.getProjects = getProjects;
// Get projects by owner
const getProjectsByOwner = async (ownerId, filters) => {
    return (0, exports.getProjects)({ ...filters, ownerId });
};
exports.getProjectsByOwner = getProjectsByOwner;
// Get projects by team
const getProjectsByTeam = async (teamId, filters) => {
    return (0, exports.getProjects)({ ...filters, teamId });
};
exports.getProjectsByTeam = getProjectsByTeam;
// Update project progress
const updateProjectProgress = async (id, progress) => {
    try {
        const project = await prisma_1.prisma.project.update({
            where: { id },
            data: { progress: Math.max(0, Math.min(100, progress)) }, // Clamp between 0-100
        });
        return mapPrismaProjectToProject(project);
    }
    catch (error) {
        if (error instanceof client_1.Prisma.PrismaClientKnownRequestError) {
            if (error.code === "P2025") {
                return null; // Project not found
            }
        }
        console.error("Error updating project progress:", error);
        throw new Error("Failed to update project progress");
    }
};
exports.updateProjectProgress = updateProjectProgress;
// Update project status
const updateProjectStatus = async (id, status) => {
    try {
        const project = await prisma_1.prisma.project.update({
            where: { id },
            data: { status },
        });
        return mapPrismaProjectToProject(project);
    }
    catch (error) {
        if (error instanceof client_1.Prisma.PrismaClientKnownRequestError) {
            if (error.code === "P2025") {
                return null; // Project not found
            }
        }
        console.error("Error updating project status:", error);
        throw new Error("Failed to update project status");
    }
};
exports.updateProjectStatus = updateProjectStatus;
// Archive project
const archiveProject = async (id) => {
    try {
        await prisma_1.prisma.project.update({
            where: { id },
            data: { isActive: false },
        });
        return true;
    }
    catch (error) {
        if (error instanceof client_1.Prisma.PrismaClientKnownRequestError) {
            if (error.code === "P2025") {
                return false; // Project not found
            }
        }
        console.error("Error archiving project:", error);
        throw new Error("Failed to archive project");
    }
};
exports.archiveProject = archiveProject;
// Restore project
const restoreProject = async (id) => {
    try {
        await prisma_1.prisma.project.update({
            where: { id },
            data: { isActive: true },
        });
        return true;
    }
    catch (error) {
        if (error instanceof client_1.Prisma.PrismaClientKnownRequestError) {
            if (error.code === "P2025") {
                return false; // Project not found
            }
        }
        console.error("Error restoring project:", error);
        throw new Error("Failed to restore project");
    }
};
exports.restoreProject = restoreProject;
// Calculate and update project progress based on tasks
const calculateProjectProgress = async (id) => {
    try {
        const project = await prisma_1.prisma.project.findUnique({
            where: { id },
            include: {
                tasks: {
                    select: {
                        status: true,
                    },
                    where: {
                        isArchived: false,
                    },
                },
            },
        });
        if (!project) {
            throw new Error("Project not found");
        }
        const totalTasks = project.tasks.length;
        if (totalTasks === 0) {
            return 0;
        }
        const completedTasks = project.tasks.filter((task) => task.status === "completed").length;
        const progress = Math.round((completedTasks / totalTasks) * 100);
        // Update the project with calculated progress
        await prisma_1.prisma.project.update({
            where: { id },
            data: { progress },
        });
        return progress;
    }
    catch (error) {
        console.error("Error calculating project progress:", error);
        throw new Error("Failed to calculate project progress");
    }
};
exports.calculateProjectProgress = calculateProjectProgress;
// Check if user is a project member
const isProjectMember = async (projectId, userId) => {
    try {
        const project = await prisma_1.prisma.project.findUnique({
            where: { id: projectId },
            include: {
                team: {
                    include: {
                        members: {
                            where: { userId },
                            select: { role: true },
                        },
                    },
                },
            },
        });
        if (!project) {
            return null;
        }
        // Check if user is the owner
        if (project.ownerId === userId) {
            return "owner";
        }
        // Check if user is a team member
        if (project.team && project.team.members.length > 0) {
            return project.team.members[0]?.role || "member";
        }
        return null;
    }
    catch (error) {
        console.error("Error checking project membership:", error);
        throw new Error("Failed to check project membership");
    }
};
exports.isProjectMember = isProjectMember;
// Get project members
const getProjectMembers = async (projectId) => {
    try {
        const project = await prisma_1.prisma.project.findUnique({
            where: { id: projectId },
            include: {
                owner: {
                    select: {
                        id: true,
                        email: true,
                        firstName: true,
                        lastName: true,
                        avatar: true,
                    },
                },
                team: {
                    include: {
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
                },
            },
        });
        if (!project) {
            throw new Error("Project not found");
        }
        const members = [
            {
                ...project.owner,
                role: "owner",
            },
        ];
        if (project.team) {
            project.team.members.forEach((member) => {
                members.push({
                    ...member.user,
                    role: member.role,
                });
            });
        }
        return members;
    }
    catch (error) {
        console.error("Error getting project members:", error);
        throw new Error("Failed to get project members");
    }
};
exports.getProjectMembers = getProjectMembers;
// Add project member (via team)
const addProjectMember = async (projectId, userId, role = "member") => {
    try {
        const project = await prisma_1.prisma.project.findUnique({
            where: { id: projectId },
            select: { teamId: true },
        });
        if (!project) {
            throw new Error("Project not found");
        }
        if (!project.teamId) {
            throw new Error("Project does not have a team");
        }
        const member = await prisma_1.prisma.teamMember.create({
            data: {
                teamId: project.teamId,
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
        return {
            ...member.user,
            role: member.role,
        };
    }
    catch (error) {
        console.error("Error adding project member:", error);
        throw new Error("Failed to add project member");
    }
};
exports.addProjectMember = addProjectMember;
// Remove project member
const removeProjectMember = async (projectId, userId) => {
    try {
        const project = await prisma_1.prisma.project.findUnique({
            where: { id: projectId },
            select: { teamId: true },
        });
        if (!project || !project.teamId) {
            return false;
        }
        await prisma_1.prisma.teamMember.delete({
            where: {
                teamId_userId: {
                    teamId: project.teamId,
                    userId,
                },
            },
        });
        return true;
    }
    catch (error) {
        console.error("Error removing project member:", error);
        throw new Error("Failed to remove project member");
    }
};
exports.removeProjectMember = removeProjectMember;
// Get user projects (owned or member)
const getUserProjects = async (userId, filters) => {
    try {
        const whereCondition = {
            OR: [
                { ownerId: userId },
                {
                    team: {
                        members: {
                            some: {
                                userId,
                            },
                        },
                    },
                },
            ],
        };
        // Apply additional filters
        if (filters?.status) {
            whereCondition.status = Array.isArray(filters.status)
                ? { in: filters.status }
                : filters.status;
        }
        if (filters?.isActive !== undefined) {
            whereCondition.isActive = filters.isActive;
        }
        if (filters?.search) {
            whereCondition.AND = [
                {
                    OR: [
                        { name: { contains: filters.search, mode: "insensitive" } },
                        { description: { contains: filters.search, mode: "insensitive" } },
                    ],
                },
            ];
        }
        const page = filters?.page || 1;
        const limit = filters?.limit || 10;
        const skip = (page - 1) * limit;
        const [projects, total] = await Promise.all([
            prisma_1.prisma.project.findMany({
                where: whereCondition,
                include: {
                    owner: {
                        select: {
                            id: true,
                            email: true,
                            firstName: true,
                            lastName: true,
                            avatar: true,
                        },
                    },
                    team: {
                        select: {
                            id: true,
                            name: true,
                            _count: {
                                select: {
                                    members: true,
                                },
                            },
                        },
                    },
                    tasks: {
                        select: {
                            status: true,
                        },
                        where: {
                            isArchived: false,
                        },
                    },
                },
                skip,
                take: limit,
                orderBy: { createdAt: "desc" },
            }),
            prisma_1.prisma.project.count({ where: whereCondition }),
        ]);
        const projectsWithDetails = projects.map((project) => {
            const baseProject = mapPrismaProjectToProject(project);
            const taskStats = {
                total: project.tasks.length,
                completed: project.tasks.filter((task) => task.status === "completed")
                    .length,
                inProgress: project.tasks.filter((task) => task.status === "in_progress").length,
                todo: project.tasks.filter((task) => task.status === "todo").length,
            };
            return {
                ...baseProject,
                owner: project.owner,
                team: project.team
                    ? {
                        id: project.team.id,
                        name: project.team.name,
                        memberCount: project.team._count.members,
                    }
                    : undefined,
                taskStats,
            };
        });
        return {
            projects: projectsWithDetails,
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
        };
    }
    catch (error) {
        console.error("Error getting user projects:", error);
        throw new Error("Failed to get user projects");
    }
};
exports.getUserProjects = getUserProjects;
// Alias for backward compatibility
exports.getAllProjects = exports.getProjects;
