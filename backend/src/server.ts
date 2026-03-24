import express from 'express';
import cors from 'cors';
import connection from './database.js';

const app = express();
app.use(cors());
app.use(express.json());

app.get('/produtos', async (req, res) => {
  try {
    const [rows] = await connection.query('SELECT * FROM produtos');
    return res.json(rows);
  } catch (error) {
    return res.status(500).json({ erro: "Erro ao buscar produtos" });
  }
});

app.get('/produtos/categoria/:tipo', async (req, res) => {
  const { tipo } = req.params;
  try {
    const [rows] = await connection.query('SELECT * FROM produtos WHERE categoria = ?', [tipo]);
    return res.json(rows);
  } catch (error) {
    return res.status(500).json({ erro: "Erro ao filtrar categoria" });
  }
});

app.get('/produtos/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const [rows]: any = await connection.query('SELECT * FROM produtos WHERE id = ?', [id]);
    if (rows.length === 0) return res.status(404).json({ erro: "Produto não encontrado" });
    return res.json(rows[0]);
  } catch (error) {
    return res.status(500).json({ erro: "Erro ao buscar detalhe do produto" });
  }
});

const PORT = 3001;
app.listen(PORT, () => {
  console.log(`API http://localhost:${PORT}`);
});