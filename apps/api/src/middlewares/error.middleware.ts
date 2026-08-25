import { Request, Response, NextFunction } from 'express';

export function errorHandler(err: any, req: Request, res: Response, next: NextFunction) {
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Đã xảy ra lỗi hệ thống. Vui lòng thử lại sau.';
  
  let errorCode = 'LỖI_HỆ_THỐNG';
  if (message.includes(':')) {
    const parts = message.split(':');
    errorCode = parts[0].trim();
  }

  res.status(statusCode).json({
    success: false,
    error: {
      code: errorCode,
      message: message.includes(':') ? message.split(':')[1].trim() : message,
    },
  });
}
