// src/routes/index.js (CommonJS)
const { Router } = require('express');

const health = require('./health.routes');     // exporta um Router via module.exports
const pallets = require('./pallets.routes');   // idem
const packs = require('./packs.routes');       // idem

const router = Router();

// Mantém exatamente os mesmos paths
router.use(health);              // /api/health
router.use('/pallets', pallets); // /api/pallets...
router.use('/packs', packs);     // /api/packs...

module.exports = router;
