import { Router } from 'express';
import { LinkCustomerMeterSchema, UpdateCustomerMeterLabelSchema } from '@aquaflow/validation';
import { validateBody } from '../middlewares/validate.middleware.js';
import { authenticate, AuthenticatedRequest } from '../middlewares/auth.middleware.js';
import { CustomerService } from '../services/CustomerService.js';

export function createCustomerRouter(customerService: CustomerService): Router {
  const router = Router();

  // GET /api/v1/customers/meters
  router.get('/meters', authenticate, async (req: AuthenticatedRequest, res, next) => {
    try {
      const userId = req.user?.id || 'usr-zalo-8891';
      const meters = await customerService.getUserMeters(userId);
      res.json({
        success: true,
        data: meters,
      });
    } catch (error) {
      next(error);
    }
  });

  // GET /api/v1/customers/:customerCode (Tra cuu danh bo)
  router.get('/:customerCode', async (req, res, next) => {
    try {
      const { customerCode } = req.params;
      const customer = await customerService.findByCode(customerCode);
      if (!customer) {
        return res.status(404).json({
          success: false,
          error: {
            code: 'CUSTOMER_NOT_FOUND',
            message: `Không tìm thấy mã danh bộ ${customerCode} trên hệ thống CAWACO`,
          },
        });
      }
      return res.json({
        success: true,
        data: customer,
      });
    } catch (error) {
      next(error);
    }
  });

  // POST /api/v1/customers/link
  router.post('/link', authenticate, validateBody(LinkCustomerMeterSchema), async (req: AuthenticatedRequest, res, next) => {
    try {
      const userId = req.user?.id || 'usr-zalo-8891';
      const { customerCode, label } = req.body;
      const linked = await customerService.linkMeter(userId, customerCode, label);
      res.status(201).json({
        success: true,
        data: linked,
      });
    } catch (error) {
      next(error);
    }
  });

  // DELETE /api/v1/customers/meters/:meterId
  router.delete('/meters/:meterId', authenticate, async (req: AuthenticatedRequest, res, next) => {
    try {
      const userId = req.user?.id || 'usr-zalo-8891';
      const { meterId } = req.params;
      const unlinked = await customerService.unlinkMeter(userId, meterId);
      res.json({
        success: unlinked,
        data: { unlinked },
      });
    } catch (error) {
      next(error);
    }
  });

  return router;
}
