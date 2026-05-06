const { DataTypes } = require('sequelize');
const sequelize = require('./db');

const QuestionStatus = sequelize.define('QuestionStatus', {
  user_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    allowNull: false,
    defaultValue: 1,
    field: 'user_id'
  },
  question_id: {
    type: DataTypes.STRING,
    primaryKey: true,
    allowNull: false,
    field: 'question_id'
  },
  status: {
    type: DataTypes.ENUM('needs_review', 'done'),
    defaultValue: 'needs_review',
    allowNull: false,
    field: 'status'
  },
  user_code: {
    type: DataTypes.TEXT,
    allowNull: true,
    field: 'user_code'
  },
  updatedAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
    field: 'updatedAt'
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
