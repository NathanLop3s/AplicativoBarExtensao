function precoValido(preco: number) {
  return preco > 0;
}

describe('Preço Produto', () => {
  test('deve aceitar preço válido', () => {
    expect(precoValido(10)).toBe(true);
  });

  test('deve rejeitar preço negativo', () => {
    expect(precoValido(-5)).toBe(false);
  });
});