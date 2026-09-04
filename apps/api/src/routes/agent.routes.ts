import { Router } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export function createAgentRouter(): Router {
  const router = Router();

  // GET /api/v1/agents (Danh sach dai ly thu ho)
  router.get('/', async (req, res, next) => {
    try {
      const { district, agentType, search } = req.query;

      const where: any = { isActive: true };

      if (district && district !== 'ALL') {
        where.district = String(district);
      }

      if (agentType && agentType !== 'ALL') {
        where.agentType = String(agentType);
      }

      if (search) {
        where.OR = [
          { name: { contains: String(search), mode: 'insensitive' } },
          { address: { contains: String(search), mode: 'insensitive' } },
        ];
      }

      const agents = await prisma.paymentAgent.findMany({
        where,
        orderBy: { name: 'asc' },
      });

      res.json({
        success: true,
        data: agents,
      });
    } catch (error) {
      next(error);
    }
  });

  return router;
}
