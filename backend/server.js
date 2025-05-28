const express = require('express');
const cors = require('cors');
const cron = require('node-cron');
const swaggerUi = require('swagger-ui-express');
const notificationService = require('./services/notificationService');
const { handleError } = require('./utils/errorHandler');
const logger = require('./utils/logger');
const { limiter } = require('./middlewares/rateLimiter');
const swaggerSpecs = require('./utils/swagger');
require('dotenv').config();

const taskRoutes = require('./routes/taskRoutes');
const authRoutes = require('./routes/authRoutes');
const projectRoutes = require('./routes/projectRoutes');
const tagRoutes = require('./routes/tagRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// Ensure JWT_SECRET is set
if (!process.env.JWT_SECRET) {
  logger.error('JWT_SECRET is not set in environment variables');
  process.exit(1);
}

// Middleware
app.use(cors());
app.use(express.json());
app.use(limiter); // Apply rate limiting to all routes

// API Documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpecs));

// Routes
app.use('/api/tasks', taskRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/tags', tagRoutes);
app.use('/api/notifications', require('./routes/notifications'));

// Schedule notification processing every minute
cron.schedule('* * * * *', async () => {
  try {
    await notificationService.processPendingNotifications();
  } catch (error) {
    logger.error('Error processing notifications:', error);
  }
});

// Error handling middleware
app.use(handleError);

// Start server
app.listen(PORT, () => {
  logger.info(`Server is running on port ${PORT}`);
  logger.info(`API Documentation available at http://localhost:${PORT}/api-docs`);
});
