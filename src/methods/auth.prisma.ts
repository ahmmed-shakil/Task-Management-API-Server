import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { prisma } from "../config/prisma";
import {
  getUserByEmail,
  getUserById,
  createUser,
  updateUserLastLogin,
} from "./users.prisma";
import { CreateUserData, User, AuthTokens } from "../types/index";

interface RegisterResult {
  user: User;
  tokens: AuthTokens;
}

interface LoginResult {
  user: User;
  tokens: AuthTokens;
}

// Generate JWT tokens
export const generateTokens = (userId: string): AuthTokens => {
  const payload = { userId };
  const jwtSecret = process.env.JWT_SECRET;
  const jwtRefreshSecret = process.env.JWT_REFRESH_SECRET;

  if (!jwtSecret || !jwtRefreshSecret) {
    throw new Error("JWT secrets not configured");
  }

  const accessToken = (jwt as any).sign(payload, jwtSecret, {
    expiresIn: process.env.JWT_EXPIRE || "7d",
  });

  const refreshToken = (jwt as any).sign(payload, jwtRefreshSecret, {
    expiresIn: process.env.JWT_REFRESH_EXPIRE || "30d",
  });

  return { accessToken, refreshToken };
};

// Save refresh token to database
export const saveRefreshToken = async (
  userId: string,
  refreshToken: string
): Promise<void> => {
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 30); // 30 days from now

  try {
    // First, clean up expired tokens for this user
    await prisma.refreshToken.deleteMany({
      where: {
        userId,
        expiresAt: {
          lt: new Date(),
        },
      },
    });

    // Use upsert to insert or update the refresh token
    await prisma.refreshToken.upsert({
      where: { userId },
      update: {
        token: refreshToken,
        expiresAt,
      },
      create: {
        userId,
        token: refreshToken,
        expiresAt,
      },
    });
  } catch (error) {
    console.error("Error saving refresh token:", error);
    throw new Error("Failed to save refresh token");
  }
};

// Validate refresh token
export const validateRefreshToken = async (
  refreshToken: string
): Promise<string | null> => {
  try {
    const tokenRecord = await prisma.refreshToken.findUnique({
      where: {
        token: refreshToken,
      },
      include: {
        user: {
          select: {
            id: true,
            isActive: true,
          },
        },
      },
    });

    if (
      !tokenRecord ||
      tokenRecord.expiresAt < new Date() ||
      !tokenRecord.user.isActive
    ) {
      return null;
    }

    return tokenRecord.userId;
  } catch (error) {
    console.error("Error validating refresh token:", error);
    return null;
  }
};

// Remove refresh token (logout)
export const removeRefreshToken = async (
  refreshToken: string
): Promise<void> => {
  try {
    await prisma.refreshToken.delete({
      where: {
        token: refreshToken,
      },
    });
  } catch (error) {
    console.error("Error removing refresh token:", error);
    throw new Error("Failed to remove refresh token");
  }
};

// Remove all refresh tokens for user (logout all devices)
export const removeAllRefreshTokensForUser = async (
  userId: string
): Promise<void> => {
  try {
    await prisma.refreshToken.delete({
      where: {
        userId: userId,
      },
    });
  } catch (error) {
    console.error("Error removing all refresh tokens for user:", error);
    throw new Error("Failed to remove refresh tokens");
  }
};

// Verify JWT token
export const verifyToken = (token: string, secret: string): any => {
  try {
    return (jwt as any).verify(token, secret);
  } catch (error) {
    return null;
  }
};

// Register new user
export const register = async (
  userData: CreateUserData
): Promise<RegisterResult> => {
  try {
    // Check if user already exists
    const existingUser = await getUserByEmail(userData.email);
    if (existingUser) {
      throw new Error("User with this email already exists");
    }

    // Create new user
    const user = await createUser(userData);

    // Generate tokens
    const tokens = generateTokens(user.id);

    // Save refresh token
    await saveRefreshToken(user.id, tokens.refreshToken);

    // Return user without password
    const { password, ...userWithoutPassword } = user;

    return {
      user: userWithoutPassword as User,
      tokens,
    };
  } catch (error) {
    console.error("Error during registration:", error);
    throw error;
  }
};

