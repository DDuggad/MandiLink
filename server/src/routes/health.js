import express from 'express';
import mongoose from 'mongoose';

const router = express.Router();

router.get('/', (req, res) => {
  const dbStatus =
    mongoose.connection.readyState === 1 ? 'connected' : 'disconnected/mock-mode';
  res.json({
    status: 'ok',
    service: 'mandilink-server',
    timestamp: new Date().toISOString(),
    uptimeSeconds: Math.round(process.uptime()),
    database: dbStatus,
  });
});

export default router;
