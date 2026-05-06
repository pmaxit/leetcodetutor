const { DataTypes } = require('sequelize');
const sequelize = require('./db');

const QuestionStatus = sequelize.define('QuestionStatus', {
  userId: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    allowNull: false,
    defaultValue: 1
  },
  question_id: {
    type: DataTypes.STRING,
    primaryKey: true,
    allowNull: false
  },
  status: {
    type: DataTypes.ENUM('needs_review', 'done'),
    defaultValue: 'needs_review',
    allowNull: false
  },
  user_code: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  updatedAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'question_status',
  timestamps: false,
  createdAt: false
});

// Sync the model with the database
(async () => {
  try {
    await sequelize.sync({ alter: true });
  } catch (err) {
    console.error('Error syncing QuestionStatus model:', err);
  }
})();

module.exports = { QuestionStatus };
