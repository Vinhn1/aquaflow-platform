import { Router } from 'express';
import { CreateComplaintSchema, UpdateComplaintStatusSchema } from '@aquaflow/validation';
import { validateBody } from '../middlewares/validate.middleware.js';
import { authenticate, AuthenticatedRequest } from '../middlewares/auth.middleware.js';
import { ComplaintService } from '../services/ComplaintService.js';

export function createComplaintRouter(complaintService: ComplaintService): Router {
  const router = Router();

  // POST /api/v1/complaints
  router.post('/', authenticate, validateBody(CreateComplaintSchema), async (req: AuthenticatedRequest, res, next) => {
    try {
      const userId = req.user?.id || 'usr-zalo-8891';
      const { category, description, latitude, longitude, address, imageUrls } = req.body;
      const complaint = await complaintService.createComplaint({
        userId,
        category,
        description,
        latitude,
        longitude,
        address,
        imageUrls,
      });
      res.status(201).json({
        success: true,
        data: complaint,
      });
    } catch (error) {
      next(error);
    }
  });

  // GET /api/v1/complaints/my
  router.get('/my', authenticate, async (req: AuthenticatedRequest, res, next) => {
    try {
      const userId = req.user?.id || 'usr-zalo-8891';
      const list = await complaintService.getCitizenComplaints(userId);
      res.json({
        success: true,
        data: list,
      });
    } catch (error) {
      next(error);
    }
  });

  // GET /api/v1/complaints (Admin list)
  router.get('/', authenticate, async (req, res, next) => {
    try {
      const list = await complaintService.getAllComplaints();
      res.json({
        success: true,
        data: list,
      });
    } catch (error) {
      next(error);
    }
  });

  // PATCH /api/v1/complaints/:id/status
  router.patch('/:id/status', authenticate, validateBody(UpdateComplaintStatusSchema), async (req, res, next) => {
    try {
      const { id } = req.params;
      const { status } = req.body;
      const updated = await complaintService.updateStatus(id, status);
      if (!updated) {
        return res.status(404).json({
          success: false,
          error: {
            code: 'SỰ_CỐ_KHÔNG_TỒN_TẠI',
            message: 'Không tìm thấy thông tin phản ánh sự cố',
          },
        });
      }
      res.json({
        success: true,
        data: updated,
      });
    } catch (error) {
      next(error);
    }
  });

  return router;
}
