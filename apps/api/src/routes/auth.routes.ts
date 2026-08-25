import { Router } from 'express';
import { ZaloAuthRequestSchema, PhoneOtpRequestSchema, PhoneOtpVerifySchema } from '@aquaflow/validation';
import { validateBody } from '../middlewares/validate.middleware.js';
import { AuthService } from '../services/AuthService.js';

export function createAuthRouter(authService: AuthService): Router {
  const router = Router();

  // POST /api/v1/auth/zalo
  router.post('/zalo', validateBody(ZaloAuthRequestSchema), async (req, res, next) => {
    try {
      const { accessToken } = req.body;
      const result = await authService.authenticateZalo(accessToken);
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

  return router;
}
