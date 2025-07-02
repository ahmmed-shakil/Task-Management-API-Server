import * as authMethods from "../methods/auth.prisma";
import * as userMethods from "../methods/users.prisma";
import { AppError } from "../middleware/errorHandler";
import {
  CreateUserData,
  LoginCredentials,
  User,
  AuthTokens,
} from "../types/index";

interface RegisterResult {
  user: User;
  tokens: AuthTokens;
}

interface LoginResult {
  user: User;
  tokens: AuthTokens;
}

class AuthService {
  async register(userData: CreateUserData): Promise<RegisterResult> {
    try {
      const { email, password, firstName, lastName } = userData;

      // Validate required fields
      if (!email || !password || !firstName || !lastName) {
        throw new AppError("All fields are required", 400);
      }

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        throw new AppError("Invalid email format", 400);
      }

      // Validate password strength
      if (password.length < 6) {
        throw new AppError("Password must be at least 6 characters long", 400);
      }

      const result = await authMethods.register(userData);
      return result;
    } catch (error) {
      if (
        error instanceof Error &&
        error.message === "User with this email already exists"
      ) {
        throw new AppError(error.message, 409);
      }
      throw error;
    }
  }

  async login(credentials: LoginCredentials): Promise<LoginResult> {
    try {
      const { email, password } = credentials;

      if (!email || !password) {
        throw new AppError("Email and password are required", 400);
      }

      const result = await authMethods.login({ email, password });
      return result;
    } catch (error) {
      if (error instanceof Error && error.message === "Invalid credentials") {
        throw new AppError(error.message, 401);
      }
      throw error;
    }
  }

  async refreshToken(refreshToken: string): Promise<AuthTokens> {
    try {
      if (!refreshToken) {
        throw new AppError("Refresh token is required", 400);
      }

      const tokens = await authMethods.refreshAccessToken(refreshToken);
      return tokens;
    } catch (error) {
      if (error instanceof Error && error.message === "Invalid refresh token") {
        throw new AppError(error.message, 401);
      }
      throw error;
    }
  }

  async logout(refreshToken: string): Promise<void> {
    try {
      await authMethods.logout(refreshToken);
    } catch (error) {
      throw error;
    }
  }

  async forgotPassword(email: string): Promise<void> {
    try {
      if (!email) {
        throw new AppError("Email is required", 400);
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        throw new AppError("Invalid email format", 400);
      }

      // TODO: Implement forgot password functionality
      // await authMethods.forgotPassword(email);
      throw new AppError(
        "Forgot password functionality not implemented yet",
        501
      );
    } catch (error) {
      if (error instanceof Error && error.message === "User not found") {
        throw new AppError(error.message, 404);
      }
      throw error;
    }
  }

  async resetPassword(token: string, password: string): Promise<void> {
    try {
      if (!token || !password) {
        throw new AppError("Token and password are required", 400);
      }

      if (password.length < 6) {
        throw new AppError("Password must be at least 6 characters long", 400);
      }

      // TODO: Implement proper token verification and email lookup
      // For now, we'll throw an error since this needs proper implementation
      throw new AppError(
        "Reset password functionality not implemented yet",
        501
      );
      // await authMethods.resetPassword(email, password, token);
    } catch (error) {
      if (
        error instanceof Error &&
        (error.message === "Invalid token" || error.message === "Token expired")
      ) {
        throw new AppError(error.message, 400);
      }
      throw error;
    }
  }

  async verifyEmail(token: string): Promise<void> {
    try {
      if (!token) {
        throw new AppError("Verification token is required", 400);
      }

      // TODO: Implement email verification functionality
      throw new AppError(
        "Email verification functionality not implemented yet",
        501
      );
      // await authMethods.verifyEmail(token);
    } catch (error) {
      if (
        error instanceof Error &&
        (error.message === "Invalid token" || error.message === "Token expired")
      ) {
        throw new AppError(error.message, 400);
      }
      throw error;
    }
  }

  async getUserProfile(userId: string): Promise<User> {
    try {
      const user = await userMethods.getUserWithDetails(userId);
      if (!user) {
        throw new AppError("User not found", 404);
      }
      return user;
    } catch (error) {
      throw error;
    }
  }

  async changePassword(
    userId: string,
    currentPassword: string,
    newPassword: string
  ): Promise<void> {
    try {
      if (!currentPassword || !newPassword) {
        throw new AppError(
          "Current password and new password are required",
          400
        );
      }

      if (newPassword.length < 6) {
        throw new AppError(
          "New password must be at least 6 characters long",
          400
        );
      }

      await authMethods.changePassword(userId, currentPassword, newPassword);
    } catch (error) {
      if (
        error instanceof Error &&
        error.message === "Current password is incorrect"
      ) {
        throw new AppError(error.message, 400);
      }
      throw error;
    }
  }

  async updateProfile(
    userId: string,
    updateData: Partial<User>
  ): Promise<User> {
    try {
      const user = await userMethods.updateUser(userId, updateData);
      if (!user) {
        throw new AppError("User not found", 404);
      }
      return user;
    } catch (error) {
      throw error;
    }
  }
}

export default new AuthService();
