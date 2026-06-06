const { Sequelize } = require('sequelize');
const path = require('path');
require('dotenv').config();

const dbPath = path.resolve(__dirname, '../../database.sqlite');

const dialect = process.env.APP_DB_DIALECT || process.env.DB_DIALECT || 'sqlite';
const socketPath = process.env.APP_DB_SOCKET_PATH || process.env.DB_SOCKET_PATH;

// Prefer a single connection string when provided.
// Works well on Railway where the Postgres service provides DATABASE_URL / DATABASE_PUBLIC_URL.
const databaseUrl =
  process.env.APP_DB_URL ||
  process.env.DB_URL ||
  process.env.DATABASE_URL ||
  process.env.DATABASE_PUBLIC_URL;

const dialectOptions = dialect === 'mysql' ? {
  // SSL is required for Public IP but not supported/needed over Unix Socket
  ...(socketPath ? {} : { ssl: { rejectUnauthorized: false } })
} : {};

// On Google Cloud Run, we connect via a Unix socket if socketPath is provided
if (socketPath && dialect === 'mysql') {
  dialectOptions.socketPath = socketPath;
}

const sequelize = databaseUrl
  ? new Sequelize(databaseUrl, {
      dialect,
      logging: false,
      dialectOptions,
      pool: {
        acquire: 30000,
        idle: 20000,
        max: 5,
        min: 1,
        evict: 10000,
        validate: async (connection) => {
          if (dialect !== 'mysql') return true;
          try {
            await sequelize.query('SELECT 1', { transaction: null, connection });
            return true;
          } catch {
            return false;
          }
        },
      },
    })
  : new Sequelize({
      dialect: dialect,
      storage: process.env.APP_DB_STORAGE || process.env.DB_STORAGE || dbPath,
      host: process.env.APP_DB_HOST || process.env.DB_HOST,
      username: process.env.APP_DB_USER || process.env.DB_USER,
      password: process.env.APP_DB_PASSWORD || process.env.DB_PASSWORD || process.env.DB_PASS,
      database: process.env.APP_DB_NAME || process.env.DB_NAME,
      logging: false,
      dialectOptions,
      pool: {
        acquire: 30000,
        idle: 20000,
        max: 5,
        min: 1,
        evict: 10000,
        validate: async (connection) => {
          if (dialect !== 'mysql') return true;
          try {
            await sequelize.query('SELECT 1', { transaction: null, connection });
            return true;
          } catch {
            return false;
          }
        },
      },
    });

module.exports = sequelize;
