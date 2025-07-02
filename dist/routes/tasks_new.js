"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
// Apply authentication to all routes
router.use(auth_1.authenticateToken);
// Placeholder - this appears to be a duplicate of tasks.js
router.get("/", (_req, res) => {
    res.json({
        success: true,
        message: "Tasks New endpoint - to be implemented or merged with tasks",
        data: [],
    });
});
exports.default = router;
