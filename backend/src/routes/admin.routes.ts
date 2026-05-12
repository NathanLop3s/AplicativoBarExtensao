import { Router } from 'express';

import { authMiddleware } from '../middleware/auth.js';
import { adminMiddleware } from '../middleware/admin.middleware.js';

import {
  listarProdutosAdmin,
  criarProduto,
  editarProduto,
  deletarProduto
} from '../controllers/admin.controller.js';

const router = Router();

router.use(authMiddleware);
router.use(adminMiddleware);

router.get('/produtos', listarProdutosAdmin);

router.post('/produtos', criarProduto);

router.put('/produtos/:id', editarProduto);

router.delete('/produtos/:id', deletarProduto);

export default router;