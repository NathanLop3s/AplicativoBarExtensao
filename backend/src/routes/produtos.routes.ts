import { Router } from 'express';
import connection from '../database.js';

const router = Router();

router.get('/', async (req, res) => {
  try {
    const [rows] = await connection.query('SELECT * FROM produtos');
    return res.json(rows);
  } catch {
    return res.status(500).json({ erro: "Erro ao buscar produtos" });
  }
});

router.get('/categoria/:tipo', async (req, res) => {
  const { tipo } = req.params;
  try {
    const [rows] = await connection.query(
      'SELECT * FROM produtos WHERE categoria = ?', 
      [tipo]
    );
    return res.json(rows);
  } catch {
    return res.status(500).json({ erro: "Erro ao filtrar categoria" });
  }
});

router.get('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const [rows]: any = await connection.query(
      'SELECT * FROM produtos WHERE id = ?', 
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ erro: "Produto não encontrado" });
    }

    return res.json(rows[0]);
  } catch {
    return res.status(500).json({ erro: "Erro ao buscar produto" });
  }
});

export default router;