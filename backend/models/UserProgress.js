const { DataTypes } = require('sequelize');
const sequelize = require('../db');
const User = require('./User');
const Achievement = require('./Achievement');

const UserProgress = sequelize.define('UserProgress', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: User,
      key: 'id'
    }
  },
  achievementId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: Achievement,
      key: 'id'
    }
  },
  progress: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  completed: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  completedAt: {
    type: DataTypes.DATE
  },
  currentStreak: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  longestStreak: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  lastCompletedDate: {
    type: DataTypes.DATE
  },
  totalPoints: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  }
});

// Create associations
UserProgress.belongsTo(User, { foreignKey: 'userId' });
UserProgress.belongsTo(Achievement, { foreignKey: 'achievementId' });

module.exports = UserProgress; 