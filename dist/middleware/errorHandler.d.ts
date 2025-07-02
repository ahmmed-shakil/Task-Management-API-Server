import { Request, Response, NextFunction } from "express";
interface CustomError extends Error {
    statusCode?: number;
    code?: string;
    isOperational?: boolean;
    errors?: Record<string, {
        message: string;
    }>;
}
export declare const errorHandler: (err: CustomError, _req: Request, res: Response, _next: NextFunction) => void;
export declare class AppError extends Error {
    statusCode: number;
    isOperational: boolean;
    constructor(message: string, statusCode: number);
}
export {};
