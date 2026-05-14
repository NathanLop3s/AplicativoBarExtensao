function validarLogin(email: string, senha: string) {
  if (!email || !senha) {
    return false;
  }

  return true;
}

describe('Login', () => {
  test('deve aceitar login válido', () => {
    expect(validarLogin('teste@gmail.com', '123456'))
      .toBe(true);
  });

  test('deve rejeitar senha vazia', () => {
    expect(validarLogin('teste@gmail.com', ''))
      .toBe(false);
  });
});