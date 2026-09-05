import { Router } from 'express';
import { prisma } from '../lib/prisma.js';
import { ComplaintStatus, RegistrationStatus, TicketStatus } from '@prisma/client';

export function createAdminStatsRouter(): Router {
  const router = Router();

  // GET /api/v1/admin/stats/sidebar-counts
  router.get('/sidebar-counts', async (req, res) => {
    try {
      // 1. Dem so ve cho phuc vu tai quay/online
      let queueWaiting = 0;
      try {
        queueWaiting = await prisma.queueTicket.count({
          where: {
            status: TicketStatus.WAITING,
          },
        });
      } catch {
        queueWaiting = 0;
      }

      // 2. Dem su co nuoc can xu ly
      let complaintsPending = 0;
      try {
        complaintsPending = await prisma.complaint.count({
          where: {
            status: {
              in: [
                ComplaintStatus.SUBMITTED,
                ComplaintStatus.RECEIVED,
                ComplaintStatus.DISPATCHED,
                ComplaintStatus.IN_PROGRESS,
              ],
            },
          },
        });
      } catch {
        complaintsPending = 0;
      }

      // 3. Dem ho so dang ky lap moi can tham dinh
      let registrationsPending = 0;
      try {
        registrationsPending = await prisma.waterRegistration.count({
          where: {
            status: {
              in: [
                RegistrationStatus.SUBMITTED,
                RegistrationStatus.DOCS_APPROVED,
                RegistrationStatus.SURVEYING,
              ],
            },
          },
        });
      } catch {
        registrationsPending = 0;
      }

      // 4. Dem lich cup nuoc dang hoat dong
      let activeOutages = 0;
      try {
        activeOutages = await prisma.news.count({
          where: {
            isPublished: true,
            isOutageAlert: true,
          },
        });
      } catch {
        activeOutages = 0;
      }

      // 5. Dem can bo nhan vien dang truc/hoat dong
      let activeStaff = 0;
      try {
        activeStaff = await prisma.user.count({
          where: {
            role: {
              in: ['SUPER_ADMIN', 'BRANCH_MANAGER', 'COUNTER_STAFF', 'FIELD_WORKER'],
            },
          },
        });
      } catch {
        activeStaff = 0;
      }

      return res.json({
        success: true,
        data: {
          queueWaiting,
          complaintsPending,
          registrationsPending,
          activeOutages,
          activeStaff,
          timestamp: new Date().toISOString(),
        },
      });
    } catch (error: any) {
      return res.status(200).json({
        success: true,
        data: {
          queueWaiting: 0,
          complaintsPending: 0,
          registrationsPending: 0,
          activeOutages: 0,
          activeStaff: 0,
          timestamp: new Date().toISOString(),
        },
      });
    }
  });

  return router;
}
