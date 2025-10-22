// src/routes/health.routes.js
const { Router } = require('express');
const router = Router();

// GET /api/health
router.get('/health', (_req, res) => {
  res.json({ ok: true, time: new Date().toISOString() });
});


module.exports = router;





