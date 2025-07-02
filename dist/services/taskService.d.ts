import { Task, CreateTaskData, TaskStatus, TaskPriority, ApiResponse } from "../types/index";
interface TaskFilters {
    page?: string | number;
    limit?: string | number;
    status?: TaskStatus | TaskStatus[];
    priority?: TaskPriority | TaskPriority[];
    projectId?: string;
    assigneeId?: string;
    search?: string;
}
interface CreateAttachmentData {
    taskId: string;
    userId: string;
    fileName: string;
    originalName: string;
    filePath: string;
    fileSize: number;
    mimeType: string;
}
declare class TaskService {
    getAllTasks(filters?: TaskFilters): Promise<ApiResponse<any>>;
    createTask(userId: string, taskData: CreateTaskData): Promise<ApiResponse<Task>>;
    getTaskById(taskId: string, userId: string): Promise<ApiResponse<any>>;
    updateTask(taskId: string, userId: string, updateData: Partial<CreateTaskData>): Promise<ApiResponse<Task>>;
    deleteTask(taskId: string, userId: string): Promise<ApiResponse<null>>;
    getTasksByProject(projectId: string, userId: string, status?: TaskStatus): Promise<ApiResponse<any[]>>;
    getUserTasks(userId: string, filters?: {
        status?: TaskStatus;
        priority?: TaskPriority;
        projectId?: string;
        limit?: number;
    }): Promise<ApiResponse<any[]>>;
    addTaskComment(taskId: string, userId: string, content: string): Promise<ApiResponse<any>>;
    getTaskComments(taskId: string, userId: string, page?: number, limit?: number): Promise<ApiResponse<any[]>>;
    updateTaskComment(commentId: string, userId: string, content: string): Promise<ApiResponse<any>>;
    deleteTaskComment(commentId: string): Promise<ApiResponse<null>>;
    addTaskAttachment(taskId: string, userId: string, attachmentData: Omit<CreateAttachmentData, "taskId" | "userId">): Promise<ApiResponse<any>>;
    getTaskAttachments(taskId: string, userId: string): Promise<ApiResponse<any[]>>;
    deleteTaskAttachment(attachmentId: string): Promise<ApiResponse<{
        filePath: string;
    } | null>>;
}
declare const _default: TaskService;
export default _default;
