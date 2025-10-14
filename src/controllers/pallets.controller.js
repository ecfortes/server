import { query, getClient } from '../db.js';
import { clamp, toInt, toNum, toBool } from '../utils/parse.js';
import { badRequest } from '../utils/http.js';

// GET /api/pallets
export async function listPallets(req, res) {
  try {
    const limit = clamp(parseInt(req.query.limit) || 20, 1, 100);
    const offset = Math.max(parseInt(req.query.offset) || 0, 0);
    const search = (req.query.search || '').trim();
    const order = (req.query.order || 'updated_at').toLowerCase()

    const params = [];
    let where = '';
    if (search) {
      params.push(`%${search}%`);
      where = `WHERE qr_code ILIKE $${params.length}`;
    }

    const countSql = `SELECT COUNT(*)::int AS total FROM pallets ${where}`;
    const dataSql = `
      SELECT id, created_at, updated_at, qr_code, completed, num_doca, seq_pallet, station
      FROM pallets
      ${where}
      ORDER BY ${order} DESC
      LIMIT $${params.length + 1} OFFSET $${params.length + 2}
    `;

    const [{ rows: countRows }, { rows }] = await Promise.all([
      query(countSql, params),
      query(dataSql, [...params, limit, offset]),
    ]);

    res.json({ items: rows, total: countRows[0].total, limit, offset });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to list pallets' });
  }
}

// GET /api/pallets/:id
export async function getPallet(req, res) {
  try {
    const { rows } = await query(
      `SELECT id, created_at, updated_at, qr_code, completed, num_doca, seq_pallet, station
       FROM pallets WHERE id = $1`,
      [req.params.id]
    );
    if (!rows[0]) return res.status(404).json({ error: 'Pallet not found' });
    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to read pallet' });
  }
}

// POST /api/pallets
export async function createPallet(req, res) {
  try {
    const { qr_code, completed, num_doca, seq_pallet, station } = req.body || {};

    const _completed = toBool(completed);
    const _num_doca = toInt(num_doca);
    const _seq_pallet = toNum(seq_pallet);
    const _station = toInt(station);

    if (_seq_pallet === null) return badRequest(res, 'seq_pallet must be numeric');

    const { rows } = await query(
      `INSERT INTO pallets (qr_code, completed, num_doca, seq_pallet, station)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, created_at, updated_at, qr_code, completed, num_doca, seq_pallet, station`,
      [qr_code ?? null, _completed, _num_doca, _seq_pallet, _station]
    );

    res.status(201).json(rows[0]);
  } catch (err) {
    console.error(err);
    if (err?.code === '23505') {
      return badRequest(res, 'seq_pallet must be unique');
    }
    res.status(500).json({ error: 'Failed to create pallet' });
  }
}

// PUT /api/pallets/:id
export async function updatePallet(req, res) {
  try {
    const { qr_code, completed, num_doca, seq_pallet, station } = req.body || {};

    const sets = [];
    const params = [];
    let i = 1;

    // qr_code (aceita null)
    if ('qr_code' in req.body) {
      sets.push(`qr_code = $${i++}`);
      params.push(qr_code ?? null);
    }

    // completed (aceita null)
    if ('completed' in req.body) {
      sets.push(`completed = $${i++}`);
      params.push(toBool(completed)); // toBool(null) => null
    }

    // num_doca (aceita null; valida inteiro quando não-null)
    if ('num_doca' in req.body) {
      const raw = num_doca;
      const val = raw === null ? null : toInt(raw);
      if (raw !== null && val === null) {
        return badRequest(res, 'num_doca must be integer or null');
      }
      sets.push(`num_doca = $${i++}`);
      params.push(val);
    }

    // seq_pallet (aceita null; valida numérico quando não-null)
    if ('seq_pallet' in req.body) {
      const raw = seq_pallet;
      const val = raw === null ? null : toNum(raw);
      if (raw !== null && val === null) {
        return badRequest(res, 'seq_pallet must be numeric or null');
      }
      sets.push(`seq_pallet = $${i++}`);
      params.push(val);
    }

    // station (aceita null; valida inteiro quando não-null)
    if ('station' in req.body) {
      const raw = station;
      const val = raw === null ? null : toInt(raw);
      if (raw !== null && val === null) {
        return badRequest(res, 'station must be integer or null');
      }
      sets.push(`station = $${i++}`);
      params.push(val);
    }

    // Sempre atualiza updated_at
    sets.push(`updated_at = NOW()`);

    const sql = `
      UPDATE pallets
         SET ${sets.join(', ')}
       WHERE id = $${i}
       RETURNING id, created_at, updated_at, qr_code, completed, num_doca, seq_pallet, station
    `;
    params.push(req.params.id);

    const { rows } = await query(sql, params);
    if (!rows[0]) return res.status(404).json({ error: 'Pallet not found' });
    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    if (err?.code === '23505') {
      // unique(seq_pallet)
      return badRequest(res, 'seq_pallet must be unique');
    }
    res.status(500).json({ error: 'Failed to update pallet' });
  }
}


