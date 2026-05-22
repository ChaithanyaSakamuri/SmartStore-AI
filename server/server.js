import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from './config/database.js';
import errorHandler from './middleware/errorHandler.js';
import authRoutes from './routes/auth.js';
import productRoutes from './routes/products.js';
import dashboardRoutes from './routes/dashboard.js';
import aiRoutes from './routes/ai.js';

dotenv.config();

const app = express();

// Connect to database
await connectDB();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors({ origin: process.env.CORS_ORIGIN || '*' }));

// Routes
app.get('/api/health', (req, res) => {
  res.json({ message: 'Server is running', timestamp: new Date() });
});

app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/ai', aiRoutes);

// Error handling
app.use(errorHandler);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

const PORT = parseInt(process.env.PORT, 10) || 5000;

const startServer = (port) => {
  const server = app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
  });

  server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      console.warn(`Port ${port} is in use. Trying port ${port + 1}...`);
      startServer(port + 1);
      return;
    }
    console.error(err);
    process.exit(1);
  });
};

startServer(PORT);
