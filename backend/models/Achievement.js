const { DataTypes } = require('sequelize');
const sequelize = require('../db');

const Achievement = sequelize.define('Achievement', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  icon: {
    type: DataTypes.STRING,
    allowNull: false
  },
  points: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0
  },
  type: {
    type: DataTypes.ENUM('task_completion', 'streak', 'project_completion', 'special'),
    allowNull: false
  },
  requirement: {
    type: DataTypes.INTEGER,
    allowNull: false,
    comment: 'Number of times the action needs to be performed to earn the achievement'
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  }
});

module.exports = Achievement; 