// src/utils/http.js (CommonJS)

function badRequest(res, msg, details) {
  return res.status(400).json({ error: msg, details });
}

module.exports = { badRequest };
