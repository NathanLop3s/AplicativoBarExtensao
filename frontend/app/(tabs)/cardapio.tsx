import React, { useState, useEffect } from 'react';
import {
  View, ScrollView, Image, Text, TouchableOpacity, StyleSheet, Modal,
} from 'react-native';

import * as Linking from 'expo-linking';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { API_URL } from '@/constants/config';
import { useRouter } from 'expo-router';

import {
  pegarToken,
  removerToken,
} from '@/services/storage';

import * as Clipboard from 'expo-clipboard';
import { useFocusEffect } from 'expo-router';
import { useCallback } from 'react';

export default function CardapioScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const [produtos, setProdutos] = useState<any[]>([]);
  const [carrinho, setCarrinho] = useState<any[]>([]);
  const [loadingPedido, setLoadingPedido] = useState(false);

  const [mostrarResumo, setMostrarResumo] = useState(false);

  const [pixCopiaECola, setPixCopiaECola] = useState('');
  const [qrCode, setQrCode] = useState('');

  const total = carrinho.reduce((acc, item) => {
    return acc + item.preco * item.quantidade;
  }, 0);

  const totalItens = carrinho.reduce((acc, item) => {
    return acc + item.quantidade;
  }, 0);

  useFocusEffect(
    useCallback(() => {
      fetchData();
    }, [])
  );

  const fetchData = async () => {
    try {
      const token = await pegarToken();

      if (!token) {
        router.replace('/login');
        return;
      }

      const response = await fetch(`${API_URL}/produtos`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.status === 401) {
        await removerToken();
        router.replace('/login');
        return;
      }

      const data = await response.json();

      if (Array.isArray(data)) {
        setProdutos(data);
      } else {
        setProdutos([]);
      }

    } catch (error) {
      console.error('Erro ao buscar produtos:', error);
    }
  };

  const formatarMoeda = (valor: number) => {
    return valor.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    });
  };

  const adicionarAoCarrinho = (produto: any) => {
    setCarrinho(prev => {
      const existente = prev.find(p => p.id === produto.id);

      if (existente) {
        return prev.map(p =>
          p.id === produto.id
            ? { ...p, quantidade: p.quantidade + 1 }
            : p
        );
      }

      return [...prev, { ...produto, quantidade: 1 }];
    });
  };

  const removerDoCarrinho = (produto: any) => {
    setCarrinho(prev => {
      const existente = prev.find(p => p.id === produto.id);

      if (!existente) return prev;

      if (existente.quantidade === 1) {
        return prev.filter(p => p.id !== produto.id);
      }

      return prev.map(p =>
        p.id === produto.id
          ? { ...p, quantidade: p.quantidade - 1 }
          : p
      );
    });
  };

  const enviarWhatsapp = () => {
    const listaProdutos = carrinho
      .map(p => `${p.nome} x${p.quantidade}`)
      .join(', ');

    const mensagem =
      `Olá, segue meu pedido:\n\n` +
      `Itens: ${totalItens}\n` +
      `Produtos: ${listaProdutos || 'nenhum'}\n` +
      `Total: ${formatarMoeda(total)}`;

    Linking.openURL(
      `https://wa.me/5537999432706?text=${encodeURIComponent(mensagem)}`
    );
  };

  const finalizarPedido = async () => {
    setLoadingPedido(true);

    try {
      const token = await pegarToken();

      if (!token) {
        router.replace('/login');
        return;
      }

      const items = carrinho.map(item => ({
        produto_id: item.id,
        quantidade: item.quantidade,
      }));


      const pedidoResponse = await fetch(`${API_URL}/pedidos`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ items }),
      });

      const pedidoData = await pedidoResponse.json();

      if (!pedidoResponse.ok) {
        alert(pedidoData.erro || 'Erro ao criar pedido');
        return;
      }

      const pedidoId = pedidoData.pedido_id;


      const pixResponse = await fetch(`${API_URL}/pagamento/pix`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          total,
          pedidoId,
        }),
      });

      const pixData = await pixResponse.json();

      if (!pixResponse.ok) {
        alert(pixData.erro || 'Erro ao gerar PIX');
        return;
      }

      setQrCode(pixData.qr_code_base64);
      setPixCopiaECola(pixData.qr_code);

      setMostrarResumo(true);

    } catch (error) {
      console.error(error);
      alert('Erro ao conectar com servidor');

    } finally {
      setLoadingPedido(false);
    }
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <ScrollView contentContainerStyle={styles.scrollContent}>

        <ThemedText type="title" style={styles.titulo}>
          Cardápio Digital
        </ThemedText>

        <ThemedText style={styles.info}>
          Carrinho: {totalItens} itens | Total: {formatarMoeda(total)}
        </ThemedText>

        <Modal visible={mostrarResumo} transparent animationType="slide">
          <View style={styles.modalOverlay}>
            <View style={styles.bottomSheet}>

              <Text style={styles.resumoTitulo}>
                Resumo do Pedido
              </Text>

              <Text>Itens: {totalItens}</Text>

              <Text>
                Produtos:{' '}
                {totalItens > 0
                  ? carrinho
                    .map(p => `${p.nome} x${p.quantidade}`)
                    .join(', ')
                  : 'nenhum'}
              </Text>

              <Text style={styles.total}>
                Total: {formatarMoeda(total)}
              </Text>

              <Text style={styles.pix}>
                Pagar com Pix
              </Text>

              <View style={styles.qrContainer}>
                {qrCode ? (
                  <Image
                    source={{
                      uri: `data:image/png;base64,${qrCode}`,
                    }}
                    style={{
                      width: 180,
                      height: 180,
                    }}
                  />
                ) : (
                  <Text>Gerando PIX...</Text>
                )}
              </View>

              <Text
                selectable
                style={{
                  marginTop: 10,
                  fontSize: 12,
                  textAlign: 'center',
                }}
              >
                {pixCopiaECola}
              </Text>

              <TouchableOpacity
                style={styles.btnWhatsapp}
                onPress={async () => {
                  await Clipboard.setStringAsync(pixCopiaECola);
                  alert('PIX copiado!');
                }}
              >
                <Text style={styles.btnText}>
                  Copiar PIX
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.btnFechar}
                onPress={() => {
                  setMostrarResumo(false);
                  setCarrinho([]);
                }}
              >
                <Text style={styles.btnText}>
                  Fechar
                </Text>
              </TouchableOpacity>

            </View>
          </View>
        </Modal>

        <View style={styles.lista}>
          {produtos.map((produto, index) => (
            <ThemedView key={index} style={styles.card}>

              <View>
                <Image
                  source={{
                    uri:
                      produto.imagem_url ||
                      'https://via.placeholder.com/300/e0e0e0/969696?text=Sem+Imagem',
                  }}
                  style={styles.img}
                  resizeMode="cover"
                />

                <Text style={styles.nome}>
                  {produto.nome}
                </Text>

                <Text
                  style={styles.desc}
                  numberOfLines={2}
                >
                  {produto.descricao}
                </Text>
              </View>

              <View>
                <Text style={styles.preco}>
                  {formatarMoeda(Number(produto.preco))}
                </Text>

                <TouchableOpacity
                  style={styles.add}
                  onPress={() => adicionarAoCarrinho(produto)}
                >
                  <Text style={styles.btnText}>
                    + Adicionar
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.remove}
                  onPress={() => removerDoCarrinho(produto)}
                >
                  <Text style={styles.btnText}>
                    - Remover
                  </Text>
                </TouchableOpacity>
              </View>

            </ThemedView>
          ))}
        </View>

        <View style={styles.footer}>

          <TouchableOpacity
            style={[
              styles.btnFinalizar,
              (carrinho.length === 0 || loadingPedido) && {
                opacity: 0.5,
              },
            ]}
            disabled={carrinho.length === 0 || loadingPedido}
            onPress={finalizarPedido}
          >
            <Text style={styles.btnText}>
              {loadingPedido
                ? 'Processando...'
                : 'Finalizar Pedido'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.btnWhatsapp}
            onPress={enviarWhatsapp}
          >
            <Text style={styles.btnText}>
              Enviar no WhatsApp
            </Text>
          </TouchableOpacity>

        </View>

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },

  scrollContent: {
    padding: 16,
    paddingBottom: 120,
  },

  titulo: {
    textAlign: 'center',
    marginBottom: 10,
  },

  info: {
    textAlign: 'center',
    marginBottom: 10,
  },

  lista: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginTop: 20,
  },

  card: {
    width: '48%',
    backgroundColor: '#5e3030',
    padding: 10,
    borderRadius: 10,
    marginBottom: 15,
    minHeight: 300,
    justifyContent: 'space-between',
  },

  img: {
    width: '100%',
    height: 120,
    borderRadius: 10,
  },

  nome: {
    color: '#e6e1e1',
    fontWeight: 'bold',
    marginTop: 8,
  },

  desc: {
    color: '#e6e1e1',
    fontSize: 12,
    marginTop: 4,
    opacity: 0.8,
  },

  preco: {
    color: '#e6e1e1',
    fontWeight: 'bold',
    marginTop: 10,
    marginBottom: 8,
  },

  add: {
    backgroundColor: '#48704a',
    padding: 8,
    borderRadius: 6,
    marginTop: 5,
    alignItems: 'center',
  },

  remove: {
    backgroundColor: '#61170f',
    padding: 8,
    borderRadius: 6,
    marginTop: 5,
    alignItems: 'center',
  },

  btnText: {
    color: '#fff',
    fontWeight: 'bold',
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },

  bottomSheet: {
    backgroundColor: '#fff',
    padding: 20,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    minHeight: '50%',
  },

  resumoTitulo: {
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
    fontSize: 18,
  },

  total: {
    fontWeight: 'bold',
    marginTop: 10,
    fontSize: 16,
  },

  pix: {
    fontWeight: 'bold',
    marginTop: 15,
    textAlign: 'center',
  },

  qrContainer: {
    alignItems: 'center',
    marginVertical: 15,
  },

  btnFinalizar: {
    backgroundColor: '#2ecc71',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 10,
  },

  btnWhatsapp: {
    backgroundColor: '#25D366',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },

  btnFechar: {
    backgroundColor: '#999',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },

  footer: {
    marginTop: 30,
    paddingBottom: 20,
  },
});