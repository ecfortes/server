// src/routes/packs.routes.js (CommonJS)
const { Router } = require('express');
const {
  updatePack,
  deletePack,
  listOrphanPacks,
  listPackOverview,
  createOrphanPack,
} = require('../controllers/packs.controller');

const router = Router();

// Specific routes first (avoid collision with '/:id')
router.get('/overview', listPackOverview);   // GET /api/packs/overview
router.get('/orphans', listOrphanPacks);     // GET /api/packs/orphans
router.post('/orphans', createOrphanPack);   // POST /api/packs/orphans

// Parameter routes last
router.put('/:id', updatePack);              // PUT /api/packs/:id
router.delete('/:id', deletePack);           // DELETE /api/packs/:id

module.exports = router;
