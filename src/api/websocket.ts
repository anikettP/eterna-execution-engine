import { FastifyInstance } from 'fastify';
import { WebSocket } from 'ws';

// In-memory store for active connections
const activeConnections = new Map<string, WebSocket>();

export const notifyClient = (orderId: string, payload: any) => {
  const socket = activeConnections.get(orderId);
  if (socket && socket.readyState === WebSocket.OPEN) {
    socket.send(JSON.stringify(payload));
  }
};

export async function websocketRoutes(fastify: FastifyInstance) {
  // We use 'any' here to bypass the strict type check on the connection wrapper
  fastify.get('/ws/orders/:orderId', { websocket: true }, (connection: any, req: any) => {
    const { orderId } = req.params as { orderId: string };
    
    activeConnections.set(orderId, connection.socket);
    fastify.log.info(`WS Connected: ${orderId}`);

    connection.socket.on('close', () => activeConnections.delete(orderId));
    
    // Initial handshake
    connection.socket.send(JSON.stringify({ status: 'connected', orderId }));
  });
}