import * as taskMethods from "../methods/tasks.prisma";
import * as projectMethods from "../methods/projects.prisma";
import { AppError } from "../middleware/errorHandler";
import {
  Task,
  CreateTaskData,
  TaskStatus,
  TaskPriority,
  ApiResponse,
} from "../types/index";

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

class TaskService {
  async getAllTasks(filters: TaskFilters = {}): Promise<ApiResponse<any>> {
    try {
      const {
        page = 1,
        limit = 10,
        status,
        priority,
        projectId,
        assigneeId,
        search,
      } = filters;

      const taskFilters: any = {
        page: parseInt(page.toString()),
        limit: parseInt(limit.toString()),
      };

      if (status) taskFilters.status = status;
      if (priority) taskFilters.priority = priority;
      if (projectId) taskFilters.projectId = projectId;
      if (assigneeId) taskFilters.assigneeId = assigneeId;
      if (search) taskFilters.search = search;

      const tasks = await taskMethods.getAllTasks(taskFilters);

      return {
        success: true,
        data: tasks,
        message: "Tasks retrieved successfully",
      };
    } catch (error: any) {
      throw new AppError(error.message, 500);
    }
  }

  async createTask(
    userId: string,
    taskData: CreateTaskData
  ): Promise<ApiResponse<Task>> {
    try {
      // Validate required fields
      if (!taskData.title) {
        throw new AppError("Task title is required", 400);
      }

      if (!taskData.projectId) {
        throw new AppError("Project ID is required", 400);
      }

      // Check if user has access to the project
      const memberRole = await projectMethods.isProjectMember(
        taskData.projectId,
        userId
      );
      if (!memberRole) {
        throw new AppError("Access denied to this project", 403);
      }

      // Add reporter ID to task data
      const dataWithReporter: CreateTaskData = {
        ...taskData,
        reporterId: userId,
      };

      const task = await taskMethods.createTask(dataWithReporter);

      return {
        success: true,
        data: task,
        message: "Task created successfully",
      };
    } catch (error: any) {
      throw new AppError(error.message, error.statusCode || 500);
    }
  }

  async getTaskById(taskId: string, userId: string): Promise<ApiResponse<any>> {
    try {
      const task = await taskMethods.getTaskById(taskId);
      if (!task) {
        throw new AppError("Task not found", 404);
      }

      // Check if user has access to this task's project
      const memberRole = await projectMethods.isProjectMember(
        task.project_id,
        userId
      );
      if (!memberRole) {
        throw new AppError("Access denied to this task", 403);
      }

      return {
        success: true,
        data: task,
        message: "Task retrieved successfully",
      };
    } catch (error: any) {
      throw new AppError(error.message, error.statusCode || 500);
    }
  }

  async updateTask(
    taskId: string,
    userId: string,
    updateData: Partial<CreateTaskData>
  ): Promise<ApiResponse<Task>> {
    try {
      // Get task to check permissions
      const task = await taskMethods.getTaskById(taskId);
      if (!task) {
        throw new AppError("Task not found", 404);
      }

      // Check if user has permission to update this task (project member and either task owner or assignee)
      const memberRole = await projectMethods.isProjectMember(
        task.project_id,
        userId
      );
      if (!memberRole) {
        throw new AppError("Access denied to this task", 403);
      }

      // Allow update if user is the reporter, assignee, or has admin/owner role in project
      const canUpdate =
        task.reporter_id === userId ||
        task.assignee_id === userId ||
        memberRole === "owner" ||
        memberRole === "admin";

      if (!canUpdate) {
        throw new AppError("Permission denied to update this task", 403);
      }

      const updatedTask = await taskMethods.updateTask(taskId, updateData);
      if (!updatedTask) {
        throw new AppError("Failed to update task", 500);
      }

      return {
        success: true,
        data: updatedTask,
        message: "Task updated successfully",
      };
    } catch (error: any) {
      throw new AppError(error.message, error.statusCode || 500);
    }
  }

  async deleteTask(taskId: string, userId: string): Promise<ApiResponse<null>> {
    try {
      // Get task to check permissions
      const task = await taskMethods.getTaskById(taskId);
      if (!task) {
        throw new AppError("Task not found", 404);
      }

      // Check if user has permission to delete this task (project owner/admin or task reporter)
      const memberRole = await projectMethods.isProjectMember(
        task.project_id,
        userId
      );
      if (!memberRole) {
        throw new AppError("Access denied to this task", 403);
      }

      const canDelete =
        task.reporter_id === userId ||
        memberRole === "owner" ||
        memberRole === "admin";

      if (!canDelete) {
        throw new AppError("Permission denied to delete this task", 403);
      }

      await taskMethods.deleteTask(taskId);

      return {
        success: true,
        data: null,
        message: "Task deleted successfully",
      };
    } catch (error: any) {
      throw new AppError(error.message, error.statusCode || 500);
    }
  }

  async getTasksByProject(
    projectId: string,
    userId: string,
    status?: TaskStatus
  ): Promise<ApiResponse<any[]>> {
    try {
      // Check if user has access to this project
      const memberRole = await projectMethods.isProjectMember(
        projectId,
        userId
      );
      if (!memberRole) {
        throw new AppError("Access denied to this project", 403);
      }

      const tasks = await taskMethods.getTasksByProject(
        projectId,
        status ? { status } : undefined
      );

      return {
        success: true,
        data: tasks.tasks,
        message: "Project tasks retrieved successfully",
      };
    } catch (error: any) {
      throw new AppError(error.message, error.statusCode || 500);
    }
  }

