// src/index.js (CommonJS)
require('dotenv').config();
const app = require('./app');

const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
  console.log(`API listening on http://localhost:${PORT}`);
});
