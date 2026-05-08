const { Sequelize } = require('sequelize');
const path = require('path');
require('dotenv').config();

const dbPath = path.resolve(__dirname, '../../database.sqlite');

const dialect = process.env.APP_DB_DIALECT || process.env.DB_DIALECT || 'sqlite';
const socketPath = process.env.APP_DB_SOCKET_PATH || process.env.DB_SOCKET_PATH;

const dialectOptions = dialect === 'mysql' ? {
  // SSL is required for Public IP but not supported/needed over Unix Socket
  ...(socketPath ? {} : { ssl: { rejectUnauthorized: false } })
} : {};

// On Google Cloud Run, we connect via a Unix socket if socketPath is provided
if (socketPath && dialect === 'mysql') {
  dialectOptions.socketPath = socketPath;
}

const sequelize = new Sequelize({
  dialect: dialect,
  storage: process.env.APP_DB_STORAGE || process.env.DB_STORAGE || dbPath,
  host: process.env.APP_DB_HOST || process.env.DB_HOST,
  username: process.env.APP_DB_USER || process.env.DB_USER,
  password: process.env.APP_DB_PASSWORD || process.env.DB_PASSWORD || process.env.DB_PASS,
  database: process.env.APP_DB_NAME || process.env.DB_NAME,
  logging: false,
  dialectOptions
});

module.exports = sequelize;
