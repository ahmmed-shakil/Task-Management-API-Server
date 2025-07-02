"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const express_validator_1 = require("express-validator");
const auth_1 = require("../middleware/auth");
const validation_1 = require("../middleware/validation");
const teamController_1 = __importDefault(require("../controllers/teamController"));
const router = (0, express_1.Router)();
// Validation rules
const createTeamValidation = [
    (0, express_validator_1.body)("name")
        .trim()
        .isLength({ min: 2, max: 100 })
        .withMessage("Team name must be between 2 and 100 characters"),
    (0, express_validator_1.body)("description")
        .optional()
        .trim()
        .isLength({ max: 500 })
        .withMessage("Description must not exceed 500 characters"),
    (0, express_validator_1.body)("leaderId")
        .optional()
        .isUUID()
        .withMessage("Leader ID must be a valid UUID"),
];
const updateTeamValidation = [
    (0, express_validator_1.param)("id").isUUID().withMessage("Team ID must be a valid UUID"),
    (0, express_validator_1.body)("name")
        .optional()
        .trim()
        .isLength({ min: 2, max: 100 })
        .withMessage("Team name must be between 2 and 100 characters"),
    (0, express_validator_1.body)("description")
        .optional()
        .trim()
        .isLength({ max: 500 })
        .withMessage("Description must not exceed 500 characters"),
    (0, express_validator_1.body)("leaderId")
        .optional()
        .isUUID()
        .withMessage("Leader ID must be a valid UUID"),
    (0, express_validator_1.body)("isActive")
        .optional()
        .isBoolean()
        .withMessage("isActive must be a boolean"),
];
const addMemberValidation = [
    (0, express_validator_1.param)("id").isUUID().withMessage("Team ID must be a valid UUID"),
    (0, express_validator_1.body)("userId").isUUID().withMessage("User ID must be a valid UUID"),
    (0, express_validator_1.body)("role").optional().isString().withMessage("Role must be a string"),
];
const teamIdValidation = [
    (0, express_validator_1.param)("id").isUUID().withMessage("Team ID must be a valid UUID"),
];
const memberIdValidation = [
    (0, express_validator_1.param)("id").isUUID().withMessage("Team ID must be a valid UUID"),
    (0, express_validator_1.param)("userId").isUUID().withMessage("User ID must be a valid UUID"),
];
// Apply authentication to all routes
router.use(auth_1.authenticateToken);
// Team routes
router.get("/", teamController_1.default.getAllTeams);
router.post("/", createTeamValidation, validation_1.validateRequest, teamController_1.default.createTeam);
router.get("/:id", teamIdValidation, validation_1.validateRequest, teamController_1.default.getTeamById);
router.put("/:id", updateTeamValidation, validation_1.validateRequest, teamController_1.default.updateTeam);
router.delete("/:id", teamIdValidation, validation_1.validateRequest, teamController_1.default.deleteTeam);
// Team member routes
router.get("/:id/members", teamIdValidation, validation_1.validateRequest, teamController_1.default.getTeamMembers);
router.post("/:id/members", addMemberValidation, validation_1.validateRequest, teamController_1.default.addTeamMember);
router.delete("/:id/members/:userId", memberIdValidation, validation_1.validateRequest, teamController_1.default.removeTeamMember);
// Get current user's teams
router.get("/user/me", teamController_1.default.getUserTeams);
exports.default = router;
