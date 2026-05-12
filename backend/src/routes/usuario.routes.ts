import { Router } from 'express';
import connection from '../database.js';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';

const router = Router();
const SECRET = process.env.JWT_SECRET || 'chave';

router.post('/login', async (req, res) => {
    const { email, senha } = req.body;

    try {
        const [rows]: any = await connection.query(
            'SELECT * FROM usuarios WHERE email = ?',
            [email]
        );

        if (rows.length === 0) {
            return res.status(401).json({ erro: 'Credenciais inválidas' });
        }

        const usuario = rows[0];

        const senhaValida = await bcrypt.compare(senha, usuario.senha);

        if (!senhaValida) {
            return res.status(401).json({ erro: 'Credenciais inválidas' });
        }

        const token = jwt.sign(
            {
                id: usuario.id,
                email: usuario.email,
                admin: usuario.admin
            },
            SECRET,
            { expiresIn: '1h' }
        );

        return res.json({
            message: 'Login OK',
            usuario: usuario,
            token: token
        });

    } catch (error) {
        return res.status(500).json({ erro: 'Erro no login' });
    }
});

router.post('/register', async (req, res) => {
    const { nome, email, senha } = req.body;

    try {
        const [existe]: any = await connection.query(
            'SELECT * FROM usuarios WHERE email = ?',
            [email]
        );

        if (existe.length > 0) {
            return res.status(400).json({ erro: 'Email já cadastrado' });
        }

        const senhaHash = await bcrypt.hash(senha, 10);

        await connection.query(
            'INSERT INTO usuarios (nome, email, senha) VALUES (?, ?, ?)',
            [nome, email, senhaHash]
        );

        return res.json({ message: 'Usuário criado com sucesso' });

    } catch (error) {
        console.error(error);

        return res.status(500).json({
            erro: 'Erro ao cadastrar usuário'
        });
    }
});

export default router;