import type { Request, Response } from 'express';
import { Payment } from 'mercadopago';

import { mpClient } from '../config/mercadopago.js';
import pool from '../database.js';

export const criarPix = async (
  req: Request,
  res: Response
) => {
  try {

    const { pedidoId } = req.body;

    if (!pedidoId) {
      return res.status(400).json({
        erro: 'Pedido inválido',
      });
    }

    const [pedidos]: any = await pool.query(
      `
      SELECT id, total, status
      FROM pedidos
      WHERE id = ?
      `,
      [pedidoId]
    );

    if (!pedidos.length) {
      return res.status(404).json({
        erro: 'Pedido não encontrado',
      });
    }

    const pedido = pedidos[0];

    if (pedido.status === 'pago') {
      return res.status(400).json({
        erro: 'Pedido já pago',
      });
    }

    const total = Number(pedido.total);

    if (total <= 0) {
      return res.status(400).json({
        erro: 'Valor inválido',
      });
    }

    const payment = new Payment(mpClient);

    const resultado = await payment.create({
      body: {
        transaction_amount: total,

        description: `Pedido #${pedidoId}`,

        payment_method_id: 'pix',

        notification_url:
          'https://aplicativobarextensao.onrender.com/pagamento/webhook',

        payer: {
          email: 'teste@teste.com',
        },
      },
    });

    await pool.query(
      `
      UPDATE pedidos
      SET payment_id = ?
      WHERE id = ?
      `,
      [resultado.id, pedidoId]
    );

    return res.json({
      id: resultado.id,

      qr_code:
        resultado.point_of_interaction
          ?.transaction_data
          ?.qr_code,

      qr_code_base64:
        resultado.point_of_interaction
          ?.transaction_data
          ?.qr_code_base64,
    });

  } catch (error) {

    console.error(error);

    return res.status(500).json({
      erro: 'Erro ao gerar PIX',
    });
  }
};

export const receberWebhook = async (
  req: Request,
  res: Response
) => {
  try {

    const paymentId = req.body?.data?.id;

    if (!paymentId) {
      return res.sendStatus(200);
    }

    const payment = new Payment(mpClient);

    const pagamento = await payment.get({
      id: paymentId,
    });


    const [pedidos]: any = await pool.query(
      `
      SELECT id, total, status
      FROM pedidos
      WHERE payment_id = ?
      `,
      [paymentId]
    );

    if (!pedidos.length) {

      console.log('Pedido não encontrado');

      return res.sendStatus(200);
    }

    const pedido = pedidos[0];

    const valorBanco = Number(pedido.total);
    const valorPago = Number(
      pagamento.transaction_amount
    );

    if (valorBanco !== valorPago) {

      console.log('VALOR DIFERENTE');
      console.log({
        valorBanco,
        valorPago,
      });

      return res.sendStatus(400);
    }

    if (
      pagamento.status === 'approved' &&
      pedido.status !== 'pago'
    ) {

      await pool.query(
        `
        UPDATE pedidos
        SET status = ?
        WHERE id = ?
        `,
        ['pago', pedido.id]
      );
    }

    if (
      pagamento.status === 'pending' &&
      pedido.status !== 'pendente'
    ) {

      await pool.query(
        `
        UPDATE pedidos
        SET status = ?
        WHERE id = ?
        `,
        ['pendente', pedido.id]
      );
    }

    if (
      pagamento.status === 'rejected' &&
      pedido.status !== 'cancelado'
    ) {

      await pool.query(
        `
        UPDATE pedidos
        SET status = ?
        WHERE id = ?
        `,
        ['cancelado', pedido.id]
      );
    }

    return res.sendStatus(200);

  } catch (error) {

    console.error(error);

    return res.sendStatus(500);
  }
};