// DELETE /api/pallets/:id
export async function deletePallet(req, res) {
  const client = await getClient();
  try {
    await client.query('BEGIN');

    const { rows: palletRows } = await client.query(
      'SELECT seq_pallet FROM pallets WHERE id = $1',
      [req.params.id]
    );
    if (!palletRows[0]) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: 'Pallet not found' });
    }
    const seq = palletRows[0].seq_pallet;

    await client.query('DELETE FROM pack WHERE seq_pallet = $1', [seq]);

    const { rowCount } = await client.query('DELETE FROM pallets WHERE id = $1', [req.params.id]);

    await client.query('COMMIT');
    if (!rowCount) return res.status(404).json({ error: 'Pallet not found' });
    res.json({ ok: true });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error(err);
    res.status(500).json({ error: 'Failed to delete pallet' });
  } finally {
    client.release();
  }
}

// GET /api/pallets/:id/packs
export async function listPacksByPallet(req, res) {
  try {
    const limit = clamp(parseInt(req.query.limit) || 20, 1, 200);
    const offset = Math.max(parseInt(req.query.offset) || 0, 0);
    const palletId = req.params.id;

    const packsSql = `
      SELECT p.id, p.created_at, p.updated_at, p.qr_code, p.orig, p.seq_pallet, p.seq_pack,
             p.lastpack, p.pospallet, p.robot_num
      FROM pack p
      JOIN pallets pl ON pl.seq_pallet = p.seq_pallet
      WHERE pl.id = $1
      ORDER BY p.created_at DESC
      LIMIT $2 OFFSET $3`;

    const countSql = `
      SELECT COUNT(*)::int AS total
      FROM pack p JOIN pallets pl ON pl.seq_pallet = p.seq_pallet
      WHERE pl.id = $1`;

    const [data, count] = await Promise.all([
      query(packsSql, [palletId, limit, offset]),
      query(countSql, [palletId]),
    ]);

    res.json({ items: data.rows, total: count.rows[0].total, limit, offset });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to list pack items' });
  }
}

// POST /api/pallets/:id/packs
export async function createPackInPallet(req, res) {
  try {
    const palletId = req.params.id;

    const { rows: palletRows } = await query('SELECT seq_pallet FROM pallets WHERE id = $1', [palletId]);
    if (!palletRows[0]) return res.status(404).json({ error: 'Pallet not found' });

    const seq_pallet = palletRows[0].seq_pallet;

    const { qr_code, orig, seq_pack, lastpack, pospallet, robot_num } = req.body || {};

    const _orig = toInt(orig);
    const _seq_pack = toNum(seq_pack);
    const _lastpack = toBool(lastpack);
    const _station = toInt(pospallet);
    const _robot_num = toInt(robot_num);

    const { rows } = await query(
      `INSERT INTO pack (qr_code, orig, seq_pallet, seq_pack, lastpack, pospallet, robot_num)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING id, created_at, updated_at, qr_code, orig, seq_pallet, seq_pack, lastpack, pospallet, robot_num`,
      [qr_code ?? null, _orig, seq_pallet, _seq_pack, _lastpack, _station, _robot_num]
    );

    res.status(201).json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create pack' });
  }
}
