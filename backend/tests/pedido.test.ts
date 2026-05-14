function calcularTotalPedido(
  preco: number,
  quantidade: number
) {
  return preco * quantidade;
}

describe('Pedidos', () => {
  test('deve calcular total corretamente', () => {
    expect(calcularTotalPedido(10, 3))
      .toBe(30);
  });

  test('deve calcular pedido unitário', () => {
    expect(calcularTotalPedido(5, 1))
      .toBe(5);
  });
});