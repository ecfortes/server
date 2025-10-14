import { Router } from 'express';
import {
    updatePack,
    deletePack,
    listOrphanPacks,
    listPackOverview, // ⬅️ importe a função
} from '../controllers/packs.controller.js';

const router = Router();

// Rotas específicas primeiro (evita colisão com '/:id')
router.get('/overview', listPackOverview);  // GET /api/packs/overview
router.get('/orphans', listOrphanPacks);    // GET /api/packs/orphans

// Rotas com parâmetro por último
router.put('/:id', updatePack);             // PUT /api/packs/:id
router.delete('/:id', deletePack);          // DELETE /api/packs/:id

export default router;
