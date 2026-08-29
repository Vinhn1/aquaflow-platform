import { Request, Response, NextFunction } from 'express';
import { AuthService, AuthUserPayload } from '../services/AuthService.js';
import { UserRole } from '@aquaflow/types';

export interface AuthenticatedRequest extends Request {
  user?: AuthUserPayload;
}

const authService = new AuthService();

/**
 * Middleware xac thuc JSON Web Token (JWT) cho cac request API
 * Trong moi truong Production, bat buoc phai co token hop le, tra ve 401 neu khong co
 */
export function authenticate(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    // Trong moi truong development cho phep fallback user mau neu khong co header
    if (process.env.NODE_ENV === 'development') {
      req.user = {
        id: 'usr-zalo-8891',
        zaloId: 'zalo_user_cawaco_01',
        fullName: 'Nguyễn Văn An',
        phone: '0918234567',
        role: 'CITIZEN',
      };
      return next();
    }

    return res.status(401).json({
      success: false,
      error: {
        code: 'CHƯA_XÁC_THỰC',
        message: 'Yêu cầu mã định danh xác thực Bearer token.',
      },
    });
  }

  const token = authHeader.split(' ')[1];
  const payload = authService.verifyToken(token);

  if (!payload) {
    return res.status(401).json({
      success: false,
      error: {
        code: 'PHIÊN_ĐĂNG_NHẬP_HẾT_HẠN',
        message: 'Phiên đăng nhập đã hết hạn hoặc không hợp lệ. Vui lòng xác thực lại từ Zalo.',
      },
    });
  }

  req.user = payload;
  next();
}

/**
 * Alias cho authenticate middleware
 */
export const requireAuth = authenticate;

/**
 * Middleware kiem tra quyen truy cap theo vai tro (Role-Based Access Control)
 */
export function authorizeRoles(...roles: UserRole[]) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        error: {
          code: 'KHÔNG_CÓ_QUYỀN_TRUY_CẬP',
          message: 'Tài khoản không có quyền hạn thực hiện hành động này.',
        },
      });
    }
    next();
  };
}
