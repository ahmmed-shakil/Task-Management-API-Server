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
declare class UserService {
    getUserProfile(userId: string): Promise<ApiResponse<any>>;
    updateUserProfile(userId: string, updateData: UpdateUserProfileData): Promise<ApiResponse<User>>;
    getAllUsers(query: GetAllUsersQuery): Promise<ApiResponse<any>>;
    getUserById(userId: string): Promise<ApiResponse<User>>;
    updateUser(userId: string, updateData: UpdateUserData, requesterId: string, requesterRole: UserRole): Promise<ApiResponse<User>>;
    deactivateUser(userId: string, requesterId: string, requesterRole: UserRole): Promise<ApiResponse<{
        id: string;
    }>>;
    checkEmailAvailability(email: string, _excludeUserId?: string): Promise<ApiResponse<{
        email: string;
        available: boolean;
    }>>;
    getUserStats(userId: string): Promise<ApiResponse<any>>;
}
declare const _default: UserService;
export default _default;
