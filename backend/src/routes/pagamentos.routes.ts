import { Router } from 'express';
import { criarPix } from '../controllers/pagamentos.controller.js';

const router = Router();

router.post('/pix', criarPix);

export default router;