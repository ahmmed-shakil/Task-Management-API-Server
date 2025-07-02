import { Server as SocketIOServer } from "socket.io";
import { Server as HTTPServer } from "http";
declare class SocketService {
    private io;
    private connectedUsers;
    private userSockets;
    initialize(server: HTTPServer): SocketIOServer;
    private setupEventHandlers;
    private authenticateSocket;
    private handleDisconnection;
    private broadcastUserActivity;
    emitTaskCreated(projectId: string, task: any): void;
    emitTaskUpdated(projectId: string, task: any): void;
    emitTaskCompleted(projectId: string, task: any): void;
    emitTaskDeleted(projectId: string, taskId: string): void;
    emitProjectUpdated(projectId: string, project: any): void;
    emitTeamMemberAdded(teamId: string, member: any): void;
    emitTeamMemberRemoved(teamId: string, userId: string): void;
    emitTeamNotification(teamId: string, notification: any): void;
    emitFileUploadProgress(userId: string, fileId: string, progress: number): void;
    emitFileUploaded(taskId: string, file: any): void;
    emitNotificationToUser(userId: string, notification: any): void;
    getConnectedUsersCount(): number;
    getConnectedUsers(): string[];
    isUserOnline(userId: string): boolean;
}
declare const _default: SocketService;
export default _default;
