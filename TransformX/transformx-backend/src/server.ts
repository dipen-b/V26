import 'dotenv/config';
import app from './app';
import { initializeDatabase } from './config/database';
import { initializeRedis } from './config/redis';

const PORT = process.env.PORT || 5000;

async function startServer() {
  try {
    // Initialize database
    console.log('Initializing database...');
    await initializeDatabase();
    console.log('✓ Database connected');

    // Initialize Redis
    console.log('Initializing Redis...');
    await initializeRedis();
    console.log('✓ Redis connected');

    // Start server
    app.listen(PORT, () => {
      console.log(`✓ Server running on http://localhost:${PORT}`);
      console.log(`✓ Environment: ${process.env.NODE_ENV}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();
