import { Request, Response, NextFunction } from "express";
declare class HealthController {
    checkDatabase(_req: Request, res: Response, _next: NextFunction): Promise<void>;
    checkOverallHealth(_req: Request, res: Response, _next: NextFunction): Promise<void>;
}
declare const _default: HealthController;
export default _default;
