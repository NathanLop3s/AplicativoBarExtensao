import type { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

const SECRET = process.env.JWT_SECRET || 'chave';

export function authMiddleware(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({ erro: 'Token não enviado' });
  }

  const token = authHeader.split(' ')[1];

  if (!token)
    return res.status(401).json({ erro: 'Token não enviado' });
  
  try {
    const decoded = jwt.verify(token, SECRET);

    (req as any).user = decoded;

    next();
  } catch (err) {
    return res.status(401).json({ erro: 'Token inválido' });
  }
}