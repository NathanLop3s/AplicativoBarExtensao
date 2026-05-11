import { Router } from 'express';
import { criarPix, receberWebhook } from '../controllers/pagamentos.controller.js';

const router = Router();

router.post('/pix', criarPix);
router.post('/webhook', receberWebhook);

export default router;