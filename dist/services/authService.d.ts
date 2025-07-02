import { CreateUserData, LoginCredentials, User, AuthTokens } from "../types/index";
interface RegisterResult {
    user: User;
    tokens: AuthTokens;
}
interface LoginResult {
    user: User;
    tokens: AuthTokens;
}
declare class AuthService {
    register(userData: CreateUserData): Promise<RegisterResult>;
    login(credentials: LoginCredentials): Promise<LoginResult>;
    refreshToken(refreshToken: string): Promise<AuthTokens>;
    logout(refreshToken: string): Promise<void>;
    forgotPassword(email: string): Promise<void>;
    resetPassword(token: string, password: string): Promise<void>;
    verifyEmail(token: string): Promise<void>;
    getUserProfile(userId: string): Promise<User>;
    changePassword(userId: string, currentPassword: string, newPassword: string): Promise<void>;
    updateProfile(userId: string, updateData: Partial<User>): Promise<User>;
}
declare const _default: AuthService;
export default _default;
