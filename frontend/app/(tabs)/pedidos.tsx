import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
} from 'react-native';

import { pegarToken } from '@/services/storage';
import { API_URL } from '@/constants/config';

export default function PedidosScreen() {
  const [pedidos, setPedidos] = useState<any[]>([]);

  useEffect(() => {
    fetchPedidos();
  }, []);

  const fetchPedidos = async () => {
    try {
      const token = await pegarToken();

      const response = await fetch(`${API_URL}/pedidos`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (response.ok) {
        setPedidos(data);
      }

    } catch (error) {
      console.error(error);
    }
  };

  const formatarMoeda = (valor: number) => {
    return valor.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    });
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.titulo}>Meus Pedidos</Text>

      {pedidos.map((pedido) => (
        <View key={pedido.id} style={styles.card}>

          <Text style={styles.id}>
            Pedido #{pedido.id}
          </Text>

          <Text style={styles.texto}>
            Status: {pedido.status}
          </Text>

          <Text style={styles.texto}>
            Total: {formatarMoeda(Number(pedido.total))}
          </Text>

          <Text style={styles.subtitulo}>
            Itens:
          </Text>

          {pedido.itens.map((item: any, index: number) => (
            <Text key={index} style={styles.item}>
              • {item.nome} x{item.quantidade}
            </Text>
          ))}

        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
    padding: 16,
  },

  titulo: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },

  card: {
    backgroundColor: '#5e3030',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },

  id: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 18,
    marginBottom: 10,
  },

  texto: {
    color: '#fff',
    marginBottom: 5,
  },

  subtitulo: {
    color: '#fff',
    marginTop: 10,
    fontWeight: 'bold',
  },

  item: {
    color: '#fff',
    marginLeft: 10,
    marginTop: 4,
  },
});