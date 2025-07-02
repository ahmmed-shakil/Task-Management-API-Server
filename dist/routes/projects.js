"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const express_validator_1 = require("express-validator");
const projectController_1 = __importDefault(require("../controllers/projectController"));
const auth_1 = require("../middleware/auth");
const validation_1 = require("../middleware/validation");
const router = (0, express_1.Router)();
// Validation rules
const createProjectValidation = [
    (0, express_validator_1.body)("name")
        .trim()
        .isLength({ min: 2, max: 100 })
        .withMessage("Project name must be between 2 and 100 characters"),
    (0, express_validator_1.body)("description")
        .optional()
        .trim()
        .isLength({ max: 500 })
        .withMessage("Description must not exceed 500 characters"),
    (0, express_validator_1.body)("status")
        .optional()
        .isIn(["planning", "active", "completed", "on-hold"])
        .withMessage("Status must be one of: planning, active, completed, on-hold"),
    (0, express_validator_1.body)("priority")
        .optional()
        .isIn(["low", "medium", "high", "urgent"])
        .withMessage("Priority must be one of: low, medium, high, urgent"),
    (0, express_validator_1.body)("startDate")
        .optional()
        .isISO8601()
        .withMessage("Start date must be a valid ISO 8601 date"),
    (0, express_validator_1.body)("endDate")
        .optional()
        .isISO8601()
        .withMessage("End date must be a valid ISO 8601 date"),
    (0, express_validator_1.body)("budget").optional().isNumeric().withMessage("Budget must be a number"),
];
const updateProjectValidation = [
    (0, express_validator_1.param)("id").isUUID().withMessage("Project ID must be a valid UUID"),
    (0, express_validator_1.body)("name")
        .optional()
        .trim()
        .isLength({ min: 2, max: 100 })
        .withMessage("Project name must be between 2 and 100 characters"),
    (0, express_validator_1.body)("description")
        .optional()
        .trim()
        .isLength({ max: 500 })
        .withMessage("Description must not exceed 500 characters"),
    (0, express_validator_1.body)("status")
        .optional()
        .isIn(["planning", "active", "completed", "on-hold"])
        .withMessage("Status must be one of: planning, active, completed, on-hold"),
    (0, express_validator_1.body)("priority")
        .optional()
        .isIn(["low", "medium", "high", "urgent"])
        .withMessage("Priority must be one of: low, medium, high, urgent"),
];
const projectIdValidation = [
    (0, express_validator_1.param)("id").isUUID().withMessage("Project ID must be a valid UUID"),
];
const memberValidation = [
    (0, express_validator_1.param)("id").isUUID().withMessage("Project ID must be a valid UUID"),
    (0, express_validator_1.body)("userId").isUUID().withMessage("User ID must be a valid UUID"),
    (0, express_validator_1.body)("role")
        .optional()
        .isIn(["owner", "admin", "member", "viewer"])
        .withMessage("Role must be one of: owner, admin, member, viewer"),
];
// Apply authentication to all routes
router.use(auth_1.authenticateToken);
// Project routes
router.get("/", projectController_1.default.getAllProjects);
router.post("/", createProjectValidation, validation_1.validateRequest, projectController_1.default.createProject);
router.get("/:id", projectIdValidation, validation_1.validateRequest, projectController_1.default.getProjectById);
router.put("/:id", updateProjectValidation, validation_1.validateRequest, projectController_1.default.updateProject);
router.delete("/:id", projectIdValidation, validation_1.validateRequest, projectController_1.default.deleteProject);
// Project member routes
router.get("/:id/members", projectIdValidation, validation_1.validateRequest, projectController_1.default.getProjectMembers);
router.post("/:id/members", memberValidation, validation_1.validateRequest, projectController_1.default.addProjectMember);
router.delete("/:id/members/:userId", [
    (0, express_validator_1.param)("id").isUUID().withMessage("Project ID must be a valid UUID"),
    (0, express_validator_1.param)("userId").isUUID().withMessage("User ID must be a valid UUID"),
], validation_1.validateRequest, projectController_1.default.removeProjectMember);
exports.default = router;
