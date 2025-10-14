export function badRequest(res, msg, details) {
  return res.status(400).json({ error: msg, details });
}
