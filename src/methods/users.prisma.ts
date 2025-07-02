import bcrypt from "bcryptjs";
import { prisma } from "../config/prisma";
import { User, CreateUserData, UpdateUserData, UserRole } from "../types/index";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";

interface UserWithDetails extends User {
  teams: Array<{
    id: string;
    name: string;
    role: string;
  }>;
  projects: Array<{
    id: string;
    name: string;
    role: string;
  }>;
}

interface PaginatedUsers {
  users: User[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// Helper function to map Prisma user to User interface
const mapPrismaUserToUser = (prismaUser: any): User => {
  return {
    id: prismaUser.id,
    email: prismaUser.email,
    password: prismaUser.password,
    firstName: prismaUser.firstName,
    lastName: prismaUser.lastName,
    avatar: prismaUser.avatar,
    role: prismaUser.role as UserRole,
    isActive: prismaUser.isActive,
    emailVerified: prismaUser.emailVerified,
    lastLogin: prismaUser.lastLogin,
    createdAt: prismaUser.createdAt,
    updatedAt: prismaUser.updatedAt,
  };
};

// Get user by ID
export const getUserById = async (id: string): Promise<User | null> => {
  try {
    const user = await prisma.user.findUnique({
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
  } catch (error) {
    console.error("Error getting user by ID:", error);
    throw new Error("Failed to get user");
  }
};

// Get user by email (includes password for authentication)
export const getUserByEmail = async (email: string): Promise<User | null> => {
  try {
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return null;
    }

    return mapPrismaUserToUser(user);
  } catch (error) {
    console.error("Error getting user by email:", error);
    throw new Error("Failed to get user");
  }
};

// Create new user
export const createUser = async (userData: CreateUserData): Promise<User> => {
  const { email, password, firstName, lastName, role = "user" } = userData;

  try {
    const hashedPassword = await bcrypt.hash(password, 12);

    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        firstName,
        lastName,
        role: role as UserRole,
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
  } catch (error) {
    if (error instanceof PrismaClientKnownRequestError) {
      if (error.code === "P2002") {
        throw new Error("User with this email already exists");
      }
    }
    console.error("Error creating user:", error);
    throw new Error("Failed to create user");
  }
};

// Update user
export const updateUser = async (
  id: string,
  updateData: UpdateUserData
): Promise<User | null> => {
  try {
    const user = await prisma.user.update({
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
  } catch (error) {
    if (error instanceof PrismaClientKnownRequestError) {
      if (error.code === "P2025") {
        return null; // User not found
      }
    }
    console.error("Error updating user:", error);
    throw new Error("Failed to update user");
  }
};

// Delete user
export const deleteUser = async (id: string): Promise<boolean> => {
  try {
    await prisma.user.delete({
      where: { id },
    });
    return true;
  } catch (error) {
    if (error instanceof PrismaClientKnownRequestError) {
      if (error.code === "P2025") {
        return false; // User not found
      }
    }
    console.error("Error deleting user:", error);
    throw new Error("Failed to delete user");
  }
};

// Get all users with pagination
export const getAllUsers = async (
  page: number = 1,
  limit: number = 10,
  search?: string,
  role?: UserRole,
  isActive?: boolean
): Promise<PaginatedUsers> => {
  try {
    const skip = (page - 1) * limit;

    const where: any = {};

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
      prisma.user.findMany({
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
      prisma.user.count({ where }),
    ]);

    const mappedUsers = users.map(mapPrismaUserToUser);

    return {
      users: mappedUsers,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  } catch (error) {
    console.error("Error getting all users:", error);
    throw new Error("Failed to get users");
  }
};

// Get user with details (teams and projects)
export const getUserWithDetails = async (
  id: string
): Promise<UserWithDetails | null> => {
  try {
    const user = await prisma.user.findUnique({
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
      teams: user.teamMemberships.map((membership: any) => ({
        id: membership.team.id,
        name: membership.team.name,
        role: membership.role,
      })),
      projects: user.ownedProjects.map((project: any) => ({
        id: project.id,
        name: project.name,
        role: "owner",
      })),
    };
  } catch (error) {
    console.error("Error getting user with details:", error);
    throw new Error("Failed to get user details");
  }
};

// Update user password
export const updateUserPassword = async (
  id: string,
  newPassword: string
): Promise<boolean> => {
  try {
    const hashedPassword = await bcrypt.hash(newPassword, 12);

    await prisma.user.update({
      where: { id },
      data: { password: hashedPassword },
    });

    return true;
  } catch (error) {
    if (error instanceof PrismaClientKnownRequestError) {
      if (error.code === "P2025") {
        return false; // User not found
      }
    }
    console.error("Error updating user password:", error);
    throw new Error("Failed to update password");
  }
};

// Update user last login
export const updateUserLastLogin = async (id: string): Promise<boolean> => {
  try {
    await prisma.user.update({
      where: { id },
      data: { lastLogin: new Date() },
    });

    return true;
  } catch (error) {
    console.error("Error updating user last login:", error);
    return false;
  }
};

// Check if user exists
export const userExists = async (email: string): Promise<boolean> => {
  try {
    const count = await prisma.user.count({
      where: { email },
    });

    return count > 0;
  } catch (error) {
    console.error("Error checking if user exists:", error);
    throw new Error("Failed to check user existence");
  }
};

// Verify user password
export const verifyUserPassword = async (
  email: string,
  password: string
): Promise<User | null> => {
  try {
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return null;
    }

    const isValidPassword = await bcrypt.compare(password, user.password);

    if (!isValidPassword) {
      return null;
    }

    // Return user without password
    const { password: _, ...userWithoutPassword } = user;
    return mapPrismaUserToUser(userWithoutPassword);
  } catch (error) {
    console.error("Error verifying user password:", error);
    throw new Error("Failed to verify password");
  }
};
