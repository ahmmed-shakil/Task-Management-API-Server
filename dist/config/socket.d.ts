import { Server } from "socket.io";
export declare const setupSocketIO: (io: Server) => void;
export declare const emitToUser: (io: Server, userId: string, event: string, data: any) => void;
export declare const emitToProject: (io: Server, projectId: string, event: string, data: any) => void;
export declare const emitToAll: (io: Server, event: string, data: any) => void;
