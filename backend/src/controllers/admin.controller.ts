import type { Request, Response } from 'express';
import pool from '../database.js';

export const listarProdutosAdmin = async (
  req: Request,
  res: Response
) => {
  try {

    const [produtos] = await pool.query(
      'SELECT * FROM produtos ORDER BY id DESC'
    );

    res.json(produtos);

  } catch (error) {
    console.error(error);

    res.status(500).json({
      erro: 'Erro ao listar produtos'
    });
  }
};

export const criarProduto = async (
  req: Request,
  res: Response
) => {
  try {

    const {
      nome,
      descricao,
      preco,
      categoria,
      imagem_url
    } = req.body;

    await pool.query(
      `
      INSERT INTO produtos
      (nome, descricao, preco, categoria, imagem_url)
      VALUES (?, ?, ?, ?, ?)
      `,
      [
        nome,
        descricao,
        preco,
        categoria,
        imagem_url
      ]
    );

    res.status(201).json({
      mensagem: 'Produto criado'
    });

  } catch (error) {
    console.error(error);

    res.status(500).json({
      erro: 'Erro ao criar produto'
    });
  }
};

export const editarProduto = async (
  req: Request,
  res: Response
) => {
  try {

    const { id } = req.params;

    const {
      nome,
      descricao,
      preco,
      categoria,
      imagem_url
    } = req.body;

    await pool.query(
      `
      UPDATE produtos
      SET
        nome = ?,
        descricao = ?,
        preco = ?,
        categoria = ?,
        imagem_url = ?
      WHERE id = ?
      `,
      [
        nome,
        descricao,
        preco,
        categoria,
        imagem_url,
        id
      ]
    );

    res.json({
      mensagem: 'Produto atualizado'
    });

  } catch (error) {
    console.error(error);

    res.status(500).json({
      erro: 'Erro ao editar produto'
    });
  }
};

export const deletarProduto = async (
  req: Request,
  res: Response
) => {
  try {

    const { id } = req.params;

    await pool.query(
      'DELETE FROM produtos WHERE id = ?',
      [id]
    );

    res.json({
      mensagem: 'Produto removido'
    });

  } catch (error) {
    console.error(error);

    res.status(500).json({
      erro: 'Erro ao remover produto'
    });
  }
};