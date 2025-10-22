// server/config/config.js
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '..', '.env') });

const toBool = (v) => String(v || '').toLowerCase() === 'true';
const sslmode = (process.env.PGSSLMODE || '').toLowerCase();

// Se quiser forçar SSL: sslmode !== 'disable'
const useSSL = sslmode && sslmode !== 'disable';

module.exports = {
  development: {
    username: process.env.PGUSER || 'postgres',
    password: process.env.PGPASSWORD != null ? String(process.env.PGPASSWORD) : null,
    database: process.env.PGDATABASE || 'postgres',
    host: process.env.PGHOST || 'localhost',
    port: Number(process.env.PGPORT || 5432),
    dialect: 'postgres',
    logging: false,
    dialectOptions: useSSL ? { ssl: { require: true, rejectUnauthorized: false } } : {},
  },
  test: {
    username: process.env.PGUSER,
    password: process.env.PGPASSWORD != null ? String(process.env.PGPASSWORD) : null,
    database: process.env.PGDATABASE,
    host: process.env.PGHOST,
    port: Number(process.env.PGPORT || 5432),
    dialect: 'postgres',
    logging: false,
    dialectOptions: useSSL ? { ssl: { require: true, rejectUnauthorized: false } } : {},
  },
  production: {
    username: process.env.PGUSER,
    password: process.env.PGPASSWORD != null ? String(process.env.PGPASSWORD) : null,
    database: process.env.PGDATABASE,
    host: process.env.PGHOST,
    port: Number(process.env.PGPORT || 5432),
    dialect: 'postgres',
    logging: false,
    dialectOptions: useSSL ? { ssl: { require: true, rejectUnauthorized: false } } : {},
  },
};
