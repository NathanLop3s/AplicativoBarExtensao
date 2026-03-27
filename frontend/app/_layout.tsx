import { Stack } from 'expo-router';
import { useState, useEffect } from 'react';

export default function RootLayout() {
  const [logado, setLogado] = useState(false);

  useEffect(() => {
    setLogado(false);
  }, []);

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