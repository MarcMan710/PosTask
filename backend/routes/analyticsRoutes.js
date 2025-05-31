const express = require('express');
const router = express.Router();
const Analytics = require('../models/Analytics');
const auth = require('../middlewares/auth');

// Get dashboard statistics
router.get('/dashboard', auth, async (req, res) => {
  try {
    const stats = await Analytics.getDashboardStats(req.user.id);
    res.json(stats);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get user productivity trends
router.get('/productivity', auth, async (req, res) => {
  try {
    const { days = 30 } = req.query;
    const trends = await Analytics.getProductivityTrends(req.user.id, parseInt(days));
    res.json(trends);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get user analytics for a date range
router.get('/user/:userId', auth, async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    if (!startDate || !endDate) {
      return res.status(400).json({ error: 'Start date and end date are required' });
    }
    const analytics = await Analytics.getUserAnalytics(req.params.userId, startDate, endDate);
    res.json(analytics);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get project analytics for a date range
router.get('/project/:projectId', auth, async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    if (!startDate || !endDate) {
      return res.status(400).json({ error: 'Start date and end date are required' });
    }
    const analytics = await Analytics.getProjectAnalytics(req.params.projectId, startDate, endDate);
    res.json(analytics);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update task analytics
router.post('/tasks/:taskId', auth, async (req, res) => {
  try {
    const analytics = await Analytics.updateTaskAnalytics(
      req.params.taskId,
      req.user.id,
      req.body
    );
    res.json(analytics);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update user analytics
router.post('/user', auth, async (req, res) => {
  try {
    const { date, ...data } = req.body;
    if (!date) {
      return res.status(400).json({ error: 'Date is required' });
    }
    const analytics = await Analytics.updateUserAnalytics(req.user.id, date, data);
    res.json(analytics);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update project analytics
router.post('/project/:projectId', auth, async (req, res) => {
  try {
    const { date, ...data } = req.body;
    if (!date) {
      return res.status(400).json({ error: 'Date is required' });
    }
    const analytics = await Analytics.updateProjectAnalytics(
      req.params.projectId,
      date,
      data
    );
    res.json(analytics);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router; 