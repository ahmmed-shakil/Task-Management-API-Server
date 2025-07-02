import jwt from "jsonwebtoken";
import { Server, Socket } from "socket.io";
import { getUserById } from "../methods/users.prisma";
import { User } from "../types/index";

interface AuthenticatedSocket extends Socket {
  userId: string;
  user: User;
}

interface SocketData {
  projectId: string;
  taskId?: string;
  assigneeId?: string;
  [key: string]: any;
}

interface TypingData {
  projectId: string;
  taskId: string;
}

export const setupSocketIO = (io: Server): void => {
  // Middleware for socket authentication
  io.use(async (socket: Socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      if (!token) {
        return next(new Error("Authentication error"));
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET!) as {
        userId: string;
      };
      const user = await getUserById(decoded.userId);

      if (!user) {
        return next(new Error("User not found"));
      }

      (socket as AuthenticatedSocket).userId = user.id;
      (socket as AuthenticatedSocket).user = user;
      next();
    } catch (error) {
      next(new Error("Authentication error"));
    }
  });

  io.on("connection", (socket: Socket) => {
    const authSocket = socket as AuthenticatedSocket;
    console.log(`User ${authSocket.user.email} connected`);

    // Join user to their personal room
    authSocket.join(`user_${authSocket.userId}`);

    // Handle joining project rooms
    authSocket.on("join_project", (projectId: string) => {
      authSocket.join(`project_${projectId}`);
      console.log(`User ${authSocket.user.email} joined project ${projectId}`);
    });

    // Handle leaving project rooms
    authSocket.on("leave_project", (projectId: string) => {
      authSocket.leave(`project_${projectId}`);
      console.log(`User ${authSocket.user.email} left project ${projectId}`);
    });

    // Handle task updates
    authSocket.on("task_update", (data: SocketData) => {
      // Broadcast to project members
      authSocket.to(`project_${data.projectId}`).emit("task_updated", data);
    });

    // Handle new task creation
    authSocket.on("task_created", (data: SocketData) => {
      // Broadcast to project members
      authSocket.to(`project_${data.projectId}`).emit("new_task", data);
    });

    // Handle task assignment
    authSocket.on("task_assigned", (data: SocketData) => {
      // Notify assigned user
      if (data.assigneeId) {
        authSocket
          .to(`user_${data.assigneeId}`)
          .emit("task_assigned_to_you", data);
      }
      // Broadcast to project members
      authSocket
        .to(`project_${data.projectId}`)
        .emit("task_assignment_updated", data);
    });

    // Handle comments
    authSocket.on("comment_added", (data: SocketData) => {
      // Broadcast to project members
      authSocket.to(`project_${data.projectId}`).emit("new_comment", data);
    });

    // Handle typing indicators
    authSocket.on("typing_start", (data: TypingData) => {
      authSocket.to(`project_${data.projectId}`).emit("user_typing", {
        userId: authSocket.userId,
        userName: `${authSocket.user.firstName} ${authSocket.user.lastName}`,
        taskId: data.taskId,
      });
    });

    authSocket.on("typing_stop", (data: TypingData) => {
      authSocket.to(`project_${data.projectId}`).emit("user_stopped_typing", {
        userId: authSocket.userId,
        taskId: data.taskId,
      });
    });

    // Handle disconnect
    authSocket.on("disconnect", () => {
      console.log(`User ${authSocket.user.email} disconnected`);
    });
  });
};

// Helper functions to emit events from controllers
export const emitToUser = (
  io: Server,
  userId: string,
  event: string,
  data: any
): void => {
  io.to(`user_${userId}`).emit(event, data);
};

export const emitToProject = (
  io: Server,
  projectId: string,
  event: string,
  data: any
): void => {
  io.to(`project_${projectId}`).emit(event, data);
};

export const emitToAll = (io: Server, event: string, data: any): void => {
  io.emit(event, data);
};
