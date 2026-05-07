import type { Request, Response } from 'express';
import db from '../database.js';

export const criarPedido = async (req: Request, res: Response) => {
  try {
    const usuario_id = (req as any).user.id;
    const { items } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({ erro: 'Carrinho vazio' });
    }

    let total = 0;

    for (const item of items) {
      const [produto]: any = await db.query(
        'SELECT preco FROM produtos WHERE id = ?',
        [item.produto_id]
      );

      if (!produto.length) {
        return res.status(400).json({ erro: 'Produto inválido' });
      }

      total += produto[0].preco * item.quantidade;
    }

    const [pedidoResult]: any = await db.query(
      'INSERT INTO pedidos (usuario_id, total, status) VALUES (?, ?, ?)',
      [usuario_id, total, 'pendente']
    );

    const pedido_id = pedidoResult.insertId;

    for (const item of items) {
      const [produto]: any = await db.query(
        'SELECT preco FROM produtos WHERE id = ?',
        [item.produto_id]
      );

      await db.query(
        'INSERT INTO pedido_itens (pedido_id, produto_id, quantidade, preco) VALUES (?, ?, ?, ?)',
        [pedido_id, item.produto_id, item.quantidade, produto[0].preco]
      );
    }

    return res.status(201).json({
      mensagem: 'Pedido criado com sucesso',
      pedido_id,
    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({ erro: 'Erro ao criar pedido' });
  }
};

export const listarPedidos = async (req: any, res: any) => {
  try {
    const usuario_id = req.user.id;

    const [pedidos]: any = await db.query(
      `
      SELECT * FROM pedidos
      WHERE usuario_id = ?
      ORDER BY created_at DESC
      `,
      [usuario_id]
    );

    for (const pedido of pedidos) {
      const [itens]: any = await db.query(
        `
        SELECT 
          pi.quantidade,
          pi.preco,
          p.nome
        FROM pedido_itens pi
        JOIN produtos p ON p.id = pi.produto_id
        WHERE pi.pedido_id = ?
        `,
        [pedido.id]
      );

      pedido.itens = itens;
    }

    res.json(pedidos);

  } catch (error) {
    console.error(error);
    res.status(500).json({
      erro: 'Erro ao buscar pedidos'
    });
  }
};