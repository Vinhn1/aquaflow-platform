import { Request, Response, NextFunction } from 'express';
import { ZodSchema, ZodError } from 'zod';

export function validateBody(schema: ZodSchema) {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      req.body = schema.parse(req.body);
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const details = error.errors.map((err) => ({
          field: err.path.join('.'),
          message: err.message,
        }));
        return res.status(400).json({
          success: false,
          error: {
            code: 'DỮ_LIỆU_KHÔNG_HỢP_LỆ',
            message: details[0]?.message || 'Dữ liệu đầu vào không hợp lệ',
            details,
          },
        });
      }
      next(error);
    }
  };
}

export function validateQuery(schema: ZodSchema) {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      req.query = schema.parse(req.query) as any;
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const details = error.errors.map((err) => ({
          field: err.path.join('.'),
          message: err.message,
        }));
        return res.status(400).json({
          success: false,
          error: {
            code: 'THAM_SỐ_KHÔNG_HỢP_LỆ',
            message: details[0]?.message || 'Tham số truy vấn không hợp lệ',
            details,
          },
        });
      }
      next(error);
    }
  };
}
