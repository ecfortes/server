import { Router } from 'express';

const router = Router();

// GET /api/health
router.get('/health', (_req, res) => {
  res.json({ ok: true, time: new Date().toISOString() });
});

export default router;