  async getUserTasks(
    userId: string,
    filters: {
      status?: TaskStatus;
      priority?: TaskPriority;
      projectId?: string;
      limit?: number;
    } = {}
  ): Promise<ApiResponse<any[]>> {
    try {
      const tasks = await taskMethods.getUserTasks(userId, filters);

      return {
        success: true,
        data: tasks.tasks,
        message: "User tasks retrieved successfully",
      };
    } catch (error: any) {
      throw new AppError(error.message, error.statusCode || 500);
    }
  }

  async addTaskComment(
    taskId: string,
    userId: string,
    content: string
  ): Promise<ApiResponse<any>> {
    try {
      // Get task to check permissions
      const task = await taskMethods.getTaskById(taskId);
      if (!task) {
        throw new AppError("Task not found", 404);
      }

      // Check if user has access to this task's project
      const memberRole = await projectMethods.isProjectMember(
        task.project_id,
        userId
      );
      if (!memberRole) {
        throw new AppError("Access denied to this task", 403);
      }

      const comment = await taskMethods.addTaskComment(taskId, userId, content);

      return {
        success: true,
        data: comment,
        message: "Comment added successfully",
      };
    } catch (error: any) {
      throw new AppError(error.message, error.statusCode || 500);
    }
  }

  async getTaskComments(
    taskId: string,
    userId: string,
    page: number = 1,
    limit: number = 20
  ): Promise<ApiResponse<any[]>> {
    try {
      // Get task to check permissions
      const task = await taskMethods.getTaskById(taskId);
      if (!task) {
        throw new AppError("Task not found", 404);
      }

      // Check if user has access to this task's project
      const memberRole = await projectMethods.isProjectMember(
        task.project_id,
        userId
      );
      if (!memberRole) {
        throw new AppError("Access denied to this task", 403);
      }

      const comments = await taskMethods.getTaskComments(taskId, page, limit);

      return {
        success: true,
        data: comments.comments,
        message: "Comments retrieved successfully",
      };
    } catch (error: any) {
      throw new AppError(error.message, error.statusCode || 500);
    }
  }

  async updateTaskComment(
    commentId: string,
    userId: string,
    content: string
  ): Promise<ApiResponse<any>> {
    try {
      // Note: In a real implementation, you'd want to check if the user owns the comment
      const updatedComment = await taskMethods.updateTaskComment(
        commentId,
        userId,
        content
      );
      if (!updatedComment) {
        throw new AppError("Comment not found", 404);
      }

      return {
        success: true,
        data: updatedComment,
        message: "Comment updated successfully",
      };
    } catch (error: any) {
      throw new AppError(error.message, error.statusCode || 500);
    }
  }

  async deleteTaskComment(commentId: string): Promise<ApiResponse<null>> {
    try {
      // Note: In a real implementation, you'd want to check if the user owns the comment
      const deletedComment = await taskMethods.deleteTaskComment(commentId);
      if (!deletedComment) {
        throw new AppError("Comment not found", 404);
      }

      return {
        success: true,
        data: null,
        message: "Comment deleted successfully",
      };
    } catch (error: any) {
      throw new AppError(error.message, error.statusCode || 500);
    }
  }

  async addTaskAttachment(
    taskId: string,
    userId: string,
    attachmentData: Omit<CreateAttachmentData, "taskId" | "userId">
  ): Promise<ApiResponse<any>> {
    try {
      // Get task to check permissions
      const task = await taskMethods.getTaskById(taskId);
      if (!task) {
        throw new AppError("Task not found", 404);
      }

      // Check if user has access to this task's project
      const memberRole = await projectMethods.isProjectMember(
        task.project_id,
        userId
      );
      if (!memberRole) {
        throw new AppError("Access denied to this task", 403);
      }

      const attachment = await taskMethods.addTaskAttachment(
        taskId,
        userId,
        attachmentData.fileName,
        attachmentData.originalName,
        attachmentData.filePath,
        attachmentData.fileSize,
        attachmentData.mimeType
      );

      return {
        success: true,
        data: attachment,
        message: "Attachment added successfully",
      };
    } catch (error: any) {
      throw new AppError(error.message, error.statusCode || 500);
    }
  }

  async getTaskAttachments(
    taskId: string,
    userId: string
  ): Promise<ApiResponse<any[]>> {
    try {
      // Get task to check permissions
      const task = await taskMethods.getTaskById(taskId);
      if (!task) {
        throw new AppError("Task not found", 404);
      }

      // Check if user has access to this task's project
      const memberRole = await projectMethods.isProjectMember(
        task.project_id,
        userId
      );
      if (!memberRole) {
        throw new AppError("Access denied to this task", 403);
      }

      const attachments = await taskMethods.getTaskAttachments(taskId);

      return {
        success: true,
        data: attachments,
        message: "Attachments retrieved successfully",
      };
    } catch (error: any) {
      throw new AppError(error.message, error.statusCode || 500);
    }
  }

  async deleteTaskAttachment(
    attachmentId: string
  ): Promise<ApiResponse<{ filePath: string } | null>> {
    try {
      // Note: In a real implementation, you'd want to check if the user owns the attachment or has proper permissions
      const deletedAttachment = await taskMethods.deleteTaskAttachment(
        attachmentId
      );
      if (!deletedAttachment) {
        throw new AppError("Attachment not found", 404);
      }

      return {
        success: true,
        data: null,
        message: "Attachment deleted successfully",
      };
    } catch (error: any) {
      throw new AppError(error.message, error.statusCode || 500);
    }
  }
}

export default new TaskService();
