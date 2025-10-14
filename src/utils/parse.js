export const clamp = (n, min, max) => Math.max(min, Math.min(max, n));

export const toInt = (v) => (
  v === null || v === undefined || v === '' ? null :
  Number.isInteger(Number(v)) ? Number(v) : null
);

export const toNum = (v) => (
  v === null || v === undefined || v === '' ? null :
  isNaN(Number(v)) ? null : Number(v)
);

export const toBool = (v) => {
  if (v === null || v === undefined || v === '') return null;
  if (typeof v === 'boolean') return v;
  if (typeof v === 'number') return v !== 0;
  if (typeof v === 'string') {
    const s = v.toLowerCase();
    return ['true', 't', '1', 'yes', 'y', 'on'].includes(s);
  }
  return null;
};
