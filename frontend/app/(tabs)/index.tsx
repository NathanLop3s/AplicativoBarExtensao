import { ThemedView } from '@/components/themed-view';
import { useRouter } from 'expo-router';
import { removerToken, removerUsuario, pegarUsuario } from '@/services/storage';
import { TouchableOpacity, Text, StyleSheet, View, StatusBar } from 'react-native';
import { useEffect, useState } from 'react';

export default function HomeScreen() {
  const router = useRouter();
  const [nomeUsuario, setNomeUsuario] = useState('');

  useEffect(() => {
    const carregar = async () => {
      const usuario = await pegarUsuario();
      if (usuario?.nome) setNomeUsuario(usuario.nome);
    };
    carregar();
  }, []);

  const handleLogout = async () => {
    await removerToken();
    await removerUsuario();
    router.replace('/login');
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />

      <View style={styles.topSection}>
        <Text style={styles.eyebrow}>bem-vindo</Text>
        <Text style={styles.nome}>{nomeUsuario || 'Olá!'}</Text>
        <View style={styles.accentLine} />
      </View>

      <View style={styles.cardGrid}>
        <TouchableOpacity
          style={styles.navCard}
          onPress={() => router.push('/(tabs)/cardapio')}
          activeOpacity={0.8}
        >
          <Text style={styles.cardIcon}>🍽</Text>
          <Text style={styles.cardTitle}>Cardápio</Text>
          <Text style={styles.cardDesc}>Ver produtos e montar seu pedido</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.navCard}
          onPress={() => router.push('/(tabs)/pedidos')}
          activeOpacity={0.8}
        >
          <Text style={styles.cardIcon}>📋</Text>
          <Text style={styles.cardTitle}>Pedidos</Text>
          <Text style={styles.cardDesc}>Acompanhe seus pedidos anteriores</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout} activeOpacity={0.8}>
        <Text style={styles.logoutText}>Sair da conta</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0e0b08',
    paddingHorizontal: 24,
    paddingTop: 80,
  },
  topSection: {
    marginBottom: 40,
  },
  eyebrow: {
    color: '#6b5840',
    fontSize: 11,
    letterSpacing: 3,
    textTransform: 'uppercase',
    marginBottom: 6,
  },
  nome: {
    color: '#f0e6d3',
    fontSize: 30,
    fontWeight: '300',
    letterSpacing: 1,
  },
  accentLine: {
    width: 40,
    height: 1.5,
    backgroundColor: '#c9943a',
    marginTop: 14,
  },
  cardGrid: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 'auto',
  },
  navCard: {
    flex: 1,
    backgroundColor: '#17120c',
    borderWidth: 1,
    borderColor: '#2a2018',
    borderRadius: 10,
    padding: 20,
    minHeight: 140,
    justifyContent: 'space-between',
  },
  cardIcon: {
    fontSize: 24,
    marginBottom: 12,
  },
  cardTitle: {
    color: '#f0e6d3',
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 4,
  },
  cardDesc: {
    color: '#6b5840',
    fontSize: 12,
    lineHeight: 16,
  },
  logoutBtn: {
    borderWidth: 1,
    borderColor: '#2a2018',
    borderRadius: 6,
    paddingVertical: 14,
    alignItems: 'center',
    marginBottom: 40,
  },
  logoutText: {
    color: '#6b5840',
    fontSize: 13,
    letterSpacing: 1,
  },
});