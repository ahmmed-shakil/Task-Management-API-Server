import { CreateUserData, User, AuthTokens } from "../types/index";
interface RegisterResult {
    user: User;
    tokens: AuthTokens;
}
interface LoginResult {
    user: User;
    tokens: AuthTokens;
}
export declare const generateTokens: (userId: string) => AuthTokens;
export declare const saveRefreshToken: (userId: string, refreshToken: string) => Promise<void>;
export declare const validateRefreshToken: (refreshToken: string) => Promise<string | null>;
export declare const removeRefreshToken: (refreshToken: string) => Promise<void>;
export declare const removeAllRefreshTokensForUser: (userId: string) => Promise<void>;
export declare const verifyToken: (token: string, secret: string) => any;
export declare const register: (userData: CreateUserData) => Promise<RegisterResult>;
export declare const login: (credentials: {
    email: string;
    password: string;
}) => Promise<LoginResult>;
export declare const refreshAccessToken: (refreshToken: string) => Promise<AuthTokens>;
export declare const logout: (refreshToken: string) => Promise<void>;
export declare const logoutAll: (userId: string) => Promise<void>;
export declare const verifyUserToken: (token: string) => Promise<User | null>;
export declare const changePassword: (userId: string, currentPassword: string, newPassword: string) => Promise<void>;
export declare const resetPassword: (email: string, newPassword: string, _resetToken: string) => Promise<void>;
export declare const cleanupExpiredTokens: () => Promise<void>;
export {};
