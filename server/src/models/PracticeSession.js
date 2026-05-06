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
    allowNull: false,
    unique: true
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: true
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

// Sync the model with the database
(async () => {
  try {
    await sequelize.sync({ alter: false });
  } catch (err) {
    console.error('Error syncing PracticeSession model:', err);
  }
})();

module.exports = { PracticeSession };
