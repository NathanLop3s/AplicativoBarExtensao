import express from 'express';
import cors from 'cors';
import produtosRoutes from './routes/produtos.routes.js';
import usuarioRoutes from './routes/usuario.routes.js';




const app = express();

app.use(cors());
app.use(express.json());

app.use('/usuario', usuarioRoutes);
app.use('/produtos', produtosRoutes);

const PORT = process.env.PORT || 8080;

app.listen(Number(PORT), "0.0.0.0", () => {
  console.log(`API rodando na porta ${PORT}`);
});