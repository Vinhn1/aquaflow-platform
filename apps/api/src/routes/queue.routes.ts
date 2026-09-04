import { Router } from 'express';
import { BookQueueTicketSchema, CallNextTicketSchema, CompleteTicketSchema } from '@aquaflow/validation';
import { validateBody } from '../middlewares/validate.middleware.js';
import { authenticate, authorizeRoles, AuthenticatedRequest } from '../middlewares/auth.middleware.js';
import { QueueEngine } from '../services/QueueEngine.js';

export function createQueueRouter(queueEngine: QueueEngine): Router {
  const router = Router();

  // POST /api/v1/queue/tickets — Citizen books ticket
  router.post('/tickets', authenticate, validateBody(BookQueueTicketSchema), async (req: AuthenticatedRequest, res, next) => {
    try {
      const userId = req.user?.id || 'usr-zalo-8891';
      const { branchId, serviceType, customerName, phone, customerCode } = req.body;
      const ticket = await (queueEngine.bookTicket as any)({
        branchId,
        serviceType,
        userId,
        customerName,
        phone,
        customerCode,
      });
      res.status(201).json({ success: true, data: ticket });
    } catch (error) {
      next(error);
    }
  });

  // GET /api/v1/queue/tickets?branchId=&status=WAITING&today=true&limit=20 — Admin list
  router.get('/tickets', async (req, res, next) => {
    try {
      const { branchId, status, today, limit } = req.query;
      const tickets = await queueEngine.listTickets({
        branchId: branchId as string | undefined,
        status: status as string | undefined,
        today: today === 'true',
        limit: limit ? parseInt(limit as string, 10) : 50,
      });
      res.json({ success: true, data: tickets });
    } catch (error) {
      next(error);
    }
  });

  // GET /api/v1/queue/tickets/:ticketId — Full context for Mini App polling
  router.get('/tickets/:ticketId', async (req, res, next) => {
    try {
      const { ticketId } = req.params;
      const ticket = await queueEngine.getTicketWithContext(ticketId);
      if (!ticket) {
        return res.status(404).json({
          success: false,
          error: {
            code: 'VÉ_KHÔNG_TỒN_TẠI',
            message: 'Không tìm thấy thông tin vé bốc số',
          },
        });
      }
      res.json({ success: true, data: ticket });
    } catch (error) {
      next(error);
    }
  });

  // POST /api/v1/queue/call-next — Counter staff calls next (manual override)
  router.post('/call-next', authenticate, validateBody(CallNextTicketSchema), async (req, res, next) => {
    try {
      const { branchId, counterId, serviceType } = req.body;
      const ticket = await queueEngine.callNext(branchId, counterId, serviceType);
      res.json({ success: true, data: ticket });
    } catch (error) {
      next(error);
    }
  });

  // POST /api/v1/queue/complete — Staff marks ticket done + triggers 30s cooldown before auto-call
  router.post('/complete', authenticate, validateBody(CompleteTicketSchema), async (req, res, next) => {
    try {
      const { ticketId, counterId } = req.body;
      const completed = await queueEngine.complete(ticketId, counterId);
      // Cooldown da duoc dat trong queueEngine.complete()
      res.json({
        success: completed,
        data: {
          completed,
          cooldownSeconds: 30,
          // Bao admin biet khi nao auto-call se kich hoat
          autoCallAfter: new Date(Date.now() + 30_000).toISOString(),
        },
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
      // Kem theo trang thai gio lam viec
      res.json({ success: true, data: overview });
    } catch (error) {
      next(error);
    }
  });

  // === COUNTER STATUS MANAGEMENT ===

  // GET /api/v1/queue/counters/status — Lay trang thai tat ca quay (Admin + Mini App)
  router.get('/counters/status', async (_req, res) => {
    const statuses = queueEngine.getAllCounterStatuses();
    res.json({ success: true, data: statuses });
  });

  // PATCH /api/v1/queue/counters/:counterId/status — Admin dat trang thai quay
  router.patch('/counters/:counterId/status', authenticate, async (req: AuthenticatedRequest, res, next) => {
    try {
      const { counterId } = req.params;
      const { status, pauseNote } = req.body as {
        status: 'OPEN' | 'PAUSED' | 'CLOSED';
        pauseNote?: string;
      };

      if (!['OPEN', 'PAUSED', 'CLOSED'].includes(status)) {
        return res.status(400).json({
          success: false,
          error: { code: 'INVALID_STATUS', message: 'Trạng thái không hợp lệ. Dùng: OPEN | PAUSED | CLOSED' },
        });
      }

      queueEngine.setCounterStatus(counterId, status, pauseNote);
      const updated = queueEngine.getCounterStatus(counterId);

      res.json({
        success: true,
        data: {
          counterId,
          ...updated,
          message:
            status === 'OPEN'
              ? 'Quầy đã mở — sẵn sàng tiếp khách'
              : status === 'PAUSED'
                ? `Quầy tạm nghỉ${pauseNote ? `: ${pauseNote}` : ''}. Hàng đợi được giữ nguyên.`
                : 'Quầy đã đóng. Số vé vẫn hợp lệ cho ngày làm việc tiếp theo.',
        },
      });
    } catch (error) {
      next(error);
    }
  });

  return router;
}
