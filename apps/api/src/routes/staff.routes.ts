import { Router } from 'express';
import { prisma } from '../lib/prisma.js';
import { authenticate, authorizeRoles, AuthenticatedRequest } from '../middlewares/auth.middleware.js';
import { hashPassword } from '../services/AuthService.js';
import { UserRole } from '@aquaflow/types';

export function createStaffRouter(): Router {
  const router = Router();

  // GET /api/v1/admin/staff (Lay danh sach can bo nhan vien)
  router.get('/', authenticate, authorizeRoles('SUPER_ADMIN' as UserRole, 'BRANCH_MANAGER' as UserRole), async (req: AuthenticatedRequest, res, next) => {
    try {
      const staffList = await prisma.user.findMany({
        where: {
          role: {
            in: ['SUPER_ADMIN', 'BRANCH_MANAGER', 'COUNTER_STAFF', 'FIELD_WORKER'],
          },
        },
        include: {
          branch: true,
        },
        orderBy: [
          { role: 'asc' },
          { createdAt: 'desc' },
        ],
      });

      const sanitized = staffList.map((u) => ({
        id: u.id,
        employeeCode: u.employeeCode,
        fullName: u.fullName,
        email: u.email,
        phone: u.phone,
        role: u.role,
        branchId: u.branchId,
        branchName: u.branch ? u.branch.name : 'Chưa phân công',
        counterNumber: u.counterNumber,
        isActive: u.isActive,
        createdAt: u.createdAt.toISOString(),
      }));

      res.json({
        success: true,
        data: sanitized,
      });
    } catch (error) {
      next(error);
    }
  });

  // POST /api/v1/admin/staff (Khoi tao / Cap tai khoan can bo moi)
  router.post('/', authenticate, authorizeRoles('SUPER_ADMIN' as UserRole, 'BRANCH_MANAGER' as UserRole), async (req: AuthenticatedRequest, res, next) => {
    try {
      const { fullName, employeeCode, email, phone, password, role, branchId, counterNumber } = req.body;

      if (!fullName || !employeeCode || !password || !role) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'THIẾU_THÔNG_TIN',
            message: 'Vui lòng nhập Họ tên, Mã nhân viên, Mật khẩu và Vai trò.',
          },
        });
      }

      const cleanCode = employeeCode.trim().toUpperCase();
      const cleanEmail = email && email.trim() ? email.trim().toLowerCase() : null;
      const cleanPhone = phone && phone.trim() ? phone.trim() : null;

      // Kiem tra trung ma nhan vien, email hoac so dien thoai
      const orConditions: any[] = [{ employeeCode: cleanCode }];
      if (cleanEmail) {
        orConditions.push({ email: cleanEmail });
      }
      if (cleanPhone) {
        orConditions.push({ phone: cleanPhone });
      }

      const existing = await prisma.user.findFirst({
        where: {
          OR: orConditions,
        },
      });

      if (existing) {
        let message = 'Tài khoản này đã tồn tại trên hệ thống.';
        if (existing.employeeCode === cleanCode) {
          message = `Mã nhân viên "${cleanCode}" đã tồn tại trên hệ thống.`;
        } else if (cleanEmail && existing.email === cleanEmail) {
          message = `Địa chỉ Email "${cleanEmail}" đã được đăng ký bởi cán bộ khác.`;
        } else if (cleanPhone && existing.phone === cleanPhone) {
          message = `Số điện thoại "${cleanPhone}" đã được sử dụng bởi tài khoản khác.`;
        }

        return res.status(400).json({
          success: false,
          error: {
            code: 'TÀI_KHOẢN_ĐÃ_TỒN_TẠI',
            message,
          },
        });
      }

      // Neu chua co branchId thi lay branch dau tien
      let targetBranchId = branchId;
      if (!targetBranchId) {
        const firstBranch = await prisma.branch.findFirst();
        targetBranchId = firstBranch?.id;
      }

      const newUser = await prisma.user.create({
        data: {
          fullName: fullName.trim(),
          employeeCode: cleanCode,
          email: cleanEmail,
          phone: cleanPhone,
          passwordHash: hashPassword(password),
          role: role as any,
          branchId: targetBranchId,
          counterNumber: counterNumber ? Number(counterNumber) : undefined,
          isActive: true,
        },
        include: { branch: true },
      });

      res.status(201).json({
        success: true,
        data: {
          id: newUser.id,
          employeeCode: newUser.employeeCode,
          fullName: newUser.fullName,
          email: newUser.email,
          phone: newUser.phone,
          role: newUser.role,
          branchName: newUser.branch ? newUser.branch.name : undefined,
          counterNumber: newUser.counterNumber,
          isActive: newUser.isActive,
        },
      });
    } catch (error) {
      next(error);
    }
  });

  // PUT /api/v1/admin/staff/:id (Cap nhat thong tin / phan quay / quyen / trang thai / mat khau)
  router.put('/:id', authenticate, authorizeRoles('SUPER_ADMIN' as UserRole, 'BRANCH_MANAGER' as UserRole), async (req: AuthenticatedRequest, res, next) => {
    try {
      const { id } = req.params;
      const { fullName, employeeCode, email, phone, role, branchId, counterNumber, isActive, password } = req.body;

      const dataToUpdate: any = {};
      if (fullName) dataToUpdate.fullName = fullName.trim();
      if (employeeCode) dataToUpdate.employeeCode = employeeCode.trim().toUpperCase();
      if (email !== undefined) dataToUpdate.email = email && email.trim() ? email.trim().toLowerCase() : null;
      if (phone !== undefined) dataToUpdate.phone = phone && phone.trim() ? phone.trim() : null;
      if (role) dataToUpdate.role = role;
      if (branchId) dataToUpdate.branchId = branchId;
      if (counterNumber !== undefined) dataToUpdate.counterNumber = counterNumber ? Number(counterNumber) : null;
      if (isActive !== undefined) dataToUpdate.isActive = Boolean(isActive);
      if (password && password.trim()) dataToUpdate.passwordHash = hashPassword(password.trim());

      const updated = await prisma.user.update({
        where: { id },
        data: dataToUpdate,
        include: { branch: true },
      });

      res.json({
        success: true,
        data: {
          id: updated.id,
          employeeCode: updated.employeeCode,
          fullName: updated.fullName,
          email: updated.email,
          phone: updated.phone,
          role: updated.role,
          branchName: updated.branch ? updated.branch.name : undefined,
          counterNumber: updated.counterNumber,
          isActive: updated.isActive,
        },
      });
    } catch (error) {
      next(error);
    }
  });

  return router;
}
