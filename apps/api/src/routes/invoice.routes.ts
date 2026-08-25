import { Router } from 'express';
import { GetInvoicesQuerySchema } from '@aquaflow/validation';
import { validateQuery } from '../middlewares/validate.middleware.js';
import { BillingService } from '../services/BillingService.js';

export function createInvoiceRouter(billingService: BillingService): Router {
  const router = Router();

  // GET /api/v1/invoices
  router.get('/', validateQuery(GetInvoicesQuerySchema), async (req, res, next) => {
    try {
      const { customerCode, status } = req.query as any;
      const invoices = await billingService.getInvoices(customerCode, status);
      res.json({
        success: true,
        data: invoices,
      });
    } catch (error) {
      next(error);
    }
  });

  // GET /api/v1/invoices/:invoiceId
  router.get('/:invoiceId', async (req, res, next) => {
    try {
      const { invoiceId } = req.params;
      const invoice = await billingService.getInvoiceDetail(invoiceId);
      if (!invoice) {
        return res.status(404).json({
          success: false,
          error: {
            code: 'HÓA_ĐƠN_KHÔNG_TỒN_TẠI',
            message: 'Không tìm thấy hóa đơn tiền nước với mã này',
          },
        });
      }
      res.json({
        success: true,
        data: invoice,
      });
    } catch (error) {
      next(error);
    }
  });

  // GET /api/v1/invoices/history/:customerCode
  router.get('/history/:customerCode', async (req, res, next) => {
    try {
      const { customerCode } = req.params;
      const history = await billingService.getConsumptionHistory(customerCode);
      res.json({
        success: true,
        data: history,
      });
    } catch (error) {
      next(error);
    }
  });

  return router;
}
