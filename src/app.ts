import Fastify from 'fastify';
import websocket from '@fastify/websocket';
import cors from '@fastify/cors'; 
import { apiRoutes } from './api/routes';
import { websocketRoutes } from './api/websocket';
import './services/queue/worker'; 

const fastify = Fastify({ logger: true });

const start = async () => {
  // 1. Register CORS first (This fixes the OPTIONS 404 error)
  await fastify.register(cors, { 
    origin: '*', // Allow connections from ANY browser/file
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS']
  });

  // 2. Register other plugins
  await fastify.register(websocket);
  await fastify.register(apiRoutes, { prefix: '/api' });
  await fastify.register(websocketRoutes);

  try {
    await fastify.listen({ port: 3000, host: '0.0.0.0' });
    console.log('🚀 Engine running on port 3000');
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};
start();