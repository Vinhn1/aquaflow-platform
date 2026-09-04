import { Router } from 'express';
import { ZaloAuthRequestSchema, PhoneOtpRequestSchema, PhoneOtpVerifySchema } from '@aquaflow/validation';
import { validateBody } from '../middlewares/validate.middleware.js';
import { AuthService, hashPassword, verifyPassword } from '../services/AuthService.js';
import { prisma } from '../lib/prisma.js';

export function createAuthRouter(authService: AuthService): Router {
  const router = Router();

  // POST /api/v1/auth/zalo
  router.post('/zalo', async (req, res, next) => {
    try {
      const { accessToken, userInfo, phone } = req.body;
      const result = await authService.authenticateZalo(accessToken, userInfo, phone);
      res.json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  });

  // POST /api/v1/auth/otp/request
  router.post('/otp/request', validateBody(PhoneOtpRequestSchema), async (req, res, next) => {
    try {
      const { phone } = req.body;
      res.json({
        success: true,
        data: {
          phone,
          otpSent: true,
          expiresInSeconds: 120,
          message: 'Mã xác thực OTP đã được gửi đến số điện thoại của bạn.',
        },
      });
    } catch (error) {
      next(error);
    }
  });

  // POST /api/v1/auth/otp/verify
  router.post('/otp/verify', validateBody(PhoneOtpVerifySchema), async (req, res, next) => {
    try {
      const { phone } = req.body;
      const token = authService.generateToken({
        id: 'usr-phone-' + phone.slice(-4),
        phone,
        fullName: 'Khách hàng Cà Mau',
        role: 'CITIZEN',
      });
      res.json({
        success: true,
        data: {
          token,
          user: {
            phone,
            fullName: 'Khách hàng Cà Mau',
            role: 'CITIZEN',
          },
        },
      });
    } catch (error) {
      next(error);
    }
  });

  // POST /api/v1/auth/admin/login (Dang nhap can bo nhan vien / Quan tri vien)
  router.post('/admin/login', async (req, res, next) => {
    try {
      const { identifier, password } = req.body;
      if (!identifier || !password) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'THIẾU_THÔNG_TIN',
            message: 'Vui lòng nhập Mã nhân viên hoặc Email và Mật khẩu.',
          },
        });
      }

      const result = await authService.loginAdmin(identifier, password);
      res.json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  });

  // GET /api/v1/auth/me (Lay thong tin can bo dang dang nhap)
  router.get('/me', async (req, res, next) => {
    try {
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({
          success: false,
          error: { code: 'CHƯA_XÁC_THỰC', message: 'Yêu cầu token xác thực.' },
        });
      }

      const token = authHeader.split(' ')[1];
      const payload = authService.verifyToken(token);
      if (!payload) {
        return res.status(401).json({
          success: false,
          error: { code: 'TOKEN_KHÔNG_HỢP_LỆ', message: 'Phiên đăng nhập đã hết hạn.' },
        });
      }

      res.json({
        success: true,
        data: payload,
      });
    } catch (error) {
      next(error);
    }
  });

  // PUT /api/v1/auth/profile (Cap nhat ho so ca nhan)
  router.put('/profile', async (req, res, next) => {
    try {
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({
          success: false,
          error: { code: 'CHƯA_XÁC_THỰC', message: 'Yêu cầu token xác thực.' },
        });
      }

      const token = authHeader.split(' ')[1];
      const payload = authService.verifyToken(token);
      if (!payload) {
        return res.status(401).json({
          success: false,
          error: { code: 'TOKEN_KHÔNG_HỢP_LỆ', message: 'Phiên đăng nhập đã hết hạn.' },
        });
      }

      const { fullName, phone, email, avatarUrl } = req.body;
      if (!fullName || !fullName.trim()) {
        return res.status(400).json({
          success: false,
          error: { code: 'THIẾU_THÔNG_TIN', message: 'Họ và tên không được để trống.' },
        });
      }

      const updated = await prisma.user.update({
        where: { id: payload.id },
        data: {
          fullName: fullName.trim(),
          ...(phone !== undefined ? { phone: phone.trim() || null } : {}),
          ...(email !== undefined ? { email: email.trim().toLowerCase() || null } : {}),
          ...(avatarUrl !== undefined ? { avatarUrl: avatarUrl ? avatarUrl.trim() : null } : {}),
        },
        include: { branch: true },
      });

      const newPayload = {
        id: updated.id,
        fullName: updated.fullName,
        avatarUrl: updated.avatarUrl ?? undefined,
        role: updated.role,
        employeeCode: updated.employeeCode ?? undefined,
        email: updated.email ?? undefined,
        phone: updated.phone ?? undefined,
        branchId: updated.branchId ?? undefined,
        branchName: updated.branch ? updated.branch.name : undefined,
        counterNumber: updated.counterNumber ?? undefined,
      };

      const newToken = authService.generateToken(newPayload as any);

      res.json({
        success: true,
        data: {
          user: newPayload,
          token: newToken,
          message: 'Cập nhật thông tin hồ sơ thành công!',
        },
      });
    } catch (error) {
      next(error);
    }
  });

  // PUT /api/v1/auth/change-password (Doi mat khau)
  router.put('/change-password', async (req, res, next) => {
    try {
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({
          success: false,
          error: { code: 'CHƯA_XÁC_THỰC', message: 'Yêu cầu token xác thực.' },
        });
      }

      const token = authHeader.split(' ')[1];
      const payload = authService.verifyToken(token);
      if (!payload) {
        return res.status(401).json({
          success: false,
          error: { code: 'TOKEN_KHÔNG_HỢP_LỆ', message: 'Phiên đăng nhập đã hết hạn.' },
        });
      }

      const { currentPassword, newPassword } = req.body;
      if (!currentPassword || !newPassword) {
        return res.status(400).json({
          success: false,
          error: { code: 'THIẾU_THÔNG_TIN', message: 'Vui lòng nhập mật khẩu hiện tại và mật khẩu mới.' },
        });
      }

      if (newPassword.length < 6) {
        return res.status(400).json({
          success: false,
          error: { code: 'MẬT_KHẨU_YẾU', message: 'Mật khẩu mới phải có ít nhất 6 ký tự.' },
        });
      }

      const dbUser = await prisma.user.findUnique({
        where: { id: payload.id },
      });

      if (!dbUser || !dbUser.passwordHash) {
        return res.status(404).json({
          success: false,
          error: { code: 'NGƯỜI_DÙNG_KHÔNG_TỒN_TẠI', message: 'Không tìm thấy tài khoản.' },
        });
      }

      const isMatch = verifyPassword(currentPassword, dbUser.passwordHash);
      if (!isMatch) {
        return res.status(400).json({
          success: false,
          error: { code: 'MẬT_KHẨU_HIỆN_TẠI_SAI', message: 'Mật khẩu hiện tại không chính xác.' },
        });
      }

      const newHash = hashPassword(newPassword);
      await prisma.user.update({
        where: { id: payload.id },
        data: { passwordHash: newHash },
      });

      res.json({
        success: true,
        data: { message: 'Đổi mật khẩu thành công!' },
      });
    } catch (error) {
      next(error);
    }
  });

  return router;
}
