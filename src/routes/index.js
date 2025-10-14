import { Router } from 'express';
import health from './health.routes.js';
import pallets from './pallets.routes.js';
import packs from './packs.routes.js';

const router = Router();

// Mantém exatamente os mesmos paths que você já usa
router.use(health);              // /api/health
router.use('/pallets', pallets); // /api/pallets...
router.use('/packs', packs);     // /api/packs...

export default router;
