import { Worker, Job } from 'bullmq';
import { MockRouter } from '../dex/MockRouter';
import { notifyClient } from '../../api/websocket';
import { PrismaClient } from '@prisma/client';
import IORedis from 'ioredis';

const prisma = new PrismaClient();
const router = new MockRouter();
const connection = new IORedis({ host: 'localhost', port: 6379, maxRetriesPerRequest: null });

export const orderWorker = new Worker('order-execution', async (job: Job) => {
  const { orderId, pair, amount } = job.data;
  
  try {
    // 1. ROUTING
    await updateStatus(orderId, 'routing', { message: 'Fetching quotes...' });
    const quotes = await router.getQuotes(pair, amount);
    
    // Find best price (Buy: Lowest | Sell: Highest). Assuming BUY for demo.
    const bestRoute = quotes.reduce((prev, curr) => curr.price < prev.price ? curr : prev);
    
    await updateStatus(orderId, 'routing', { 
      message: `Best Route: ${bestRoute.dex} @ $${bestRoute.price.toFixed(2)}` 
    });

    // 2. BUILDING -> SUBMITTED
    await updateStatus(orderId, 'building', { message: 'Constructing transaction...' });
    await new Promise(r => setTimeout(r, 500)); // Visual delay
    await updateStatus(orderId, 'submitted', { message: 'Sent to Solana network' });

    // 3. EXECUTION
    const result = await router.executeSwap(bestRoute.dex, orderId);

    // 4. CONFIRMED
    await updateStatus(orderId, 'confirmed', { 
      txHash: result.txHash,
      dex: bestRoute.dex,
      price: bestRoute.price
    });

  } catch (error: any) {
    await updateStatus(orderId, 'failed', { error: error.message });
    throw error;
  }
}, {
  connection,
  concurrency: 10,
  limiter: { max: 100, duration: 60000 }
});

async function updateStatus(orderId: string, status: string, data: any) {
  // Update DB
  await prisma.order.update({
    where: { id: orderId },
    data: { 
      status,
      ...(data.txHash && { txHash: data.txHash }),
      ...(data.price && { price: data.price }),
      ...(data.dex && { dex: data.dex })
    }
  });
  // Notify WS
  notifyClient(orderId, { status, ...data });
}