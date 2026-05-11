import type { Request, Response } from 'express';
import { MercadoPagoConfig, Payment } from 'mercadopago';
import { mpClient } from '../config/mercadopago.js';
import pool from '../database.js';


export const criarPix = async (req: Request, res: Response) => {
  try {

    console.log(req.body);

    const { total, pedidoId } = req.body;

    const payment = new Payment(mpClient);

    const resultado = await payment.create({
      body: {
        transaction_amount: Number(total),
        description: 'Pedido Bar',
        payment_method_id: 'pix',
        payer: {
          email: 'teste@teste.com',
        },
      },
    });

    await pool.query(
      'UPDATE pedidos SET payment_id = ? WHERE id = ?',
      [resultado.id, pedidoId]
    );

    return res.json({
      id: resultado.id,
      qr_code: resultado.point_of_interaction?.transaction_data?.qr_code,
      qr_code_base64:
        resultado.point_of_interaction?.transaction_data?.qr_code_base64,
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

    if (true) {

      const [resultado]: any = await pool.query(
        'UPDATE pedidos SET status = ? WHERE payment_id = ?',
        ['pago', paymentId]
      );
    }

    return res.sendStatus(200);

  } catch (error) {
    console.error(error);

    return res.sendStatus(500);
  }
};