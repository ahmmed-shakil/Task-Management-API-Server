"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAllTasks = exports.getUserTasks = exports.deleteTaskAttachment = exports.getTaskAttachments = exports.addTaskAttachment = exports.deleteTaskComment = exports.updateTaskComment = exports.getTaskComments = exports.addTaskComment = exports.logTaskHours = exports.updateTaskStatus = exports.updateTaskPosition = exports.restoreTask = exports.archiveTask = exports.getTasksByAssignee = exports.getTasksByProject = exports.getTasks = exports.deleteTask = exports.updateTask = exports.createTask = exports.getTaskWithDetails = exports.getTaskById = void 0;
const prisma_1 = require("../config/prisma");
const prisma_2 = require("../generated/prisma");
// Helper function to map Prisma task to Task interface
const mapPrismaTaskToTask = (prismaTask) => {
    return {
        id: prismaTask.id,
        title: prismaTask.title,
        description: prismaTask.description,
        status: prismaTask.status,
        priority: prismaTask.priority,
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
const getTaskById = async (id) => {
    try {
        const task = await prisma_1.prisma.task.findUnique({
            where: { id },
        });
        if (!task) {
            return null;
        }
        return mapPrismaTaskToTask(task);
    }
    catch (error) {
        console.error("Error getting task by ID:", error);
        throw new Error("Failed to get task");
    }
};
exports.getTaskById = getTaskById;
// Get task with details
const getTaskWithDetails = async (id) => {
    try {
        const task = await prisma_1.prisma.task.findUnique({
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
                    status: task.parentTask.status,
                }
                : null,
            subtasks: task.subtasks.map((subtask) => ({
                id: subtask.id,
                title: subtask.title,
                status: subtask.status,
                priority: subtask.priority,
                assigneeId: subtask.assigneeId,
            })),
            attachmentCount: task.attachments.length,
            commentCount: task.comments.length,
        };
    }
    catch (error) {
        console.error("Error getting task with details:", error);
        throw new Error("Failed to get task details");
    }
};
exports.getTaskWithDetails = getTaskWithDetails;
// Create new task
const createTask = async (taskData) => {
    const { title, description, status = "todo", priority = "medium", assigneeId, reporterId, projectId, parentTaskId, dueDate, estimatedHours, tags = [], } = taskData;
    try {
        // Get the next position for the task
        const taskCount = await prisma_1.prisma.task.count({
            where: { projectId, isArchived: false },
        });
        const task = await prisma_1.prisma.task.create({
            data: {
                title,
                description: description ?? null,
                status: status,
                priority: priority,
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
    }
    catch (error) {
        console.error("Error creating task:", error);
        throw new Error("Failed to create task");
    }
};
exports.createTask = createTask;
// Update task
const updateTask = async (id, updateData) => {
    try {
        const updateFields = {};
        if (updateData.title !== undefined)
            updateFields.title = updateData.title;
        if (updateData.description !== undefined)
            updateFields.description = updateData.description ?? null;
        if (updateData.status !== undefined)
            updateFields.status = updateData.status;
        if (updateData.priority !== undefined)
            updateFields.priority = updateData.priority;
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
        const task = await prisma_1.prisma.task.update({
            where: { id },
            data: updateFields,
        });
        return mapPrismaTaskToTask(task);
    }
    catch (error) {
        if (error instanceof prisma_2.Prisma.PrismaClientKnownRequestError) {
            if (error.code === "P2025") {
                return null; // Task not found
            }
        }
        console.error("Error updating task:", error);
        throw new Error("Failed to update task");
    }
};
exports.updateTask = updateTask;
// Delete task
const deleteTask = async (id) => {
    try {
        await prisma_1.prisma.task.delete({
            where: { id },
        });
        return true;
    }
    catch (error) {
        if (error instanceof prisma_2.Prisma.PrismaClientKnownRequestError) {
            if (error.code === "P2025") {
                return false; // Task not found
            }
        }
        console.error("Error deleting task:", error);
        throw new Error("Failed to delete task");
    }
};
exports.deleteTask = deleteTask;
// Get tasks with filters and pagination
const getTasks = async (filters) => {
    const { page = 1, limit = 10, search, status, priority, assigneeId, projectId, reporterId, dueDate, overdue, } = filters;
    try {
        const skip = (page - 1) * limit;
        const where = {
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
            }
            else {
                where.status = status;
            }
        }
        if (priority) {
            if (Array.isArray(priority)) {
                where.priority = { in: priority };
            }
            else {
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
            prisma_1.prisma.task.findMany({
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
            prisma_1.prisma.task.count({ where }),
        ]);
        const tasksWithDetails = tasks.map((task) => {
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
                        status: task.parentTask.status,
                    }
                    : null,
                subtasks: task.subtasks.map((subtask) => ({
                    id: subtask.id,
                    title: subtask.title,
                    status: subtask.status,
                    priority: subtask.priority,
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
    }
    catch (error) {
        console.error("Error getting tasks:", error);
        throw new Error("Failed to get tasks");
    }
};
exports.getTasks = getTasks;
// Get tasks by project
const getTasksByProject = async (projectId, filters) => {
    return (0, exports.getTasks)({ ...filters, projectId });
};
exports.getTasksByProject = getTasksByProject;
// Get tasks by assignee
const getTasksByAssignee = async (assigneeId, filters) => {
    return (0, exports.getTasks)({ ...filters, assigneeId });
};
exports.getTasksByAssignee = getTasksByAssignee;
// Archive task
const archiveTask = async (id) => {
    try {
        await prisma_1.prisma.task.update({
            where: { id },
            data: { isArchived: true },
        });
        return true;
    }
    catch (error) {
        if (error instanceof prisma_2.Prisma.PrismaClientKnownRequestError) {
            if (error.code === "P2025") {
                return false; // Task not found
            }
        }
        console.error("Error archiving task:", error);
        throw new Error("Failed to archive task");
    }
};
exports.archiveTask = archiveTask;
// Restore task from archive
const restoreTask = async (id) => {
    try {
        await prisma_1.prisma.task.update({
            where: { id },
            data: { isArchived: false },
        });
        return true;
    }
    catch (error) {
        if (error instanceof prisma_2.Prisma.PrismaClientKnownRequestError) {
            if (error.code === "P2025") {
                return false; // Task not found
            }
        }
        console.error("Error restoring task:", error);
        throw new Error("Failed to restore task");
    }
};
exports.restoreTask = restoreTask;
// Update task position
const updateTaskPosition = async (id, newPosition) => {
    try {
        await prisma_1.prisma.task.update({
            where: { id },
            data: { position: newPosition },
        });
        return true;
    }
    catch (error) {
        console.error("Error updating task position:", error);
        throw new Error("Failed to update task position");
    }
};
exports.updateTaskPosition = updateTaskPosition;
// Update task status
const updateTaskStatus = async (id, status) => {
    try {
        const task = await prisma_1.prisma.task.update({
            where: { id },
            data: { status },
        });
        return mapPrismaTaskToTask(task);
    }
    catch (error) {
        if (error instanceof prisma_2.Prisma.PrismaClientKnownRequestError) {
            if (error.code === "P2025") {
                return null; // Task not found
            }
        }
        console.error("Error updating task status:", error);
        throw new Error("Failed to update task status");
    }
};
exports.updateTaskStatus = updateTaskStatus;
// Log actual hours for task
const logTaskHours = async (id, actualHours) => {
    try {
        const task = await prisma_1.prisma.task.update({
            where: { id },
            data: { actualHours },
        });
        return mapPrismaTaskToTask(task);
    }
    catch (error) {
        if (error instanceof prisma_2.Prisma.PrismaClientKnownRequestError) {
            if (error.code === "P2025") {
                return null; // Task not found
            }
        }
        console.error("Error logging task hours:", error);
        throw new Error("Failed to log task hours");
    }
};
exports.logTaskHours = logTaskHours;
// Add task comment
const addTaskComment = async (taskId, userId, content) => {
    try {
        const comment = await prisma_1.prisma.taskComment.create({
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
    }
    catch (error) {
        console.error("Error adding task comment:", error);
        throw new Error("Failed to add task comment");
    }
};
exports.addTaskComment = addTaskComment;
// Get task comments
const getTaskComments = async (taskId, page = 1, limit = 10) => {
    try {
        const skip = (page - 1) * limit;
        const [comments, total] = await Promise.all([
            prisma_1.prisma.taskComment.findMany({
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
            prisma_1.prisma.taskComment.count({ where: { taskId } }),
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
    }
    catch (error) {
        console.error("Error getting task comments:", error);
        throw new Error("Failed to get task comments");
    }
};
exports.getTaskComments = getTaskComments;
// Update task comment
const updateTaskComment = async (commentId, userId, content) => {
    try {
        const comment = await prisma_1.prisma.taskComment.update({
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
    }
    catch (error) {
        console.error("Error updating task comment:", error);
        throw new Error("Failed to update task comment");
    }
};
exports.updateTaskComment = updateTaskComment;
// Delete task comment
const deleteTaskComment = async (commentId) => {
    try {
        await prisma_1.prisma.taskComment.delete({
            where: { id: commentId },
        });
        return true;
    }
    catch (error) {
        console.error("Error deleting task comment:", error);
        throw new Error("Failed to delete task comment");
    }
};
exports.deleteTaskComment = deleteTaskComment;
// Add task attachment
const addTaskAttachment = async (taskId, userId, fileName, originalName, filePath, fileSize, mimeType) => {
    try {
        const attachment = await prisma_1.prisma.taskAttachment.create({
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
    }
    catch (error) {
        console.error("Error adding task attachment:", error);
        throw new Error("Failed to add task attachment");
    }
};
exports.addTaskAttachment = addTaskAttachment;
// Get task attachments
const getTaskAttachments = async (taskId) => {
    try {
        const attachments = await prisma_1.prisma.taskAttachment.findMany({
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
    }
    catch (error) {
        console.error("Error getting task attachments:", error);
        throw new Error("Failed to get task attachments");
    }
};
exports.getTaskAttachments = getTaskAttachments;
// Delete task attachment
const deleteTaskAttachment = async (attachmentId) => {
    try {
        await prisma_1.prisma.taskAttachment.delete({
            where: { id: attachmentId },
        });
        return true;
    }
    catch (error) {
        console.error("Error deleting task attachment:", error);
        throw new Error("Failed to delete task attachment");
    }
};
exports.deleteTaskAttachment = deleteTaskAttachment;
// Get user tasks
const getUserTasks = async (userId, filters) => {
    return (0, exports.getTasks)({ ...filters, assigneeId: userId });
};
exports.getUserTasks = getUserTasks;
// Alias for backward compatibility
exports.getAllTasks = exports.getTasks;
