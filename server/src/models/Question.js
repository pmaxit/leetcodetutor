const { DataTypes } = require('sequelize');
const sequelize = require('./db');

const Question = sequelize.define('Question', {
  title: { type: DataTypes.STRING, allowNull: false },
  category: { type: DataTypes.STRING, allowNull: true },
  statement: { 
    type: DataTypes.TEXT, 
    allowNull: true,
    get() { return this.getDataValue('statement'); }
  },
  description: { 
    type: DataTypes.VIRTUAL,
    get() { return this.statement || this.getDataValue('description'); }
  },
  pattern: { 
    type: DataTypes.VIRTUAL,
    get() { return this.category || this.getDataValue('pattern'); }
  },
  difficulty: { type: DataTypes.STRING, defaultValue: 'Medium' },
  boilerplate: { 
    type: DataTypes.VIRTUAL,
    get() { return this.practice_scaffold || this.getDataValue('boilerplate'); }
  },
  practice_scaffold: { type: DataTypes.TEXT, allowNull: true },
  python_code: { type: DataTypes.TEXT, allowNull: true },
  solution_format: { type: DataTypes.TEXT, allowNull: true },
  hints: { type: DataTypes.JSON, allowNull: true },
  initial_probe: { type: DataTypes.TEXT, allowNull: true },
  neetcode_url: { type: DataTypes.STRING, allowNull: true },
  leetcode_url: { type: DataTypes.STRING, allowNull: true },
  youtube_url: { type: DataTypes.STRING, allowNull: true },
  test_cases: { type: DataTypes.JSON, allowNull: true },
  sample_test_cases: { type: DataTypes.JSON, allowNull: true },
  solutions: { type: DataTypes.JSON, allowNull: true }
}, {
  tableName: 'problems', 
  timestamps: false, // The remote DB doesn't have createdAt/updatedAt
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

module.exports = { Question, sequelize };
