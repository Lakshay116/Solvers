import app from './app.js';
import dotenv from 'dotenv';
import pool from './config/db.js';
import http from 'http';
import { setupSocket } from './config/socket.js';

dotenv.config();

const PORT = process.env.PORT || 5000;

// Create HTTP Server
const server = http.createServer(app);

// Setup Socket.IO
setupSocket(server);

const startServer = async () => {
  try {
    // Check database connection
    const client = await pool.connect();
    client.release();
    console.log('Database connection verified.');

    server.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
    
    // Graceful shutdown to fix EADDRINUSE with nodemon on Windows
    const shutdown = () => {
      console.log('Shutting down server...');
      server.close(() => {
        console.log('HTTP server closed.');
        process.exit(0);
      });
      // Force close if it takes too long
      setTimeout(() => process.exit(1), 5000);
    };

    process.once('SIGUSR2', shutdown); // nodemon restart signal
    process.once('SIGINT', shutdown);
    process.once('SIGTERM', shutdown);

  } catch (error) {
    console.error('Failed to start server:', error.message);
    process.exit(1);
  }
};

startServer();
