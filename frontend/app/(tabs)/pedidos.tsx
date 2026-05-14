import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, StatusBar } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { pegarToken } from '@/services/storage';
import { API_URL } from '@/constants/config';

const STATUS_COLORS: Record<string, string> = {
  pendente: '#c9943a',
  pago: '#4a9e6b',
  cancelado: '#9e4a4a',
};

export default function PedidosScreen() {
  const [pedidos, setPedidos] = useState<any[]>([]);
  const insets = useSafeAreaInsets();

  useEffect(() => { fetchPedidos(); }, []);

  const fetchPedidos = async () => {
    try {
      const token = await pegarToken();
      const response = await fetch(`${API_URL}/pedidos`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      if (response.ok) setPedidos(data);
    } catch (error) {
      console.error(error);
    }
  };

  const formatarMoeda = (valor: number) =>
    valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar barStyle="light-content" />

      <View style={styles.header}>
        <Text style={styles.headerEyebrow}>Bar Extensão</Text>
        <Text style={styles.headerTitle}>Meus Pedidos</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {pedidos.length === 0 && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>🧾</Text>
            <Text style={styles.emptyText}>Nenhum pedido ainda</Text>
            <Text style={styles.emptySubtext}>Seus pedidos aparecerão aqui</Text>
          </View>
        )}

        {pedidos.map((pedido) => {
          const statusColor = STATUS_COLORS[pedido.status] || '#6b5840';
          return (
            <View key={pedido.id} style={styles.card}>
              <View style={styles.cardHeader}>
                <View>
                  <Text style={styles.pedidoId}>Pedido #{pedido.id}</Text>
                  <Text style={styles.pedidoTotal}>{formatarMoeda(Number(pedido.total))}</Text>
                </View>
                <View style={[styles.statusBadge, { borderColor: statusColor }]}>
                  <Text style={[styles.statusText, { color: statusColor }]}>
                    {pedido.status}
                  </Text>
                </View>
              </View>

              <View style={styles.divider} />

              <View style={styles.itensArea}>
                {pedido.itens.map((item: any, index: number) => (
                  <View key={index} style={styles.itemRow}>
                    <Text style={styles.itemNome}>{item.nome}</Text>
                    <Text style={styles.itemQtd}>×{item.quantidade}</Text>
                  </View>
                ))}
              </View>
            </View>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0e0b08' },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#1e1810',
  },
  headerEyebrow: { color: '#6b5840', fontSize: 10, letterSpacing: 3, textTransform: 'uppercase' },
  headerTitle: { color: '#f0e6d3', fontSize: 22, fontWeight: '300', letterSpacing: 1, marginTop: 2 },
  scrollContent: { padding: 16, paddingBottom: 40 },
  emptyState: { alignItems: 'center', paddingTop: 80 },
  emptyIcon: { fontSize: 40, marginBottom: 12 },
  emptyText: { color: '#f0e6d3', fontSize: 16, fontWeight: '300' },
  emptySubtext: { color: '#6b5840', fontSize: 13, marginTop: 4 },
  card: {
    backgroundColor: '#17120c',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#2a2018',
    marginBottom: 12,
    overflow: 'hidden',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  pedidoId: { color: '#6b5840', fontSize: 11, letterSpacing: 2, textTransform: 'uppercase', marginBottom: 4 },
  pedidoTotal: { color: '#c9943a', fontSize: 18, fontWeight: '600' },
  statusBadge: {
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  statusText: { fontSize: 11, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 1 },
  divider: { height: 1, backgroundColor: '#1e1810' },
  itensArea: { padding: 16 },
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  itemNome: { color: '#f0e6d3', fontSize: 13 },
  itemQtd: { color: '#6b5840', fontSize: 13 },
});