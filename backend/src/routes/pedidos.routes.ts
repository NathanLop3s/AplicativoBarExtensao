import express from 'express';
import { criarPedido, listarPedidos } from '../controllers/pedidos.controller.js';
import { authMiddleware } from '../middleware/auth.js';
const router = express.Router();

router.post('/', authMiddleware, criarPedido);
router.get('/', authMiddleware, listarPedidos);

export default router;