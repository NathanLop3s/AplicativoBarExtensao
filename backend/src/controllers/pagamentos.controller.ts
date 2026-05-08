import type { Request, Response } from 'express';
import { Payment } from 'mercadopago';
import { mpClient } from '../config/mercadopago.js';

export const criarPix = async (req: Request, res: Response) => {
  try {
    const { total } = req.body;

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