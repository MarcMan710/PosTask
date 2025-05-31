const express = require('express');
const router = express.Router();
const gamificationController = require('../controllers/gamificationController');
const auth = require('../middlewares/auth');

// Get user's progress and achievements
router.get('/progress', auth, gamificationController.getUserProgress);

// Get leaderboard
router.get('/leaderboard', auth, gamificationController.getLeaderboard);

// Update task completion progress
router.post('/task-progress', auth, gamificationController.updateTaskProgress);

// Update streak
router.post('/streak', auth, gamificationController.updateStreak);

module.exports = router; 