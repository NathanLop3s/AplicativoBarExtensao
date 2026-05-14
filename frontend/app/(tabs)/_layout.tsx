import { Tabs } from 'expo-router';
import React, { useEffect, useState } from 'react';

import { HapticTab } from '@/components/haptic-tab';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

import { pegarUsuario } from '@/services/storage';

export default function TabLayout() {
  const colorScheme = useColorScheme();

  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const carregarUsuario = async () => {
      try {
        const usuario = await pegarUsuario();

        setIsAdmin(!!usuario?.admin);

      } catch (error) {
        console.error(error);
        setIsAdmin(false);
      }
    };

    carregarUsuario();
  }, []);

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor:
          Colors[colorScheme ?? 'light'].tint,

        headerShown: false,

        tabBarButton: HapticTab,

        tabBarStyle: {
          backgroundColor: '#5e3030',
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color }) => (
            <IconSymbol
              size={28}
              name="house.fill"
              color={color}
            />
          ),
        }}
      />

      <Tabs.Screen
        name="cardapio"
        options={{
          title: 'Cardápio',
          tabBarIcon: ({ color }) => (
            <IconSymbol
              size={28}
              name="list.bullet"
              color={color}
            />
          ),
        }}
      />

      <Tabs.Screen
        name="pedidos"
        options={{
          title: 'Pedidos',
          tabBarIcon: ({ color }) => (
            <IconSymbol
              size={28}
              name="cart.fill"
              color={color}
            />
          ),
        }}
      />

      <Tabs.Screen
        name="admin"
        options={{
          href: isAdmin ? '/admin' : null,

          title: 'Admin',

          tabBarIcon: ({ color }) => (
            <IconSymbol
              size={28}
              name="gearshape.fill"
              color={color}
            />
          ),
        }}
      />
    </Tabs>
  );
}