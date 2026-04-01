import { Stack } from 'expo-router';
import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function RootLayout() {
  const [logado, setLogado] = useState<boolean | null>(null);

  useEffect(() => {
    checkLogin();
  }, []);

  const checkLogin = async () => {
    const user = await AsyncStorage.getItem('user');

    if (user) {
      setLogado(true);
    } else {
      setLogado(false);
    }
  };

  // evita tela bugada enquanto carrega
  if (logado === null) return null;

  return (
    <Stack screenOptions={{ headerShown: false }}>
      {!logado ? (
        <Stack.Screen name="login" />
      ) : (
        <Stack.Screen name="(tabs)" />
      )}
    </Stack>
  );
}