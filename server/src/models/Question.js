const { Sequelize, DataTypes } = require('sequelize');
const path = require('path');
require('dotenv').config();

const dbPath = path.resolve(__dirname, '../../database.sqlite');

const sequelize = new Sequelize({
  dialect: process.env.DB_DIALECT || 'sqlite',
  storage: process.env.DB_STORAGE || dbPath,
  host: process.env.DB_HOST,
  username: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  logging: false,
  dialectOptions: process.env.DB_DIALECT === 'mysql' ? {
    ssl: {
      rejectUnauthorized: false
    }
  } : {}
});

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
  initial_probe: { type: DataTypes.TEXT, allowNull: true }
}, {
  tableName: 'problems', // The table name in neetcode_db
  timestamps: false // The remote DB doesn't have createdAt/updatedAt
});

module.exports = { Question, sequelize };
