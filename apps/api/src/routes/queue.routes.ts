import { Router } from 'express';
import { CreateQueueTicketSchema, CallNextTicketSchema, CompleteTicketSchema } from '@aquaflow/validation';
import { validateBody } from '../middlewares/validate.middleware.js';
import { authenticate, authorizeRoles, AuthenticatedRequest } from '../middlewares/auth.middleware.js';
import { QueueEngine } from '../services/QueueEngine.js';

export function createQueueRouter(queueEngine: QueueEngine): Router {
  const router = Router();

  // POST /api/v1/queue/tickets (Citizen creates ticket)
  router.post('/tickets', authenticate, validateBody(CreateQueueTicketSchema), async (req: AuthenticatedRequest, res, next) => {
    try {
      const userId = req.user?.id || 'usr-zalo-8891';
      const { branchId, serviceType, customerName, phone } = req.body;
      const ticket = await queueEngine.bookTicket({
        branchId,
        serviceType,
        userId,
        customerName,
        phone,
      });
      res.status(201).json({
        success: true,
        data: ticket,
      });
    } catch (error) {
      next(error);
    }
  });

  // GET /api/v1/queue/tickets/:ticketId
  router.get('/tickets/:ticketId', async (req, res, next) => {
    try {
      const { ticketId } = req.params;
      const ticket = await queueEngine.getTicket(ticketId);
      if (!ticket) {
        return res.status(404).json({
          success: false,
          error: {
            code: 'VÉ_KHÔNG_TỒN_TẠI',
            message: 'Không tìm thấy thông tin vé bốc số',
          },
        });
      }
      res.json({
        success: true,
        data: ticket,
      });
    } catch (error) {
      next(error);
    }
  });

  // POST /api/v1/queue/call-next (Counter staff calls next ticket)
  router.post('/call-next', authenticate, validateBody(CallNextTicketSchema), async (req, res, next) => {
    try {
      const { branchId, counterId, serviceType } = req.body;
      const ticket = await queueEngine.callNext(branchId, counterId, serviceType);
      res.json({
        success: true,
        data: ticket,
      });
    } catch (error) {
      next(error);
    }
  });

  // POST /api/v1/queue/complete (Counter staff finishes ticket)
  router.post('/complete', authenticate, validateBody(CompleteTicketSchema), async (req, res, next) => {
    try {
      const { ticketId, counterId } = req.body;
      const completed = await queueEngine.complete(ticketId, counterId);
      res.json({
        success: completed,
        data: { completed },
      });
    } catch (error) {
      next(error);
    }
  });

  // GET /api/v1/queue/overview/:branchId
  router.get('/overview/:branchId', async (req, res, next) => {
    try {
      const { branchId } = req.params;
      const overview = await queueEngine.getOverview(branchId);
      res.json({
        success: true,
        data: overview,
      });
    } catch (error) {
      next(error);
    }
  });

  return router;
}
