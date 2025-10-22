// src/utils/parse.js (CommonJS)

const clamp = (n, min, max) => Math.max(min, Math.min(max, n));

const toInt = (v) => (
  v === null || v === undefined || v === '' ? null :
  Number.isInteger(Number(v)) ? Number(v) : null
);

// Variante mais estrita (aceita apenas inteiros sem ponto):
// const toInt = (v) => {
//   if (v === null || v === undefined || v === '') return null;
//   if (typeof v === 'number' && Number.isInteger(v)) return v;
//   if (typeof v === 'string' && /^-?\d+$/.test(v.trim())) return Number(v);
//   return null;
// };

const toNum = (v) => (
  v === null || v === undefined || v === '' ? null :
  Number.isNaN(Number(v)) ? null : Number(v)
);

const toBool = (v) => {
  if (v === null || v === undefined || v === '') return null;
  if (typeof v === 'boolean') return v;
  if (typeof v === 'number') return v !== 0;
  if (typeof v === 'string') {
    const s = v.toLowerCase().trim();
    return ['true', 't', '1', 'yes', 'y', 'on'].includes(s);
  }
  return null;
};

module.exports = { clamp, toInt, toNum, toBool };