// Login user
export const login = async (credentials: {
  email: string;
  password: string;
}): Promise<LoginResult> => {
  try {
    const { email, password } = credentials;

    // Get user with password
    const user = await getUserByEmail(email);
    if (!user || !user.password) {
      throw new Error("Invalid credentials");
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      throw new Error("Invalid credentials");
    }

    // Check if user is active
    if (!user.isActive) {
      throw new Error("Account is deactivated");
    }

    // Update last login
    await updateUserLastLogin(user.id);

    // Generate tokens
    const tokens = generateTokens(user.id);

    // Save refresh token
    await saveRefreshToken(user.id, tokens.refreshToken);

    // Return user without password
    const { password: _, ...userWithoutPassword } = user;

    return {
      user: userWithoutPassword as User,
      tokens,
    };
  } catch (error) {
    console.error("Error during login:", error);
    throw error;
  }
};

// Refresh access token
export const refreshAccessToken = async (
  refreshToken: string
): Promise<AuthTokens> => {
  try {
    // Validate refresh token
    const userId = await validateRefreshToken(refreshToken);
    if (!userId) {
      throw new Error("Invalid or expired refresh token");
    }

    // Get user to make sure they still exist and are active
    const user = await getUserById(userId);
    if (!user || !user.isActive) {
      throw new Error("User not found or inactive");
    }

    // Generate new tokens
    const tokens = generateTokens(userId);

    // Save new refresh token
    await saveRefreshToken(userId, tokens.refreshToken);

    // Remove old refresh token
    await removeRefreshToken(refreshToken);

    return tokens;
  } catch (error) {
    console.error("Error refreshing token:", error);
    throw error;
  }
};

// Logout user
export const logout = async (refreshToken: string): Promise<void> => {
  try {
    await removeRefreshToken(refreshToken);
  } catch (error) {
    console.error("Error during logout:", error);
    throw error;
  }
};

// Logout from all devices
export const logoutAll = async (userId: string): Promise<void> => {
  try {
    await removeAllRefreshTokensForUser(userId);
  } catch (error) {
    console.error("Error during logout all:", error);
    throw error;
  }
};

// Verify user token and get user data
export const verifyUserToken = async (token: string): Promise<User | null> => {
  try {
    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      throw new Error("JWT secret not configured");
    }

    const decoded = verifyToken(token, jwtSecret);
    if (!decoded || !decoded.userId) {
      return null;
    }

    const user = await getUserById(decoded.userId);
    if (!user || !user.isActive) {
      return null;
    }

    return user;
  } catch (error) {
    console.error("Error verifying user token:", error);
    return null;
  }
};

// Change password
export const changePassword = async (
  userId: string,
  currentPassword: string,
  newPassword: string
): Promise<void> => {
  try {
    // Get user with current password
    const user = await getUserById(userId);
    if (!user) {
      throw new Error("User not found");
    }

    // Get user with password for verification
    const userWithPassword = await getUserByEmail(user.email);
    if (!userWithPassword || !userWithPassword.password) {
      throw new Error("User not found");
    }

    // Verify current password
    const isValidPassword = await bcrypt.compare(
      currentPassword,
      userWithPassword.password
    );
    if (!isValidPassword) {
      throw new Error("Current password is incorrect");
    }

    // Hash new password
    const hashedNewPassword = await bcrypt.hash(newPassword, 12);

    // Update password in database
    await prisma.user.update({
      where: { id: userId },
      data: { password: hashedNewPassword },
    });

    // Logout from all devices for security
    await logoutAll(userId);
  } catch (error) {
    console.error("Error changing password:", error);
    throw error;
  }
};

// Reset password (for forgot password functionality)
export const resetPassword = async (
  email: string,
  newPassword: string,
  _resetToken: string
): Promise<void> => {
  try {
    // In a real implementation, you would verify the reset token here
    // For now, we'll just update the password

    const user = await getUserByEmail(email);
    if (!user) {
      throw new Error("User not found");
    }

    // Hash new password
    const hashedNewPassword = await bcrypt.hash(newPassword, 12);

    // Update password in database
    await prisma.user.update({
      where: { id: user.id },
      data: { password: hashedNewPassword },
    });

    // Logout from all devices for security
    await logoutAll(user.id);
  } catch (error) {
    console.error("Error resetting password:", error);
    throw error;
  }
};

// Clean up expired refresh tokens (should be run periodically)
export const cleanupExpiredTokens = async (): Promise<void> => {
  try {
    await prisma.refreshToken.deleteMany({
      where: {
        expiresAt: {
          lt: new Date(),
        },
      },
    });
  } catch (error) {
    console.error("Error cleaning up expired tokens:", error);
  }
};
