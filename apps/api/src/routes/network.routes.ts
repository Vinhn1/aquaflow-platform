import { Router } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export function createNetworkRouter(): Router {
  const router = Router();

  // GET /api/v1/network/nodes (Lay danh sach ha tang GIS & diem su co/bao tri)
  router.get('/nodes', async (req, res, next) => {
    try {
      const { nodeType, status } = req.query;

      const where: any = {};
      if (nodeType && nodeType !== 'ALL') {
        where.nodeType = String(nodeType);
      }
      if (status && status !== 'ALL') {
        where.status = String(status);
      }

      const nodes = await prisma.waterNetworkNode.findMany({
        where,
        orderBy: { code: 'asc' },
      });

      res.json({
        success: true,
        data: nodes,
      });
    } catch (error) {
      next(error);
    }
  });

  return router;
}
