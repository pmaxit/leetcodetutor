const { DataTypes } = require('sequelize');
const sequelize = require('./db');

const PracticeSession = sequelize.define('PracticeSession', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  sessionName: {
    type: DataTypes.STRING,
    allowNull: true,
    field: 'session_name'
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    field: 'user_id'
  },
  newPerDay: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 2
  },
  pastPerDay: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 3
  },
  schedule: {
    type: DataTypes.JSON,
    allowNull: false
  },
  progress: {
    type: DataTypes.JSON,
    defaultValue: {}
  },
  createdAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  updatedAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'practice_sessions',
  timestamps: true
});

module.exports = { PracticeSession };
