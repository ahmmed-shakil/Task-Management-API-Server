import * as userMethods from "../methods/users.prisma";
import { AppError } from "../middleware/errorHandler";
import { User, UserRole, ApiResponse } from "../types/index";

interface UpdateUserProfileData {
  firstName?: string;
  lastName?: string;
  avatar?: string;
}

interface UpdateUserData extends UpdateUserProfileData {
  role?: UserRole;
  isActive?: boolean;
}

interface GetAllUsersQuery {
  page?: string | number;
  limit?: string | number;
  search?: string;
}

class UserService {
  async getUserProfile(userId: string): Promise<ApiResponse<any>> {
    try {
      const user = await userMethods.getUserWithDetails(userId);
      if (!user) {
        throw new AppError("User not found", 404);
      }

      return {
        success: true,
        message: "User profile retrieved successfully",
        data: user,
      };
    } catch (error) {
      throw error;
    }
  }

  async updateUserProfile(
    userId: string,
    updateData: UpdateUserProfileData
  ): Promise<ApiResponse<User>> {
    try {
      const { firstName, lastName, avatar } = updateData;

      // Validate data
      const allowedFields: any = {};

      if (firstName !== undefined) allowedFields.firstName = firstName;
      if (lastName !== undefined) allowedFields.lastName = lastName;
      if (avatar !== undefined) allowedFields.avatar = avatar;

      if (Object.keys(allowedFields).length === 0) {
        throw new AppError("No valid fields to update", 400);
      }

      const updatedUser = await userMethods.updateUser(userId, allowedFields);
      if (!updatedUser) {
        throw new AppError("User not found", 404);
      }

      return {
        success: true,
        message: "Profile updated successfully",
        data: updatedUser,
      };
    } catch (error) {
      throw error;
    }
  }

  async getAllUsers(query: GetAllUsersQuery): Promise<ApiResponse<any>> {
    try {
      const { page = 1, limit = 10, search = "" } = query;

      // Validate pagination
      const pageNum = Math.max(1, parseInt(page.toString()));
      const limitNum = Math.max(1, Math.min(50, parseInt(limit.toString()))); // Max 50 per page

      const result = await userMethods.getAllUsers(pageNum, limitNum, search);

      return {
        success: true,
        message: "Users retrieved successfully",
        data: result,
      };
    } catch (error) {
      throw error;
    }
  }

  async getUserById(userId: string): Promise<ApiResponse<User>> {
    try {
      const user = await userMethods.getUserById(userId);
      if (!user) {
        throw new AppError("User not found", 404);
      }

      return {
        success: true,
        message: "User retrieved successfully",
        data: user,
      };
    } catch (error) {
      throw error;
    }
  }

  async updateUser(
    userId: string,
    updateData: UpdateUserData,
    requesterId: string,
    requesterRole: UserRole
  ): Promise<ApiResponse<User>> {
    try {
      // Check permissions - only admin can update other users
      if (userId !== requesterId && requesterRole !== "admin") {
        throw new AppError("Insufficient permissions to update this user", 403);
      }

      const { firstName, lastName, avatar, role, isActive } = updateData;

      const allowedFields: any = {};
      if (firstName !== undefined) allowedFields.firstName = firstName;
      if (lastName !== undefined) allowedFields.lastName = lastName;
      if (avatar !== undefined) allowedFields.avatar = avatar;

      // Only admin can update role and isActive
      if (requesterRole === "admin") {
        if (role !== undefined) allowedFields.role = role;
        if (isActive !== undefined) allowedFields.isActive = isActive;
      }

      if (Object.keys(allowedFields).length === 0) {
        throw new AppError("No valid fields to update", 400);
      }

      const updatedUser = await userMethods.updateUser(userId, allowedFields);
      if (!updatedUser) {
        throw new AppError("User not found", 404);
      }

      return {
        success: true,
        message: "User updated successfully",
        data: updatedUser,
      };
    } catch (error) {
      throw error;
    }
  }

  async deactivateUser(
    userId: string,
    requesterId: string,
    requesterRole: UserRole
  ): Promise<ApiResponse<{ id: string }>> {
    try {
      // Check permissions - only admin can deactivate users
      if (requesterRole !== "admin") {
        throw new AppError("Only administrators can deactivate users", 403);
      }

      // Prevent admin from deactivating themselves
      if (userId === requesterId) {
        throw new AppError("You cannot deactivate your own account", 400);
      }

      const deletedUser = await userMethods.deleteUser(userId);
      if (!deletedUser) {
        throw new AppError("User not found", 404);
      }

      return {
        success: true,
        message: "User deactivated successfully",
        data: { id: userId },
      };
    } catch (error) {
      throw error;
    }
  }

  async checkEmailAvailability(
    email: string,
    _excludeUserId?: string
  ): Promise<ApiResponse<{ email: string; available: boolean }>> {
    try {
      const exists = await userMethods.userExists(email);

      return {
        success: true,
        message: "Email availability checked",
        data: {
          email,
          available: !exists,
        },
      };
    } catch (error) {
      throw error;
    }
  }

  async getUserStats(userId: string): Promise<ApiResponse<any>> {
    try {
      // This would typically involve aggregating data from multiple tables
      // For now, we'll return basic user info with some computed stats
      const user = await userMethods.getUserWithDetails(userId);
      if (!user) {
        throw new AppError("User not found", 404);
      }

      const stats = {
        totalProjects: user.projects ? user.projects.length : 0,
        totalTeams: user.teams ? user.teams.length : 0,
        projectsAsOwner: user.projects
          ? user.projects.filter((p: any) => p.role === "owner").length
          : 0,
        teamsAsLeader: user.teams
          ? user.teams.filter((t: any) => t.role === "leader").length
          : 0,
      };

      return {
        success: true,
        message: "User statistics retrieved successfully",
        data: {
          user: {
            id: user.id,
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            role: user.role,
          },
          stats,
        },
      };
    } catch (error) {
      throw error;
    }
  }
}

export default new UserService();
