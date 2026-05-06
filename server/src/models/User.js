const { DataTypes } = require('sequelize');
const sequelize = require('./db');

const User = sequelize.define('User', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  passwordHash: {
    type: DataTypes.STRING,
    allowNull: false,
    field: 'password_hash'
  }
}, {
  tableName: 'users',
  timestamps: true
});

// Sync the model with the database
(async () => {
  try {
    await sequelize.sync();
  } catch (err) {
    console.error('Error syncing User model:', err);
  }
})();

module.exports = { User };
