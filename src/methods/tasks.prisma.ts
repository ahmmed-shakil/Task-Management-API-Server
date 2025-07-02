import { prisma } from "../config/prisma";
import {
  Task,
  CreateTaskData,
  TaskStatus,
  TaskPriority,
  TaskWithDetails,
  PaginatedTasks,
} from "../types/index";
import { Prisma } from "../generated/prisma";

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

// Helper function to map Prisma task to Task interface
const mapPrismaTaskToTask = (prismaTask: any): Task => {
  return {
    id: prismaTask.id,
    title: prismaTask.title,
    description: prismaTask.description,
    status: prismaTask.status as TaskStatus,
    priority: prismaTask.priority as TaskPriority,
    assignee_id: prismaTask.assigneeId,
    reporter_id: prismaTask.reporterId,
    project_id: prismaTask.projectId,
    parent_task_id: prismaTask.parentTaskId,
    due_date: prismaTask.dueDate,
    estimated_hours: prismaTask.estimatedHours,
    actual_hours: prismaTask.actualHours,
    tags: prismaTask.tags,
    position: prismaTask.position,
    is_archived: prismaTask.isArchived,
    created_at: prismaTask.createdAt,
    updated_at: prismaTask.updatedAt,
  };
};

// Get task by ID
export const getTaskById = async (id: string): Promise<Task | null> => {
  try {
    const task = await prisma.task.findUnique({
      where: { id },
    });

    if (!task) {
      return null;
    }

    return mapPrismaTaskToTask(task);
  } catch (error) {
    console.error("Error getting task by ID:", error);
    throw new Error("Failed to get task");
  }
};

// Get task with details
export const getTaskWithDetails = async (
  id: string
): Promise<TaskWithDetails | null> => {
  try {
    const task = await prisma.task.findUnique({
      where: { id },
      include: {
        assignee: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            avatar: true,
          },
        },
        reporter: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            avatar: true,
          },
        },
        project: {
          select: {
            id: true,
            name: true,
            status: true,
          },
        },
        parentTask: {
          select: {
            id: true,
            title: true,
            status: true,
          },
        },
        subtasks: {
          select: {
            id: true,
            title: true,
            status: true,
            priority: true,
            assigneeId: true,
          },
        },
        comments: {
          select: {
            id: true,
          },
        },
        attachments: {
          select: {
            id: true,
          },
        },
      },
    });

    if (!task) {
      return null;
    }

    const baseTask = mapPrismaTaskToTask(task);

    return {
      ...baseTask,
      assignee: task.assignee
        ? {
            id: task.assignee.id,
            email: task.assignee.email,
            firstName: task.assignee.firstName,
            lastName: task.assignee.lastName,
            avatar: task.assignee.avatar,
          }
        : null,
      reporter: {
        id: task.reporter.id,
        email: task.reporter.email,
        firstName: task.reporter.firstName,
        lastName: task.reporter.lastName,
        avatar: task.reporter.avatar,
      },
      project: {
        id: task.project.id,
        name: task.project.name,
        status: task.project.status,
      },
      parentTask: task.parentTask
        ? {
            id: task.parentTask.id,
            title: task.parentTask.title,
            status: task.parentTask.status as TaskStatus,
          }
        : null,
      subtasks: task.subtasks.map((subtask) => ({
        id: subtask.id,
        title: subtask.title,
        status: subtask.status as TaskStatus,
        priority: subtask.priority as TaskPriority,
        assigneeId: subtask.assigneeId,
      })),
      attachmentCount: task.attachments.length,
      commentCount: task.comments.length,
    };
  } catch (error) {
    console.error("Error getting task with details:", error);
    throw new Error("Failed to get task details");
  }
};

// Create new task
export const createTask = async (taskData: CreateTaskData): Promise<Task> => {
  const {
    title,
    description,
    status = "todo",
    priority = "medium",
    assigneeId,
    reporterId,
    projectId,
    parentTaskId,
    dueDate,
    estimatedHours,
    tags = [],
  } = taskData;

  try {
    // Get the next position for the task
    const taskCount = await prisma.task.count({
      where: { projectId, isArchived: false },
    });

    const task = await prisma.task.create({
      data: {
        title,
        description: description ?? null,
        status: status as TaskStatus,
        priority: priority as TaskPriority,
        assigneeId: assigneeId ?? null,
        reporterId,
        projectId,
        parentTaskId: parentTaskId ?? null,
        dueDate: dueDate ? new Date(dueDate) : null,
        estimatedHours: estimatedHours ?? null,
        tags: tags || [],
        position: taskCount,
      },
    });

    return mapPrismaTaskToTask(task);
  } catch (error) {
    console.error("Error creating task:", error);
    throw new Error("Failed to create task");
  }
};

