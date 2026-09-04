import { Request, Response, NextFunction } from 'express';

export function errorHandler(err: any, req: Request, res: Response, next: NextFunction) {
  let statusCode = err.statusCode || 500;
  let errorCode = err.code || 'LỖI_HỆ_THỐNG';
  let message = err.message || 'Đã xảy ra lỗi hệ thống. Vui lòng thử lại sau.';

  // Xử lý lỗi Prisma Unique Constraint (P2002)
  if (err.code === 'P2002' || (err.message && err.message.includes('Unique constraint failed'))) {
    statusCode = 400;
    errorCode = 'TRÙNG_LẶP_DỮ_LIỆU';
    const targets = err.meta?.target || [];
    if (targets.includes('employee_code') || targets.includes('employeeCode')) {
      message = 'Mã nhân viên này đã tồn tại trên hệ thống.';
    } else if (targets.includes('phone')) {
      message = 'Số điện thoại này đã được đăng ký bởi tài khoản khác.';
    } else if (targets.includes('email')) {
      message = 'Địa chỉ Email này đã được đăng ký bởi tài khoản khác.';
    } else {
      message = 'Thông tin nhập bị trùng lặp với dữ liệu đã tồn tại.';
    }
  } else if (err.name === 'ZodError') {
    statusCode = 400;
    errorCode = 'DỮ_LIỆU_KHÔNG_HỢP_LỆ';
    message = err.errors?.[0]?.message || 'Dữ liệu không hợp lệ.';
  } else if (typeof message === 'string') {
    // Tránh cắt chuỗi đường dẫn tệp tin trên Windows (như D:\...)
    if (message.includes('\n')) {
      message = message.split('\n').filter((l: string) => !l.trim().startsWith('-->') && !l.trim().startsWith('at ')).pop()?.trim() || message;
    }
  }

  res.status(statusCode).json({
    success: false,
    error: {
      code: errorCode,
      message,
    },
  });
}
