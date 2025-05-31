const express = require('express');
const router = express.Router();
const TimeEntry = require('../models/TimeEntry');
const auth = require('../middlewares/auth');
const ActivityLogger = require('../utils/activityLogger');

// Start a new timer
router.post('/start', auth, async (req, res) => {
  try {
    const { taskId, description } = req.body;
    if (!taskId) {
      return res.status(400).json({ error: 'Task ID is required' });
    }

    const timeEntry = await TimeEntry.create({
      taskId,
      userId: req.user.id,
      startTime: new Date(),
      description
    });

    // Log the activity
    await ActivityLogger.logTaskActivity(
      taskId,
      req.user.id,
      'start_timer',
      null,
      { time_entry_id: timeEntry.id }
    );

    res.status(201).json(timeEntry);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Stop a running timer
router.post('/stop/:id', auth, async (req, res) => {
  try {
    const timeEntry = await TimeEntry.stopTimer(req.params.id, req.user.id);

    // Log the activity
    await ActivityLogger.logTaskActivity(
      timeEntry.task_id,
      req.user.id,
      'stop_timer',
      null,
      { time_entry_id: timeEntry.id, duration: timeEntry.duration }
    );

    res.json(timeEntry);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get running timer
router.get('/running', auth, async (req, res) => {
  try {
    const timer = await TimeEntry.getRunningTimer(req.user.id);
    res.json(timer);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get time entries for a task
router.get('/task/:taskId', auth, async (req, res) => {
  try {
    const entries = await TimeEntry.getTaskTimeEntries(req.params.taskId, req.user.id);
    res.json(entries);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get user's time entries
router.get('/user', auth, async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    if (!startDate || !endDate) {
      return res.status(400).json({ error: 'Start date and end date are required' });
    }

    const entries = await TimeEntry.getUserTimeEntries(req.user.id, startDate, endDate);
    res.json(entries);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get time summary
router.get('/summary', auth, async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    if (!startDate || !endDate) {
      return res.status(400).json({ error: 'Start date and end date are required' });
    }

    const summary = await TimeEntry.getTimeSummary(req.user.id, startDate, endDate);
    res.json(summary);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update time entry
router.put('/:id', auth, async (req, res) => {
  try {
    const { description } = req.body;
    const timeEntry = await TimeEntry.update(req.params.id, req.user.id, { description });

    // Log the activity
    await ActivityLogger.logTaskActivity(
      timeEntry.task_id,
      req.user.id,
      'update_time_entry',
      null,
      { time_entry_id: timeEntry.id }
    );

    res.json(timeEntry);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete time entry
router.delete('/:id', auth, async (req, res) => {
  try {
    const timeEntry = await TimeEntry.findById(req.params.id);
    if (!timeEntry) {
      return res.status(404).json({ error: 'Time entry not found' });
    }

    const deletedEntry = await TimeEntry.delete(req.params.id, req.user.id);

    // Log the activity
    await ActivityLogger.logTaskActivity(
      timeEntry.task_id,
      req.user.id,
      'delete_time_entry',
      { time_entry_id: timeEntry.id, duration: timeEntry.duration },
      null
    );

    res.json(deletedEntry);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router; 