// Update task
export const updateTask = async (
  id: string,
  updateData: Partial<CreateTaskData>
): Promise<Task | null> => {
  try {
    const updateFields: any = {};
    if (updateData.title !== undefined) updateFields.title = updateData.title;
    if (updateData.description !== undefined)
      updateFields.description = updateData.description ?? null;
    if (updateData.status !== undefined)
      updateFields.status = updateData.status as TaskStatus;
    if (updateData.priority !== undefined)
      updateFields.priority = updateData.priority as TaskPriority;
    if (updateData.assigneeId !== undefined)
      updateFields.assigneeId = updateData.assigneeId ?? null;
    if (updateData.dueDate !== undefined)
      updateFields.dueDate = updateData.dueDate
        ? new Date(updateData.dueDate)
        : null;
    if (updateData.estimatedHours !== undefined)
      updateFields.estimatedHours = updateData.estimatedHours ?? null;
    if (updateData.tags !== undefined)
      updateFields.tags = updateData.tags || [];

    const task = await prisma.task.update({
      where: { id },
      data: updateFields,
    });

    return mapPrismaTaskToTask(task);
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === "P2025") {
        return null; // Task not found
      }
    }
    console.error("Error updating task:", error);
    throw new Error("Failed to update task");
  }
};

// Delete task
export const deleteTask = async (id: string): Promise<boolean> => {
  try {
    await prisma.task.delete({
      where: { id },
    });
    return true;
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === "P2025") {
        return false; // Task not found
      }
    }
    console.error("Error deleting task:", error);
    throw new Error("Failed to delete task");
  }
};

// Get tasks with filters and pagination
export const getTasks = async (
  filters: TaskFilters
): Promise<PaginatedTasks> => {
  const {
    page = 1,
    limit = 10,
    search,
    status,
    priority,
    assigneeId,
    projectId,
    reporterId,
    dueDate,
    overdue,
  } = filters;

  try {
    const skip = (page - 1) * limit;

    const where: Prisma.TaskWhereInput = {
      isArchived: false,
    };

    if (search) {
      where.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
      ];
    }

    if (status) {
      if (Array.isArray(status)) {
        where.status = { in: status };
      } else {
        where.status = status;
      }
    }

    if (priority) {
      if (Array.isArray(priority)) {
        where.priority = { in: priority };
      } else {
        where.priority = priority;
      }
    }

    if (assigneeId) {
      where.assigneeId = assigneeId;
    }

    if (projectId) {
      where.projectId = projectId;
    }

    if (reporterId) {
      where.reporterId = reporterId;
    }

    if (dueDate) {
      const date = new Date(dueDate);
      where.dueDate = {
        gte: new Date(date.setHours(0, 0, 0, 0)),
        lt: new Date(date.setHours(23, 59, 59, 999)),
      };
    }

    if (overdue) {
      where.dueDate = {
        lt: new Date(),
      };
      where.status = {
        not: "completed",
      };
    }

    const [tasks, total] = await Promise.all([
      prisma.task.findMany({
        where,
        include: {
          assignee: {
            select: {
              id: true,
              email: true,
              firstName: true,
              lastName: true,
              avatar: true,
            },
          },
          reporter: {
            select: {
              id: true,
              email: true,
              firstName: true,
              lastName: true,
              avatar: true,
            },
          },
          project: {
            select: {
              id: true,
              name: true,
              status: true,
            },
          },
          parentTask: {
            select: {
              id: true,
              title: true,
              status: true,
            },
          },
          subtasks: {
            select: {
              id: true,
              title: true,
              status: true,
              priority: true,
              assigneeId: true,
            },
          },
          _count: {
            select: {
              comments: true,
              attachments: true,
            },
          },
        },
        skip,
        take: limit,
        orderBy: [{ position: "asc" }, { createdAt: "desc" }],
      }),
      prisma.task.count({ where }),
    ]);

    const tasksWithDetails: TaskWithDetails[] = tasks.map((task) => {
      const baseTask = mapPrismaTaskToTask(task);
      return {
        ...baseTask,
        assignee: task.assignee
          ? {
              id: task.assignee.id,
              email: task.assignee.email,
              firstName: task.assignee.firstName,
              lastName: task.assignee.lastName,
              avatar: task.assignee.avatar,
            }
          : null,
        reporter: {
          id: task.reporter.id,
          email: task.reporter.email,
          firstName: task.reporter.firstName,
          lastName: task.reporter.lastName,
          avatar: task.reporter.avatar,
        },
        project: {
          id: task.project.id,
          name: task.project.name,
          status: task.project.status,
        },
        parentTask: task.parentTask
          ? {
              id: task.parentTask.id,
              title: task.parentTask.title,
              status: task.parentTask.status as TaskStatus,
            }
          : null,
        subtasks: task.subtasks.map((subtask) => ({
          id: subtask.id,
          title: subtask.title,
          status: subtask.status as TaskStatus,
          priority: subtask.priority as TaskPriority,
          assigneeId: subtask.assigneeId,
        })),
        attachmentCount: task._count.attachments,
        commentCount: task._count.comments,
      };
    });

    return {
      tasks: tasksWithDetails,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  } catch (error) {
    console.error("Error getting tasks:", error);
    throw new Error("Failed to get tasks");
  }
};

