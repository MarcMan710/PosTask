const Achievement = require('../models/Achievement');
const UserProgress = require('../models/UserProgress');
const { Op } = require('sequelize');

class GamificationService {
  async initializeUserProgress(userId) {
    const achievements = await Achievement.findAll({ where: { isActive: true } });
    const progressRecords = achievements.map(achievement => ({
      userId,
      achievementId: achievement.id,
      progress: 0,
      completed: false
    }));
    await UserProgress.bulkCreate(progressRecords);
  }

  async updateTaskCompletionProgress(userId) {
    const achievement = await Achievement.findOne({
      where: { type: 'task_completion', isActive: true }
    });

    if (!achievement) return null;

    const [progress] = await UserProgress.findOrCreate({
      where: { userId, achievementId: achievement.id },
      defaults: { progress: 0 }
    });

    progress.progress += 1;
    
    if (progress.progress >= achievement.requirement && !progress.completed) {
      progress.completed = true;
      progress.completedAt = new Date();
      progress.totalPoints += achievement.points;
    }

    await progress.save();
    return progress;
  }

  async updateStreak(userId) {
    const achievement = await Achievement.findOne({
      where: { type: 'streak', isActive: true }
    });

    if (!achievement) return null;

    const [progress] = await UserProgress.findOrCreate({
      where: { userId, achievementId: achievement.id },
      defaults: { progress: 0 }
    });

    const today = new Date();
    const lastCompleted = progress.lastCompletedDate;

    if (lastCompleted) {
      const daysSinceLastCompletion = Math.floor(
        (today - new Date(lastCompleted)) / (1000 * 60 * 60 * 24)
      );

      if (daysSinceLastCompletion === 1) {
        // Streak continues
        progress.currentStreak += 1;
        progress.progress += 1;
      } else if (daysSinceLastCompletion > 1) {
        // Streak broken
        progress.currentStreak = 1;
        progress.progress = 1;
      }
    } else {
      // First completion
      progress.currentStreak = 1;
      progress.progress = 1;
    }

    progress.lastCompletedDate = today;
    
    if (progress.currentStreak > progress.longestStreak) {
      progress.longestStreak = progress.currentStreak;
    }

    if (progress.progress >= achievement.requirement && !progress.completed) {
      progress.completed = true;
      progress.completedAt = new Date();
      progress.totalPoints += achievement.points;
    }

    await progress.save();
    return progress;
  }

  async getUserProgress(userId) {
    const progress = await UserProgress.findAll({
      where: { userId },
      include: [{
        model: Achievement,
        attributes: ['name', 'description', 'icon', 'points', 'type', 'requirement']
      }],
      order: [['completedAt', 'DESC']]
    });

    const totalPoints = progress.reduce((sum, p) => sum + p.totalPoints, 0);
    const completedAchievements = progress.filter(p => p.completed).length;
    const currentStreak = progress.find(p => p.Achievement.type === 'streak')?.currentStreak || 0;
    const longestStreak = progress.find(p => p.Achievement.type === 'streak')?.longestStreak || 0;

    return {
      progress,
      stats: {
        totalPoints,
        completedAchievements,
        currentStreak,
        longestStreak
      }
    };
  }

  async getLeaderboard() {
    const leaderboard = await UserProgress.findAll({
      attributes: [
        'userId',
        [sequelize.fn('SUM', sequelize.col('totalPoints')), 'totalPoints'],
        [sequelize.fn('COUNT', sequelize.col('completed')), 'achievementsCompleted']
      ],
      where: { completed: true },
      group: ['userId'],
      order: [[sequelize.literal('totalPoints'), 'DESC']],
      limit: 10
    });

    return leaderboard;
  }
}

module.exports = new GamificationService(); 