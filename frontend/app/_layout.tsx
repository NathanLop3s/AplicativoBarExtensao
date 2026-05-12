import { Stack, useRouter, useSegments } from "expo-router";
import { useEffect, useState } from "react";
import { View, ActivityIndicator } from "react-native";
import {
  pegarToken,
  pegarUsuario,
} from '@/services/storage';

export default function RootLayout() {
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  const router = useRouter();
  const segments = useSegments();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = await pegarToken();
        const usuario = await pegarUsuario();

        setIsAuthenticated(!!token);
        setIsAdmin(!!usuario?.admin);

      } catch (error) {
        setIsAuthenticated(false);
        setIsAdmin(false);

      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, [segments]);

  useEffect(() => {
    if (isLoading) return;

    const inAuthGroup = segments[0] === "login";

    if (!isAuthenticated && !inAuthGroup) {
      router.replace("/login");
    }

    if (isAuthenticated && inAuthGroup) {

      router.replace('/(tabs)');

    }
  }, [isAuthenticated, isAdmin, segments, isLoading]);

  if (isLoading) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <Stack screenOptions={{ headerShown: false }} />
  );
}