import { Router } from "express";
import { authenticateToken } from "../middleware/auth";
import { Request, Response } from "express";

const router = Router();

// Apply authentication to all routes
router.use(authenticateToken);

// Placeholder - this appears to be a duplicate of tasks.js
router.get("/", (_req: Request, res: Response) => {
  res.json({
    success: true,
    message: "Tasks New endpoint - to be implemented or merged with tasks",
    data: [],
  });
});

export default router;
