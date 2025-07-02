import { Express } from "express";
import http from "http";
declare class Server {
    private app;
    private server;
    private port;
    constructor();
    private initializeDatabase;
    private initializeMiddlewares;
    private initializeRoutes;
    private initializeSocket;
    private initializeCronJobs;
    private initializeSwagger;
    private initializeErrorHandling;
    start(): void;
    getApp(): Express;
    getServer(): http.Server;
}
declare const server: Server;
export default server;
