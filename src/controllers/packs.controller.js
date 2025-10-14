import { query } from '../db.js';
import { clamp, toInt, toNum, toBool } from '../utils/parse.js';

// GET /api/packs/orphans
// ---------- Packs órfãos (seq_pallet IS NULL) ----------

export async function listOrphanPacks(req, res) {
  try {
    const limit = clamp(parseInt(req.query.limit) || 20, 1, 200);
    const offset = Math.max(parseInt(req.query.offset) || 0, 0);
    const search = (req.query.search || '').trim();

    const params = [];
    let where = 'WHERE seq_pallet IS NULL';
    if (search) {
      params.push(`%${search}%`);
      where += ` AND qr_code ILIKE $${params.length}`;
    }

    const countSql = `SELECT COUNT(*)::int AS total FROM pack ${where}`;
    const dataSql = `
      SELECT id, created_at, updated_at, qr_code, orig, seq_pallet, seq_pack,
             lastpack, pospallet, robot_num
      FROM pack
      ${where}
      ORDER BY created_at DESC
      LIMIT $${params.length + 1} OFFSET $${params.length + 2}
    `;

    const [countRes, dataRes] = await Promise.all([
      query(countSql, params),
      query(dataSql, [...params, limit, offset]),
    ]);
    res.json({ items: dataRes.rows, total: countRes.rows[0].total, limit, offset });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to list orphan packs' });
  }
}

// PUT /api/packs/:id
export async function updatePack(req, res) {
  try {
    const { qr_code, seq_pallet, orig, seq_pack, lastpack, pospallet, robot_num } = req.body || {};

    const sets = [];
    const params = [];
    let i = 1;

    // qr_code (aceita null)
    if ('qr_code' in req.body) {
      sets.push(`qr_code = $${i++}`);
      params.push(qr_code ?? null);
    }

    if ('seq_pallet' in req.body) {
      sets.push(`seq_pallet = $${i++}`);
      params.push(seq_pallet ?? null);
    }



    // orig (aceita null; valida inteiro quando não-null)
    if ('orig' in req.body) {
      const raw = orig;
      const val = raw === null ? null : toInt(raw);
      if (raw !== null && val === null) {
        return badRequest(res, 'orig must be integer or null');
      }
      sets.push(`orig = $${i++}`);
      params.push(val);
    }

    // seq_pack (aceita null; valida numérico quando não-null)
    if ('seq_pack' in req.body) {
      const raw = seq_pack;
      const val = raw === null ? null : toNum(raw);
      if (raw !== null && val === null) {
        return badRequest(res, 'seq_pack must be numeric or null');
      }
      sets.push(`seq_pack = $${i++}`);
      params.push(val);
    }

    // lastpack (aceita null)
    if ('lastpack' in req.body) {
      sets.push(`lastpack = $${i++}`);
      params.push(toBool(lastpack)); // toBool(null) => null
    }

    // pospallet (aceita null; valida inteiro quando não-null)
    if ('pospallet' in req.body) {
      const raw = pospallet;
      const val = raw === null ? null : toInt(raw);
      if (raw !== null && val === null) {
        return badRequest(res, 'pospallet must be integer or null');
      }
      sets.push(`pospallet = $${i++}`);
      params.push(val);
    }

    // robot_num (aceita null; valida inteiro quando não-null)
    if ('robot_num' in req.body) {
      const raw = robot_num;
      const val = raw === null ? null : toInt(raw);
      if (raw !== null && val === null) {
        return badRequest(res, 'robot_num must be integer or null');
      }
      sets.push(`robot_num = $${i++}`);
      params.push(val);
    }

    // sempre atualiza updated_at
    sets.push(`updated_at = NOW()`);

    const sql = `
      UPDATE pack SET
        ${sets.join(',\n        ')}
      WHERE id = $${i}
      RETURNING id, created_at, updated_at, qr_code, seq_pallet, orig, seq_pallet, seq_pack, lastpack, pospallet, robot_num
    `;
    params.push(req.params.id);

    const { rows } = await query(sql, params);
    if (!rows[0]) return res.status(404).json({ error: 'Pack not found' });
    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update pack' });
  }
}

// DELETE /api/packs/:id
export async function deletePack(req, res) {
  try {
    const { rowCount } = await query('DELETE FROM pack WHERE id = $1', [req.params.id]);
    if (!rowCount) return res.status(404).json({ error: 'Pack not found' });
    res.json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to delete pack' });
  }
}

/**
 * GET /api/packs/overview
 * Lista a view public.vw_pack_overview com paginação e busca.
 * ?limit=20&offset=0&search=texto
 */
export async function listPackOverview(req, res) {
  try {
    const limit = clamp(parseInt(req.query.limit) || 20, 1, 200);
    const offset = Math.max(parseInt(req.query.offset) || 0, 0);
    const search = (req.query.search || '').trim();

    const params = [];
    const where = [];

    if (search) {
      params.push(`%${search}%`);
      // busca por QR do pack, QR do pallet OU OT (4 últimos)
      where.push(`(idea_ean ILIKE $${params.length} OR iden_pallet ILIKE $${params.length} OR ot ILIKE $${params.length})`);
    }

    const whereSql = where.length ? `WHERE ${where.join(' AND ')}` : '';

    const countSql = `SELECT COUNT(*)::int AS total FROM public.vw_pack_overview ${whereSql}`;

    const dataSql = `
      SELECT
        fecha,
        hora,
        idea_ean,
        origem_enfardadeira,
        ot,
        iden_robot,
        iden_pallet,
        palet_completo,
        destino_muelle
      FROM public.vw_pack_overview
      ${whereSql}
      ORDER BY fecha DESC, hora DESC
      LIMIT $${params.length + 1} OFFSET $${params.length + 2}
    `;

    const [countRes, dataRes] = await Promise.all([
      query(countSql, params),
      query(dataSql, [...params, limit, offset]),
    ]);

    res.json({
      items: dataRes.rows,
      total: countRes.rows[0].total,
      limit,
      offset,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to list pack overview' });
  }
}