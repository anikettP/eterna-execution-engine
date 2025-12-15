import { FastifyInstance } from 'fastify';
import { Queue } from 'bullmq';
import { PrismaClient } from '@prisma/client';
import IORedis from 'ioredis';

const connection = new IORedis({ host: 'localhost', port: 6379, maxRetriesPerRequest: null });
const prisma = new PrismaClient();

const orderQueue = new Queue('order-execution', {
  connection,
  defaultJobOptions: {
    attempts: 3, 
    backoff: { type: 'exponential', delay: 1000 }
  }
});

export async function apiRoutes(fastify: FastifyInstance) {
  fastify.post('/orders/execute', async (req, reply) => {
    const { pair, amount, side } = req.body as any;
    
    // Create DB Record
    const order = await prisma.order.create({
      data: { pair, amount, side, status: 'pending' }
    });

    // Add to Queue
    await orderQueue.add('swap', { orderId: order.id, pair, amount }, { jobId: order.id });

    return { 
      orderId: order.id, 
      message: 'Order queued. Connect to WS for updates.' 
    };
  });
}