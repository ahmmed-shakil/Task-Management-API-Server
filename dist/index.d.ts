import { Express } from "express";
import http from "http";
import { Server as SocketIOServer } from "socket.io";
declare class Server {
    private app;
    private server;
    private io;
    private port;
    constructor();
    private initializeDatabase;
    private initializeMiddlewares;
    private initializeRoutes;
    private initializeSocketIO;
    private initializeSwagger;
    private initializeErrorHandling;
    start(): void;
    getApp(): Express;
    getServer(): http.Server;
    getIO(): SocketIOServer;
}
declare const server: Server;
export default server;
