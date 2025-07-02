import { Task, CreateTaskData, TaskStatus, TaskPriority, TaskWithDetails, PaginatedTasks } from "../types/index";
interface TaskFilters {
    page?: number;
    limit?: number;
    search?: string;
    status?: TaskStatus | TaskStatus[];
    priority?: TaskPriority | TaskPriority[];
    assigneeId?: string;
    projectId?: string;
    reporterId?: string;
    dueDate?: string;
    overdue?: boolean;
}
export declare const getTaskById: (id: string) => Promise<Task | null>;
export declare const getTaskWithDetails: (id: string) => Promise<TaskWithDetails | null>;
export declare const createTask: (taskData: CreateTaskData) => Promise<Task>;
export declare const updateTask: (id: string, updateData: Partial<CreateTaskData>) => Promise<Task | null>;
export declare const deleteTask: (id: string) => Promise<boolean>;
export declare const getTasks: (filters: TaskFilters) => Promise<PaginatedTasks>;
export declare const getTasksByProject: (projectId: string, filters?: Omit<TaskFilters, "projectId">) => Promise<PaginatedTasks>;
export declare const getTasksByAssignee: (assigneeId: string, filters?: Omit<TaskFilters, "assigneeId">) => Promise<PaginatedTasks>;
export declare const archiveTask: (id: string) => Promise<boolean>;
export declare const restoreTask: (id: string) => Promise<boolean>;
export declare const updateTaskPosition: (id: string, newPosition: number) => Promise<boolean>;
export declare const updateTaskStatus: (id: string, status: TaskStatus) => Promise<Task | null>;
export declare const logTaskHours: (id: string, actualHours: number) => Promise<Task | null>;
export declare const addTaskComment: (taskId: string, userId: string, content: string) => Promise<{
    id: string;
    task_id: string;
    user_id: string;
    content: string;
    is_edited: boolean;
    created_at: Date;
    updated_at: Date;
    user: {
        email: string;
        id: string;
        firstName: string;
        lastName: string;
        avatar: string | null;
    };
}>;
export declare const getTaskComments: (taskId: string, page?: number, limit?: number) => Promise<{
    comments: {
        id: string;
        task_id: string;
        user_id: string;
        content: string;
        is_edited: boolean;
        created_at: Date;
        updated_at: Date;
        user: {
            email: string;
            id: string;
            firstName: string;
            lastName: string;
            avatar: string | null;
        };
    }[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}>;
export declare const updateTaskComment: (commentId: string, userId: string, content: string) => Promise<{
    id: string;
    task_id: string;
    user_id: string;
    content: string;
    is_edited: boolean;
    created_at: Date;
    updated_at: Date;
    user: {
        email: string;
        id: string;
        firstName: string;
        lastName: string;
        avatar: string | null;
    };
}>;
export declare const deleteTaskComment: (commentId: string) => Promise<boolean>;
export declare const addTaskAttachment: (taskId: string, userId: string, fileName: string, originalName: string, filePath: string, fileSize: number, mimeType: string) => Promise<{
    id: string;
    task_id: string;
    user_id: string;
    file_name: string;
    original_name: string;
    file_path: string;
    file_size: number;
    mime_type: string;
    created_at: Date;
    user: {
        email: string;
        id: string;
        firstName: string;
        lastName: string;
        avatar: string | null;
    };
}>;
export declare const getTaskAttachments: (taskId: string) => Promise<{
    id: string;
    task_id: string;
    user_id: string;
    file_name: string;
    original_name: string;
    file_path: string;
    file_size: number;
    mime_type: string;
    created_at: Date;
    user: {
        email: string;
        id: string;
        firstName: string;
        lastName: string;
        avatar: string | null;
    };
}[]>;
export declare const deleteTaskAttachment: (attachmentId: string) => Promise<boolean>;
export declare const getUserTasks: (userId: string, filters?: TaskFilters) => Promise<PaginatedTasks>;
export declare const getAllTasks: (filters: TaskFilters) => Promise<PaginatedTasks>;
export {};
