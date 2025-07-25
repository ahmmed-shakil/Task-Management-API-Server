"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateRequest = void 0;
const express_validator_1 = require("express-validator");
const validateRequest = (req, res, next) => {
    const errors = (0, express_validator_1.validationResult)(req);
    if (!errors.isEmpty()) {
        const validationErrors = errors.array().map((error) => ({
            field: error.type === "field" ? error.path : error.type,
            message: error.msg,
            value: error.value,
        }));
        res.status(400).json({
            success: false,
            message: "Validation failed",
            errors: validationErrors,
        });
        return;
    }
    next();
};
exports.validateRequest = validateRequest;
