const gamificationService = require('../services/gamificationService');

class GamificationController {
  async getUserProgress(req, res) {
    try {
      const userId = req.user.id;
      const progress = await gamificationService.getUserProgress(userId);
      res.json(progress);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async getLeaderboard(req, res) {
    try {
      const leaderboard = await gamificationService.getLeaderboard();
      res.json(leaderboard);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async updateTaskProgress(req, res) {
    try {
      const userId = req.user.id;
      const progress = await gamificationService.updateTaskCompletionProgress(userId);
      res.json(progress);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async updateStreak(req, res) {
    try {
      const userId = req.user.id;
      const progress = await gamificationService.updateStreak(userId);
      res.json(progress);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
}

module.exports = new GamificationController(); 