// Get tasks by project
export const getTasksByProject = async (
  projectId: string,
  filters?: Omit<TaskFilters, "projectId">
): Promise<PaginatedTasks> => {
  return getTasks({ ...filters, projectId });
};

// Get tasks by assignee
export const getTasksByAssignee = async (
  assigneeId: string,
  filters?: Omit<TaskFilters, "assigneeId">
): Promise<PaginatedTasks> => {
  return getTasks({ ...filters, assigneeId });
};

// Archive task
export const archiveTask = async (id: string): Promise<boolean> => {
  try {
    await prisma.task.update({
      where: { id },
      data: { isArchived: true },
    });
    return true;
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === "P2025") {
        return false; // Task not found
      }
    }
    console.error("Error archiving task:", error);
    throw new Error("Failed to archive task");
  }
};

// Restore task from archive
export const restoreTask = async (id: string): Promise<boolean> => {
  try {
    await prisma.task.update({
      where: { id },
      data: { isArchived: false },
    });
    return true;
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === "P2025") {
        return false; // Task not found
      }
    }
    console.error("Error restoring task:", error);
    throw new Error("Failed to restore task");
  }
};

// Update task position
export const updateTaskPosition = async (
  id: string,
  newPosition: number
): Promise<boolean> => {
  try {
    await prisma.task.update({
      where: { id },
      data: { position: newPosition },
    });
    return true;
  } catch (error) {
    console.error("Error updating task position:", error);
    throw new Error("Failed to update task position");
  }
};

// Update task status
export const updateTaskStatus = async (
  id: string,
  status: TaskStatus
): Promise<Task | null> => {
  try {
    const task = await prisma.task.update({
      where: { id },
      data: { status },
    });

    return mapPrismaTaskToTask(task);
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === "P2025") {
        return null; // Task not found
      }
    }
    console.error("Error updating task status:", error);
    throw new Error("Failed to update task status");
  }
};

// Log actual hours for task
export const logTaskHours = async (
  id: string,
  actualHours: number
): Promise<Task | null> => {
  try {
    const task = await prisma.task.update({
      where: { id },
      data: { actualHours },
    });

    return mapPrismaTaskToTask(task);
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === "P2025") {
        return null; // Task not found
      }
    }
    console.error("Error logging task hours:", error);
    throw new Error("Failed to log task hours");
  }
};

// Add task comment
export const addTaskComment = async (
  taskId: string,
  userId: string,
  content: string
) => {
  try {
    const comment = await prisma.taskComment.create({
      data: {
        taskId,
        userId,
        content,
      },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            avatar: true,
          },
        },
      },
    });

    return {
      id: comment.id,
      task_id: comment.taskId,
      user_id: comment.userId,
      content: comment.content,
      is_edited: comment.isEdited,
      created_at: comment.createdAt,
      updated_at: comment.updatedAt,
      user: comment.user,
    };
  } catch (error) {
    console.error("Error adding task comment:", error);
    throw new Error("Failed to add task comment");
  }
};

