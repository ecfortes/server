import { Router } from 'express';
import {
    updatePack,
    deletePack,
    listOrphanPacks,
    listPackOverview,
    createOrphanPack,
} from '../controllers/packs.controller.js';

const router = Router();

// Specific routes first (avoid collision with '/:id')
router.get('/overview', listPackOverview);  // GET /api/packs/overview
router.get('/orphans', listOrphanPacks);    // GET /api/packs/orphans
router.post('/orphans', createOrphanPack);  // POST /api/packs/orphans

// Parameter routes last
router.put('/:id', updatePack);             // PUT /api/packs/:id
router.delete('/:id', deletePack);          // DELETE /api/packs/:id

export default router;
