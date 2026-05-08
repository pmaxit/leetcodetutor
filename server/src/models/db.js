const { Sequelize } = require('sequelize');
const path = require('path');
require('dotenv').config();

const dbPath = path.resolve(__dirname, '../../database.sqlite');

const dialectOptions = process.env.DB_DIALECT === 'mysql' ? {
  // SSL is required for Public IP but not supported/needed over Unix Socket
  ...(process.env.DB_SOCKET_PATH ? {} : { ssl: { rejectUnauthorized: false } })
} : {};

// On Google Cloud Run, we connect via a Unix socket if DB_SOCKET_PATH is provided
if (process.env.DB_SOCKET_PATH && process.env.DB_DIALECT === 'mysql') {
  dialectOptions.socketPath = process.env.DB_SOCKET_PATH;
}

const sequelize = new Sequelize({
  dialect: process.env.DB_DIALECT || 'sqlite',
  storage: process.env.DB_STORAGE || dbPath,
  host: process.env.DB_HOST,
  username: process.env.DB_USER,
  password: process.env.DB_PASSWORD || process.env.DB_PASS,
  database: process.env.DB_NAME,
  logging: false,
  dialectOptions
});

module.exports = sequelize;
