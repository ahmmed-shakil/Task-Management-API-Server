import { Request, Response, NextFunction } from "express";
import { validationResult } from "express-validator";

interface ValidationError {
  field: string;
  message: string;
  value: any;
}

export const validateRequest = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    const validationErrors: ValidationError[] = errors.array().map((error) => ({
      field: error.type === "field" ? (error as any).path : error.type,
      message: error.msg,
      value: (error as any).value,
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
