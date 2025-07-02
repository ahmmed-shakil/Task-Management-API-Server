"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyUserPassword = exports.userExists = exports.updateUserLastLogin = exports.updateUserPassword = exports.getUserWithDetails = exports.getAllUsers = exports.deleteUser = exports.updateUser = exports.createUser = exports.getUserByEmail = exports.getUserById = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const prisma_1 = require("../config/prisma");
const prisma_2 = require("../generated/prisma");
// Helper function to map Prisma user to User interface
const mapPrismaUserToUser = (prismaUser) => {
    return {
        id: prismaUser.id,
        email: prismaUser.email,
        password: prismaUser.password,
        firstName: prismaUser.firstName,
        lastName: prismaUser.lastName,
        avatar: prismaUser.avatar,
        role: prismaUser.role,
        isActive: prismaUser.isActive,
        emailVerified: prismaUser.emailVerified,
        lastLogin: prismaUser.lastLogin,
        createdAt: prismaUser.createdAt,
        updatedAt: prismaUser.updatedAt,
    };
};
// Get user by ID
const getUserById = async (id) => {
    try {
        const user = await prisma_1.prisma.user.findUnique({
            where: { id },
            select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
                avatar: true,
                role: true,
                isActive: true,
                emailVerified: true,
                lastLogin: true,
                createdAt: true,
                updatedAt: true,
            },
        });
        if (!user) {
            return null;
        }
        return mapPrismaUserToUser(user);
    }
    catch (error) {
        console.error("Error getting user by ID:", error);
        throw new Error("Failed to get user");
    }
};
exports.getUserById = getUserById;
// Get user by email (includes password for authentication)
const getUserByEmail = async (email) => {
    try {
        const user = await prisma_1.prisma.user.findUnique({
            where: { email },
        });
        if (!user) {
            return null;
        }
        return mapPrismaUserToUser(user);
    }
    catch (error) {
        console.error("Error getting user by email:", error);
        throw new Error("Failed to get user");
    }
};
exports.getUserByEmail = getUserByEmail;
// Create new user
const createUser = async (userData) => {
    const { email, password, firstName, lastName, role = "user" } = userData;
    try {
        const hashedPassword = await bcryptjs_1.default.hash(password, 12);
        const user = await prisma_1.prisma.user.create({
            data: {
                email,
                password: hashedPassword,
                firstName,
                lastName,
                role: role,
            },
            select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
                avatar: true,
                role: true,
                isActive: true,
                emailVerified: true,
                lastLogin: true,
                createdAt: true,
                updatedAt: true,
            },
        });
        return mapPrismaUserToUser(user);
    }
    catch (error) {
        if (error instanceof prisma_2.Prisma.PrismaClientKnownRequestError) {
            if (error.code === "P2002") {
                throw new Error("User with this email already exists");
            }
        }
        console.error("Error creating user:", error);
        throw new Error("Failed to create user");
    }
};
exports.createUser = createUser;
// Update user
const updateUser = async (id, updateData) => {
    try {
        const user = await prisma_1.prisma.user.update({
            where: { id },
            data: updateData,
            select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
                avatar: true,
                role: true,
                isActive: true,
                emailVerified: true,
                lastLogin: true,
                createdAt: true,
                updatedAt: true,
            },
        });
        return mapPrismaUserToUser(user);
    }
    catch (error) {
        if (error instanceof prisma_2.Prisma.PrismaClientKnownRequestError) {
            if (error.code === "P2025") {
                return null; // User not found
            }
        }
        console.error("Error updating user:", error);
        throw new Error("Failed to update user");
    }
};
exports.updateUser = updateUser;
// Delete user
const deleteUser = async (id) => {
    try {
        await prisma_1.prisma.user.delete({
            where: { id },
        });
        return true;
    }
    catch (error) {
        if (error instanceof prisma_2.Prisma.PrismaClientKnownRequestError) {
            if (error.code === "P2025") {
                return false; // User not found
            }
        }
        console.error("Error deleting user:", error);
        throw new Error("Failed to delete user");
    }
};
exports.deleteUser = deleteUser;
// Get all users with pagination
const getAllUsers = async (page = 1, limit = 10, search, role, isActive) => {
    try {
        const skip = (page - 1) * limit;
        const where = {};
        if (search) {
            where.OR = [
                { firstName: { contains: search, mode: "insensitive" } },
                { lastName: { contains: search, mode: "insensitive" } },
                { email: { contains: search, mode: "insensitive" } },
            ];
        }
        if (role) {
            where.role = role;
        }
        if (isActive !== undefined) {
            where.isActive = isActive;
        }
        const [users, total] = await Promise.all([
            prisma_1.prisma.user.findMany({
                where,
                select: {
                    id: true,
                    email: true,
                    firstName: true,
                    lastName: true,
                    avatar: true,
                    role: true,
                    isActive: true,
                    emailVerified: true,
                    lastLogin: true,
                    createdAt: true,
                    updatedAt: true,
                },
                skip,
                take: limit,
                orderBy: { createdAt: "desc" },
            }),
            prisma_1.prisma.user.count({ where }),
        ]);
        const mappedUsers = users.map(mapPrismaUserToUser);
        return {
            users: mappedUsers,
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
        };
    }
    catch (error) {
        console.error("Error getting all users:", error);
        throw new Error("Failed to get users");
    }
};
exports.getAllUsers = getAllUsers;
// Get user with details (teams and projects)
const getUserWithDetails = async (id) => {
    try {
        const user = await prisma_1.prisma.user.findUnique({
            where: { id },
            select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
                avatar: true,
                role: true,
                isActive: true,
                emailVerified: true,
                lastLogin: true,
                createdAt: true,
                updatedAt: true,
                teamMemberships: {
                    select: {
                        role: true,
                        team: {
                            select: {
                                id: true,
                                name: true,
                            },
                        },
                    },
                },
                ownedProjects: {
                    select: {
                        id: true,
                        name: true,
                    },
                },
            },
        });
        if (!user) {
            return null;
        }
        const baseUser = mapPrismaUserToUser(user);
        return {
            ...baseUser,
            teams: user.teamMemberships.map((membership) => ({
                id: membership.team.id,
                name: membership.team.name,
                role: membership.role,
            })),
            projects: user.ownedProjects.map((project) => ({
                id: project.id,
                name: project.name,
                role: "owner",
            })),
        };
    }
    catch (error) {
        console.error("Error getting user with details:", error);
        throw new Error("Failed to get user details");
    }
};
exports.getUserWithDetails = getUserWithDetails;
// Update user password
const updateUserPassword = async (id, newPassword) => {
    try {
        const hashedPassword = await bcryptjs_1.default.hash(newPassword, 12);
        await prisma_1.prisma.user.update({
            where: { id },
            data: { password: hashedPassword },
        });
        return true;
    }
    catch (error) {
        if (error instanceof prisma_2.Prisma.PrismaClientKnownRequestError) {
            if (error.code === "P2025") {
                return false; // User not found
            }
        }
        console.error("Error updating user password:", error);
        throw new Error("Failed to update password");
    }
};
exports.updateUserPassword = updateUserPassword;
// Update user last login
const updateUserLastLogin = async (id) => {
    try {
        await prisma_1.prisma.user.update({
            where: { id },
            data: { lastLogin: new Date() },
        });
        return true;
    }
    catch (error) {
        console.error("Error updating user last login:", error);
        return false;
    }
};
exports.updateUserLastLogin = updateUserLastLogin;
// Check if user exists
const userExists = async (email) => {
    try {
        const count = await prisma_1.prisma.user.count({
            where: { email },
        });
        return count > 0;
    }
    catch (error) {
        console.error("Error checking if user exists:", error);
        throw new Error("Failed to check user existence");
    }
};
exports.userExists = userExists;
// Verify user password
const verifyUserPassword = async (email, password) => {
    try {
        const user = await prisma_1.prisma.user.findUnique({
            where: { email },
        });
        if (!user) {
            return null;
        }
        const isValidPassword = await bcryptjs_1.default.compare(password, user.password);
        if (!isValidPassword) {
            return null;
        }
        // Return user without password
        const { password: _, ...userWithoutPassword } = user;
        return mapPrismaUserToUser(userWithoutPassword);
    }
    catch (error) {
        console.error("Error verifying user password:", error);
        throw new Error("Failed to verify password");
    }
};
exports.verifyUserPassword = verifyUserPassword;
