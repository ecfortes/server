// src/app.js (CommonJS)
require('dotenv').config();              // carrega .env
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');

// Se o seu router atual está em src/routes/index.js em CommonJS:
const apiRouter = require('./routes');   // o Node resolve ./routes/index.js

const app = express();

// Middlewares globais
app.use(express.json());
app.use(morgan('dev'));
app.use(
  cors({
    origin: (process.env.CLIENT_ORIGIN || '*').split(','), // suporta lista separada por vírgula
    credentials: true,
  })
);

// Rotas da API
app.use('/api', apiRouter);

module.exports = app; // CommonJS export
