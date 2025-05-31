const express = require('express');
const cors = require('cors');
const cron = require('node-cron');
const swaggerUi = require('swagger-ui-express');
const notificationService = require('./services/notificationService');
const { handleError } = require('./utils/errorHandler');
const logger = require('./utils/logger');
const { limiter } = require('./middlewares/rateLimiter');
const swaggerSpecs = require('./utils/swagger');
const path = require('path');
const fs = require('fs');
const swaggerJsDoc = require('swagger-jsdoc');
const { AppError } = require('./utils/errors');

const taskRoutes = require('./routes/taskRoutes');
const authRoutes = require('./routes/authRoutes');
const projectRoutes = require('./routes/projectRoutes');
const tagRoutes = require('./routes/tagRoutes');
const projectMemberRoutes = require('./routes/projectMembers');
const commentRoutes = require('./routes/commentRoutes');
const activityRoutes = require('./routes/activityRoutes');
const attachmentRoutes = require('./routes/attachmentRoutes');
const analyticsRoutes = require('./routes/analyticsRoutes');
const timeEntryRoutes = require('./routes/timeEntryRoutes');
const notificationRoutes = require('./routes/notifications');
const integrationRoutes = require('./routes/integrationRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// Ensure required environment variables are set
const requiredEnvVars = ['JWT_SECRET', 'DATABASE_URL'];
const missingEnvVars = requiredEnvVars.filter(envVar => !process.env[envVar]);

if (missingEnvVars.length > 0) {
  logger.error(`Missing required environment variables: ${missingEnvVars.join(', ')}`);
  process.exit(1);
}

// Middleware
app.use(cors());
app.use(express.json());
app.use(limiter); // Apply rate limiting to all routes

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir);
}

// Serve uploaded files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// API Documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpecs));

// Routes
app.use('/api/v1/tasks', taskRoutes);
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/projects', projectRoutes);
app.use('/api/v1/projects', projectMemberRoutes);
app.use('/api/v1/tags', tagRoutes);
app.use('/api/v1/comments', commentRoutes);
app.use('/api/v1/activity', activityRoutes);
app.use('/api/v1/attachments', attachmentRoutes);
app.use('/api/v1/analytics', analyticsRoutes);
app.use('/api/v1/time-entries', timeEntryRoutes);
app.use('/api/v1/notifications', notificationRoutes);
app.use('/api/v1/integrations', integrationRoutes);

// Schedule notification processing every minute
cron.schedule('* * * * *', async () => {
  try {
    await notificationService.processPendingNotifications();
  } catch (error) {
    logger.error('Error processing notifications:', error);
  }
});

// 404 handler
app.use((req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

// Global error handler
app.use((err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  if (process.env.NODE_ENV === 'development') {
    res.status(err.statusCode).json({
      status: err.status,
      error: err,
      message: err.message,
      stack: err.stack,
      ...(err.errors && { errors: err.errors })
    });
  } else {
    // Production mode
    if (err.isOperational) {
      res.status(err.statusCode).json({
        status: err.status,
        message: err.message,
        ...(err.errors && { errors: err.errors })
      });
    } else {
      // Programming or unknown errors
      logger.error('ERROR 💥', err);
      res.status(500).json({
        status: 'error',
        message: 'Something went wrong!'
      });
    }
  }
});

// Start server
app.listen(PORT, () => {
  logger.info(`Server is running on port ${PORT}`);
  logger.info(`API Documentation available at http://localhost:${PORT}/api-docs`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', err => {
  logger.error('UNHANDLED REJECTION! 💥 Shutting down...');
  logger.error(err.name, err.message);
  process.exit(1);
});

// Handle uncaught exceptions
process.on('uncaughtException', err => {
  logger.error('UNCAUGHT EXCEPTION! 💥 Shutting down...');
  logger.error(err.name, err.message);
  process.exit(1);
});
