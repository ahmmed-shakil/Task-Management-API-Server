"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const healthController_1 = __importDefault(require("../controllers/healthController"));
const router = (0, express_1.Router)();
// Database health check
router.get("/db", healthController_1.default.checkDatabase);
// Overall system health check
router.get("/", healthController_1.default.checkOverallHealth);
exports.default = router;
