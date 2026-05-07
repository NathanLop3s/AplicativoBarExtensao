import * as SecureStore from 'expo-secure-store';

export async function salvarToken(token: string) {
  await SecureStore.setItemAsync('token', token);
}

export async function pegarToken() {
  return await SecureStore.getItemAsync('token');
}

export async function removerToken() {
  await SecureStore.deleteItemAsync('token');
}

export async function salvarUsuario(usuario: any) {
  await SecureStore.setItemAsync(
    'user',
    JSON.stringify(usuario)
  );
}

export async function pegarUsuario() {
  const user = await SecureStore.getItemAsync('user');

  return user ? JSON.parse(user) : null;
}

export async function removerUsuario() {
  await SecureStore.deleteItemAsync('user');
}