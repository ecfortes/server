// src/routes/pallets.routes.js
const { Router } = require('express');
const {
  listPallets,
  getPallet,
  createPallet,
  updatePallet,
  deletePallet,
  listPacksByPallet,
  createPackInPallet,
} = require('../controllers/pallets.controller');

const router = Router();

// /api/pallets
router.get('/', listPallets);
router.get('/:id', getPallet);
router.post('/', createPallet);
router.put('/:id', updatePallet);
router.delete('/:id', deletePallet);

// Nested: /api/pallets/:id/packs
router.get('/:id/packs', listPacksByPallet);
router.post('/:id/packs', createPackInPallet);

module.exports = router;
