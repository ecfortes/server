import 'dotenv/config'; // carrega variáveis de ambiente definidas no .env
import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import apiRouter from './routes/index.js';

const app = express(); // instancia principal do servidor Express

// Middlewares globais
app.use(express.json()); // interpreta corpos JSON das requisições
app.use(morgan('dev')); // exibe logs HTTP no formato "dev"
app.use(
  cors({
    origin: process.env.CLIENT_ORIGIN?.split(',') || '*', // define origens permitidas via variável de ambiente
    credentials: true, // habilita envio de cookies/cabecalhos de autenticação
  })
);

// Rotas da API
app.use('/api', apiRouter); // delega todas as rotas /api para o router principal

export default app;
