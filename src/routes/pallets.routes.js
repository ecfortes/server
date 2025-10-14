import { Router } from 'express';
import {
  listPallets,
  getPallet,
  createPallet,
  updatePallet,
  deletePallet,
  listPacksByPallet,
  createPackInPallet,
} from '../controllers/pallets.controller.js';

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

export default router;
