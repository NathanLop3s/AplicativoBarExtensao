import React, { useState, useEffect } from 'react';
import { View, ScrollView, Image, Text, TouchableOpacity, StyleSheet, Modal } from 'react-native';
import * as Linking from 'expo-linking';
import QRCode from 'react-native-qrcode-svg';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { API_URL } from '@/constants/config';

export default function CardapioScreen() {
  const insets = useSafeAreaInsets();
  const [produtos, setProdutos] = useState<any[]>([]);
  const [carrinho, setCarrinho] = useState<string[]>([]);
  const [total, setTotal] = useState(0);
  const [mostrarResumo, setMostrarResumo] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const response = await fetch(`${API_URL}/produtos`);
      const data = await response.json();
      setProdutos(data);
    } catch (error) {
      console.error('Erro ao buscar produtos:', error);
    }
  };

  const formatarMoeda = (valor: number) => {
    return valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };

  const adicionarAoCarrinho = (produto: any) => {
    setCarrinho(prev => [...prev, produto.nome]);
    setTotal(prev => prev + Number(produto.preco));
  };

  const removerDoCarrinho = (produto: any) => {
    const index = carrinho.lastIndexOf(produto.nome);
    if (index !== -1) {
      const novoCarrinho = [...carrinho];
      novoCarrinho.splice(index, 1);
      setCarrinho(novoCarrinho);
      setTotal(prev => prev - Number(produto.preco));
    }
  };

  const enviarWhatsapp = () => {
    const mensagem = `Olá, segue meu pedido:\n\nItens: ${carrinho.length}\nProdutos: ${carrinho.length > 0 ? carrinho.join(', ') : 'nenhum'}\nTotal: ${formatarMoeda(total)}`;
    Linking.openURL(`https://wa.me/5537999432706?text=${encodeURIComponent(mensagem)}`);
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <ScrollView contentContainerStyle={styles.scrollContent}>

        <ThemedText type="title" style={styles.titulo}>Cardápio Digital</ThemedText>

        <ThemedText style={styles.info}>
          Carrinho: {carrinho.length} itens | Total: {formatarMoeda(total)}
        </ThemedText>

        <Modal visible={mostrarResumo} transparent animationType="slide">
          <View style={styles.modalOverlay}>
            <View style={styles.bottomSheet}>
              <Text style={styles.resumoTitulo}>Resumo do Pedido</Text>
              <Text>Itens: {carrinho.length}</Text>
              <Text>Produtos: {carrinho.length > 0 ? carrinho.join(', ') : 'nenhum'}</Text>
              <Text style={styles.total}>Total: {formatarMoeda(total)}</Text>

              <Text style={styles.pix}>Pagar com Pix</Text>
              <View style={styles.qrContainer}>
                <QRCode value={`Pagamento: ${total}`} size={180} />
              </View>

              <TouchableOpacity style={styles.btnWhatsapp} onPress={enviarWhatsapp}>
                <Text style={styles.btnText}>Enviar no WhatsApp</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.btnFechar} onPress={() => setMostrarResumo(false)}>
                <Text style={styles.btnText}>Fechar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

        <View style={styles.lista}>
          {produtos.map((produto, index) => (
            <ThemedView key={index} style={styles.card}>
              {/* BLOCO SUPERIOR: Imagem e Textos */}
              <View>
                <Image
                  source={{ uri: produto.imagem_url || 'https://via.placeholder.com/300/e0e0e0/969696?text=Sem+Imagem' }}
                  style={styles.img}
                  resizeMode="cover"
                />
                <Text style={styles.nome}>{produto.nome}</Text>
                <Text style={styles.desc} numberOfLines={2}>{produto.descricao}</Text>
              </View>

              {/* BLOCO INFERIOR: Preço e Ações */}
              <View>
                <Text style={styles.preco}>{formatarMoeda(Number(produto.preco))}</Text>

                <TouchableOpacity style={styles.add} onPress={() => adicionarAoCarrinho(produto)}>
                  <Text style={styles.btnText}>+ Adicionar</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.remove} onPress={() => removerDoCarrinho(produto)}>
                  <Text style={styles.btnText}>- Remover</Text>
                </TouchableOpacity>
              </View>
            </ThemedView>
          ))}
        </View>

        <View style={styles.footer}>
          <TouchableOpacity style={styles.btnFinalizar} onPress={() => setMostrarResumo(true)}>
            <Text style={styles.btnText}>Finalizar Pedido</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.btnWhatsapp} onPress={enviarWhatsapp}>
            <Text style={styles.btnText}>Enviar no WhatsApp</Text>
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
    minHeight: 300, // Aumentei um pouco para dar respiro
    justifyContent: 'space-between', // Alinha os blocos (topo e baixo)
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