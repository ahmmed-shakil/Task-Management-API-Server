export type UserRole = "admin" | "user";
export interface User {
    id: string;
    email: string;
    password?: string;
    firstName: string;
    lastName: string;
    avatar: string | null;
    role: UserRole;
    isActive: boolean;
    emailVerified: boolean;
    lastLogin?: Date;
    createdAt: Date;
    updatedAt: Date;
}
export interface CreateUserData {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    role?: UserRole;
}
export interface UpdateUserData {
    firstName?: string;
    lastName?: string;
    avatar?: string | null;
    role?: UserRole;
    isActive?: boolean;
}
export interface LoginCredentials {
    email: string;
    password: string;
}
export interface AuthTokens {
    accessToken: string;
    refreshToken: string;
}
export type ProjectStatus = "planning" | "active" | "completed" | "on_hold";
export type ProjectPriority = "low" | "medium" | "high" | "urgent";
export interface Project {
    id: string;
    name: string;
    description: string | null;
    status: ProjectStatus;
    priority: ProjectPriority;
    start_date: Date | null;
    end_date: Date | null;
    owner_id: string;
    team_id: string | null;
    budget: number | null;
    progress: number;
    is_active: boolean;
    created_at: Date;
    updated_at: Date;
}
export interface CreateProjectData {
    name: string;
    description?: string;
    status?: ProjectStatus;
    priority?: ProjectPriority;
    startDate?: Date;
    endDate?: Date;
    ownerId: string;
    teamId?: string;
    budget?: number;
}
export type TaskStatus = "todo" | "in_progress" | "in_review" | "completed";
export type TaskPriority = "low" | "medium" | "high" | "urgent";
export interface Task {
    id: string;
    title: string;
    description: string | null;
    status: TaskStatus;
    priority: TaskPriority;
    assignee_id: string | null;
    reporter_id: string;
    project_id: string;
    parent_task_id: string | null;
    due_date: Date | null;
    estimated_hours: number | null;
    actual_hours: number | null;
    tags: string[];
    position: number;
    is_archived: boolean;
    created_at: Date;
    updated_at: Date;
}
export interface CreateTaskData {
    title: string;
    description?: string;
    status?: TaskStatus;
    priority?: TaskPriority;
    assigneeId?: string;
    reporterId: string;
    projectId: string;
    parentTaskId?: string;
    dueDate?: Date;
    estimatedHours?: number;
    tags?: string[];
}
export interface Team {
    id: string;
    name: string;
    description: string | null;
    leaderId: string;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
}
export interface TeamMember {
    id: string;
    teamId: string;
    userId: string;
    role: string;
    team?: Team;
    user?: User;
}
export interface CreateTeamData {
    name: string;
    description?: string | null | undefined;
    leaderId: string;
}
export interface UpdateTeamData {
    name?: string;
    description?: string;
    leaderId?: string;
    isActive?: boolean;
}
export interface TeamWithDetails extends Team {
    leader: {
        id: string;
        email: string;
        firstName: string;
        lastName: string;
        avatar: string | null;
    };
    members: Array<{
        id: string;
        userId: string;
        role: string;
        user: {
            id: string;
            email: string;
            firstName: string;
            lastName: string;
            avatar: string | null;
        };
    }>;
}
export interface Notification {
    id: string;
    user_id: string;
    type: string;
    title: string;
    message: string;
    data: any;
    is_read: boolean;
    created_at: Date;
}
export interface CreateNotificationData {
    userId: string;
    type: string;
    title: string;
    message: string;
    data?: any;
}
export interface UpdateNotificationData {
    is_read?: boolean;
}
export interface NotificationFilters {
    page?: number;
    limit?: number;
    isRead?: boolean | undefined;
    type?: string | undefined;
}
export interface FileAttachment {
    id: string;
    taskId: string;
    userId: string;
    fileName: string;
    originalName: string;
    filePath: string;
    fileSize: number;
    mimeType: string;
    createdAt: Date;
}
export interface CreateFileAttachmentData {
    taskId: string;
    userId: string;
    fileName: string;
    originalName: string;
    filePath: string;
    fileSize: number;
    mimeType: string;
}
export interface RequestUser {
    id: string;
    email: string;
    role: UserRole;
    firstName?: string;
    lastName?: string;
    avatar?: string | null;
    isActive?: boolean;
    emailVerified?: boolean;
    createdAt?: Date;
    updatedAt?: Date;
}
export interface ProjectWithDetails extends Project {
    owner: {
        id: string;
        email: string;
        firstName: string;
        lastName: string;
        avatar: string | null;
    };
    team?: {
        id: string;
        name: string;
        memberCount: number;
    } | null;
    taskStats: {
        total: number;
        completed: number;
        inProgress: number;
        todo: number;
    };
}
export interface PaginatedProjects {
    projects: ProjectWithDetails[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}
export interface TaskWithDetails extends Task {
    project: {
        id: string;
        name: string;
        status: string;
    };
    assignee?: {
        id: string;
        email: string;
        firstName: string;
        lastName: string;
        avatar: string | null;
    } | null;
    reporter: {
        id: string;
        email: string;
        firstName: string;
        lastName: string;
        avatar: string | null;
    };
    parentTask?: {
        id: string;
        title: string;
        status: TaskStatus;
    } | null;
    subtasks?: Array<{
        id: string;
        title: string;
        status: TaskStatus;
        priority: TaskPriority;
        assigneeId: string | null;
    }>;
    attachmentCount?: number;
    commentCount?: number;
}
export interface PaginatedTasks {
    tasks: TaskWithDetails[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}
export interface ApiResponse<T = any> {
    success: boolean;
    message: string;
    data: T | null;
}
declare global {
    namespace Express {
        interface Request {
            user?: RequestUser;
        }
    }
}
