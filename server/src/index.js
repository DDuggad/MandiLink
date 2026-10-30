import dotenv from 'dotenv';
dotenv.config();

import app from './app.js';
import { connectDB } from './config/db.js';

const PORT = process.env.PORT || 5000;

async function startServer() {
  // Connect to MongoDB — server boots even if DB is unavailable (fallback mode)
  await connectDB();

  app.listen(PORT, () => {
    console.log(`\n🚀 MandiLink API running at http://localhost:${PORT}`);
    console.log(`   Health: http://localhost:${PORT}/api/health`);
    console.log(
      `   CORS:   ${process.env.CLIENT_ORIGIN || 'http://localhost:5173'}, ${process.env.ADMIN_ORIGIN || 'http://localhost:5174'}\n`
    );
  });
}

startServer();
