// src/db/pg.js (CommonJS)
require('dotenv').config(); // carrega .env do diretório atual do processo

const { Pool } = require('pg');
const pc = require('picocolors');
const { highlight } = require('cli-highlight');

// ---- Pool (usa libpq PG*; cai pra DATABASE_URL se existir) ----
const sslmode = String(process.env.PGSSLMODE || '').toLowerCase();
const useSSL = sslmode && sslmode !== 'disable';

const pool =
  process.env.DATABASE_URL
    ? new Pool({
        connectionString: process.env.DATABASE_URL,
        ssl: useSSL ? { require: true, rejectUnauthorized: false } : undefined,
        max: 20,
        idleTimeoutMillis: 30000,
        connectionTimeoutMillis: 5000,
      })
    : new Pool({
        host: process.env.PGHOST || 'localhost',
        port: Number(process.env.PGPORT || 5432),
        user: process.env.PGUSER || 'postgres',
        password:
          process.env.PGPASSWORD != null ? String(process.env.PGPASSWORD) : undefined,
        database: process.env.PGDATABASE || 'postgres',
        ssl: useSSL ? { require: true, rejectUnauthorized: false } : undefined,
        max: 20,
        idleTimeoutMillis: 30000,
        connectionTimeoutMillis: 5000,
      });

/** ---- Config de logging por ENV ----
 * SQL_LOG:    'true' para ligar (default: ligado fora de produção)
 * SQL_SLOW_MS: só loga se >= N ms (default: 0)
 * SQL_PARAMS: 'false' para não logar params (default: true)
 */
const SQL_LOG =
  (process.env.SQL_LOG === 'true' || process.env.NODE_ENV !== 'production') &&
  process.env.SQL_LOG !== 'false';
const SQL_SLOW_MS = Number(process.env.SQL_SLOW_MS || 0);
const SQL_PARAMS = process.env.SQL_PARAMS !== 'false';

// Tema de cores para highlight
const sqlTheme = {
  keyword: pc.cyan,
  built_in: pc.magenta,
  literal: pc.magenta,
  number: pc.yellow,
  string: pc.green,
  comment: pc.dim,
  meta: pc.gray,
  type: pc.blue,
};

function colorMs(ms) {
  if (ms >= 1000) return pc.bold(pc.bgRed(` ${ms} ms `));
  if (ms >= 300) return pc.bold(pc.yellow(`${ms} ms`));
  return pc.green(`${ms} ms`);
}

function verbColor(sql) {
  const v = (sql.match(/^\s*(\w+)/i)?.[1] || '').toUpperCase();
  if (v === 'SELECT') return pc.cyan(v);
  if (v === 'INSERT') return pc.green(v);
  if (v === 'UPDATE') return pc.yellow(v);
  if (v === 'DELETE') return pc.red(v);
  return pc.white(v || 'SQL');
}

function logSql({ text, params, duration, error }) {
  if (!SQL_LOG || duration < SQL_SLOW_MS) return;

  const coloredSql = highlight(text, {
    language: 'sql',
    ignoreIllegals: true,
    theme: sqlTheme,
  });

  const hdr =
    `${pc.bold(pc.magenta('DB'))} ${colorMs(duration)} ${verbColor(text)}` +
    (error ? ' ' + pc.bgRed(pc.bold(' ERROR ')) : '');

  console.log(hdr);
  console.log(coloredSql.trimEnd());
  if (SQL_PARAMS && params && params.length) {
    console.log(pc.dim('params:'), pc.cyan(JSON.stringify(params)));
  }
  if (error) {
    console.log(pc.red('error:'), pc.bold(String(error.message || error)));
  }
  console.log(pc.dim('-'.repeat(60)));
}

// -------- API pública (CommonJS) --------
async function query(text, params) {
  const start = Date.now();
  let err;
  try {
    const res = await pool.query(text, params);
    return res;
  } catch (e) {
    err = e;
    throw e;
  } finally {
    const duration = Date.now() - start;
    logSql({ text, params, duration, error: err });
  }
}

async function getClient() {
  return pool.connect();
}

module.exports = { query, getClient, pool };
