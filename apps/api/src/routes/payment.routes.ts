import { Router } from 'express';
import { GeneratePaymentQrSchema, PaymentWebhookPayloadSchema } from '@aquaflow/validation';
import { validateBody } from '../middlewares/validate.middleware.js';
import { PaymentService } from '../services/PaymentService.js';

export function createPaymentRouter(paymentService: PaymentService): Router {
  const router = Router();

  // POST /api/v1/payments/generate-qr
  router.post('/generate-qr', validateBody(GeneratePaymentQrSchema), async (req, res, next) => {
    try {
      const { invoiceId } = req.body;
      const qrResult = await paymentService.generateInvoiceVietQr(invoiceId);
      res.json({
        success: true,
        data: qrResult,
      });
    } catch (error) {
      next(error);
    }
  });

  // POST /api/v1/payments/webhook
  router.post('/webhook', validateBody(PaymentWebhookPayloadSchema), async (req, res, next) => {
    try {
      const signature = (req.headers['x-payment-signature'] as string) || req.body.signature;
      const result = await paymentService.processPaymentWebhook(req.body, signature);
      res.json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  });

  return router;
}