// Get task comments
export const getTaskComments = async (
  taskId: string,
  page: number = 1,
  limit: number = 10
) => {
  try {
    const skip = (page - 1) * limit;

    const [comments, total] = await Promise.all([
      prisma.taskComment.findMany({
        where: { taskId },
        include: {
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              avatar: true,
            },
          },
        },
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
      }),
      prisma.taskComment.count({ where: { taskId } }),
    ]);

    const formattedComments = comments.map((comment) => ({
      id: comment.id,
      task_id: comment.taskId,
      user_id: comment.userId,
      content: comment.content,
      is_edited: comment.isEdited,
      created_at: comment.createdAt,
      updated_at: comment.updatedAt,
      user: comment.user,
    }));

    return {
      comments: formattedComments,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  } catch (error) {
    console.error("Error getting task comments:", error);
    throw new Error("Failed to get task comments");
  }
};

// Update task comment
export const updateTaskComment = async (
  commentId: string,
  userId: string,
  content: string
) => {
  try {
    const comment = await prisma.taskComment.update({
      where: {
        id: commentId,
        userId: userId, // Only allow user to update their own comments
      },
      data: {
        content,
        isEdited: true,
      },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            avatar: true,
          },
        },
      },
    });

    return {
      id: comment.id,
      task_id: comment.taskId,
      user_id: comment.userId,
      content: comment.content,
      is_edited: comment.isEdited,
      created_at: comment.createdAt,
      updated_at: comment.updatedAt,
      user: comment.user,
    };
  } catch (error) {
    console.error("Error updating task comment:", error);
    throw new Error("Failed to update task comment");
  }
};

// Delete task comment
export const deleteTaskComment = async (
  commentId: string
): Promise<boolean> => {
  try {
    await prisma.taskComment.delete({
      where: { id: commentId },
    });
    return true;
  } catch (error) {
    console.error("Error deleting task comment:", error);
    throw new Error("Failed to delete task comment");
  }
};

// Add task attachment
export const addTaskAttachment = async (
  taskId: string,
  userId: string,
  fileName: string,
  originalName: string,
  filePath: string,
  fileSize: number,
  mimeType: string
) => {
  try {
    const attachment = await prisma.taskAttachment.create({
      data: {
        taskId,
        userId,
        fileName,
        originalName,
        filePath,
        fileSize,
        mimeType,
      },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            avatar: true,
          },
        },
      },
    });

    return {
      id: attachment.id,
      task_id: attachment.taskId,
      user_id: attachment.userId,
      file_name: attachment.fileName,
      original_name: attachment.originalName,
      file_path: attachment.filePath,
      file_size: attachment.fileSize,
      mime_type: attachment.mimeType,
      created_at: attachment.createdAt,
      user: attachment.user,
    };
  } catch (error) {
    console.error("Error adding task attachment:", error);
    throw new Error("Failed to add task attachment");
  }
};

// Get task attachments
export const getTaskAttachments = async (taskId: string) => {
  try {
    const attachments = await prisma.taskAttachment.findMany({
      where: { taskId },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            avatar: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return attachments.map((attachment) => ({
      id: attachment.id,
      task_id: attachment.taskId,
      user_id: attachment.userId,
      file_name: attachment.fileName,
      original_name: attachment.originalName,
      file_path: attachment.filePath,
      file_size: attachment.fileSize,
      mime_type: attachment.mimeType,
      created_at: attachment.createdAt,
      user: attachment.user,
    }));
  } catch (error) {
    console.error("Error getting task attachments:", error);
    throw new Error("Failed to get task attachments");
  }
};

// Delete task attachment
export const deleteTaskAttachment = async (
  attachmentId: string
): Promise<boolean> => {
  try {
    await prisma.taskAttachment.delete({
      where: { id: attachmentId },
    });
    return true;
  } catch (error) {
    console.error("Error deleting task attachment:", error);
    throw new Error("Failed to delete task attachment");
  }
};

// Get user tasks
export const getUserTasks = async (userId: string, filters?: TaskFilters) => {
  return getTasks({ ...filters, assigneeId: userId });
};

// Alias for backward compatibility
export const getAllTasks = getTasks;
