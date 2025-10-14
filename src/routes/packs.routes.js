import { Router } from 'express';
import { updatePack, deletePack, listOrphanPacks } from '../controllers/packs.controller.js';

const router = Router();

// /api/packs
router.put('/:id', updatePack);
router.delete('/:id', deletePack);
router.get('/orphans', listOrphanPacks)

export default router;
