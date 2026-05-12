import type { Response, NextFunction } from 'express';

export function adminMiddleware(
  req: any,
  res: Response,
  next: NextFunction
) {

  if (!req.user?.admin) {
    return res.status(403).json({
      erro: 'Acesso negado'
    });
  }

  next();
}