// src/index.js (CommonJS)
const path = require('path');
const fs = require('fs');
const dotenv = require('dotenv');

// Load base .env first, then environment-specific overrides when available
dotenv.config();
const envName = process.env.NODE_ENV || 'development';
const envFile = path.resolve(__dirname, '..', `.env.${envName}`);
if (fs.existsSync(envFile)) {
  dotenv.config({ path: envFile, override: true });
}

const app = require('./app');

const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
  console.log(`API listening on http://localhost:${PORT}`);
});
