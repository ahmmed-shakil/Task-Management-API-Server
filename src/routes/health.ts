import { Router } from "express";
import healthController from "../controllers/healthController";

const router = Router();

// Database health check
router.get("/db", healthController.checkDatabase);

// Overall system health check
router.get("/", healthController.checkOverallHealth);

export default router;
