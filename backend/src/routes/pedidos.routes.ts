import express from 'express';
import { criarPedido } from '../controllers/pedidos.controller.js';
import { authMiddleware } from '../middleware/auth.js';
const router = express.Router();

router.post('/', authMiddleware, criarPedido);

export default router;