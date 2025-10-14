import pg from 'pg';
import pc from 'picocolors';
import { highlight } from 'cli-highlight';

const { Pool } = pg;

// Pool gerencia as conexoes com o PostgreSQL a partir das configuracoes do ambiente
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  // ssl: { rejectUnauthorized: false }, // enable if needed
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

// Destaca visualmente o tempo de execucao da query
function colorMs(ms) {
  if (ms >= 1000) return pc.bold(pc.bgRed(` ${ms} ms `));
  if (ms >= 300) return pc.bold(pc.yellow(`${ms} ms`));
  return pc.green(`${ms} ms`);
}

// Coloriza o verbo principal SQL (SELECT, INSERT, etc.)
function verbColor(sql) {
  const v = (sql.match(/^\s*(\w+)/i)?.[1] || '').toUpperCase();
  if (v === 'SELECT') return pc.cyan(v);
  if (v === 'INSERT') return pc.green(v);
  if (v === 'UPDATE') return pc.yellow(v);
  if (v === 'DELETE') return pc.red(v);
  return pc.white(v || 'SQL');
}

// Emite log detalhado da query quando habilitado via variaveis de ambiente
function logSql({ text, params, duration, error }) {
  if (!SQL_LOG || duration < SQL_SLOW_MS) return;

  const coloredSql = highlight(text, {
    language: 'sql',
    ignoreIllegals: true,
    theme: sqlTheme,
  });

  const hdr = `${pc.bold(pc.magenta('DB'))} ${colorMs(duration)} ${verbColor(text)}${error ? ' ' + pc.bgRed(pc.bold(' ERROR ')) : ''
    }`;

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

// Executa consultas padrao e registra a duracao/erro no log
export async function query(text, params) {
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

// Fornece um client dedicado para transacoes manuais
export async function getClient() {
  return await pool.connect();
}
