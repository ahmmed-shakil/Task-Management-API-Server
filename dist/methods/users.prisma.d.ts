import { User, CreateUserData, UpdateUserData, UserRole } from "../types/index";
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
export declare const getUserById: (id: string) => Promise<User | null>;
export declare const getUserByEmail: (email: string) => Promise<User | null>;
export declare const createUser: (userData: CreateUserData) => Promise<User>;
export declare const updateUser: (id: string, updateData: UpdateUserData) => Promise<User | null>;
export declare const deleteUser: (id: string) => Promise<boolean>;
export declare const getAllUsers: (page?: number, limit?: number, search?: string, role?: UserRole, isActive?: boolean) => Promise<PaginatedUsers>;
export declare const getUserWithDetails: (id: string) => Promise<UserWithDetails | null>;
export declare const updateUserPassword: (id: string, newPassword: string) => Promise<boolean>;
export declare const updateUserLastLogin: (id: string) => Promise<boolean>;
export declare const userExists: (email: string) => Promise<boolean>;
export declare const verifyUserPassword: (email: string, password: string) => Promise<User | null>;
export {};
