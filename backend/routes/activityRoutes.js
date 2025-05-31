const express = require('express');
const router = express.Router();
const ActivityLog = require('../models/ActivityLog');
const auth = require('../middlewares/auth');

// Get recent activity across all entities
router.get('/recent', auth, async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 50;
    const activity = await ActivityLog.getRecentActivity(limit);
    res.json(activity);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get activity for a specific entity
router.get('/entity/:entityType/:entityId', auth, async (req, res) => {
  try {
    const activity = await ActivityLog.findByEntity(req.params.entityType, req.params.entityId);
    res.json(activity);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get activity for the current user
router.get('/user', auth, async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 50;
    const activity = await ActivityLog.findByUser(req.user.id, limit);
    res.json(activity);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get activity for a specific project (including tasks and comments)
router.get('/project/:projectId', auth, async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 50;
    const activity = await ActivityLog.findByProject(req.params.projectId, limit);
    res.json(activity);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get activity summary for an entity
router.get('/summary/:entityType/:entityId', auth, async (req, res) => {
  try {
    const summary = await ActivityLog.getActivitySummary(req.params.entityType, req.params.entityId);
    res.json(summary);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get activity timeline
router.get('/timeline', auth, async (req, res) => {
  try {
    const { startDate, endDate, entityType } = req.query;
    if (!startDate || !endDate) {
      return res.status(400).json({ error: 'startDate and endDate are required' });
    }
    const timeline = await ActivityLog.getActivityTimeline(startDate, endDate, entityType);
    res.json(timeline);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router; 