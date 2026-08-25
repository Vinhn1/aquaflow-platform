import { Request, Response, NextFunction } from 'express';
import { AuthService, AuthUserPayload } from '../services/AuthService.js';
import { UserRole } from '@aquaflow/types';

export interface AuthenticatedRequest extends Request {
  user?: AuthUserPayload;
}

const authService = new AuthService();

export function authenticate(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    // Neu trong dev test chua co token, fallback sang mock user
    req.user = {
      id: 'usr-zalo-8891',
      zaloId: 'zalo_uid_test',
      fullName: 'Nguyễn Văn An',
      phone: '0918234567',
      role: 'CITIZEN',
    };
    return next();
  }

  const token = authHeader.split(' ')[1];
  const payload = authService.verifyToken(token);
  if (!payload) {
    return res.status(401).json({
      success: false,
      error: {
        code: 'CHƯA_XÁC_THỰC',
        message: 'Phiên đăng nhập đã hết hạn hoặc không hợp lệ. Vui lòng đăng nhập lại.',
      },
    });
  }

  req.user = payload;
  next();
}

export function authorizeRoles(...roles: UserRole[]) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        error: {
          code: 'KHÔNG_CÓ_QUYỀN_TRUY_CẬP',
          message: 'Bạn không có quyền thực hiện hành động này.',
        },
      });
    }
    next();
  };
}
