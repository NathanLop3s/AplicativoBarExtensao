import React, { useState, useEffect } from 'react';
import { View, ScrollView, Image, Text, TouchableOpacity, StyleSheet, Button } from 'react-native';
import * as Linking from 'expo-linking';
import QRCode from 'react-native-qrcode-svg';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Modal } from 'react-native';

export default function CardapioScreen() {
  const [produtos, setProdutos] = useState<any[]>([]);
  const [carrinho, setCarrinho] = useState<string[]>([]);
  const [total, setTotal] = useState(0);
  const [mostrarResumo, setMostrarResumo] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const response = await fetch('http://192.168.18.100:3001/produtos');
      const data = await response.json();
      setProdutos(data);
    } catch (error) {
      console.error('Erro ao buscar produtos:', error);
    }
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
    Linking.openURL(
      'https://wa.me/5537999432706?text=' +
      encodeURIComponent(
        `Olá, segue meu pedido:\n\nItens: ${carrinho.length}\nProdutos: ${carrinho.length > 0 ? carrinho.join(', ') : 'nenhum'
        }\nTotal: R$ ${total}`
      )
    );
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 120 }}>

        <ThemedText type="title" style={styles.titulo}>
          Cardápio Digital
        </ThemedText>

        <ThemedText style={styles.info}>
          Carrinho: {carrinho.length} itens | Total: R$ {total},00
        </ThemedText>

        <Modal
          visible={mostrarResumo}
          transparent
          animationType="slide"
        >
          <View style={styles.modalOverlay}>

            <View style={styles.bottomSheet}>

              <Text style={styles.resumoTitulo}>Resumo do Pedido</Text>

              <Text>Itens: {carrinho.length}</Text>

              <Text>
                Produtos: {carrinho.length > 0 ? carrinho.join(', ') : 'nenhum'}
              </Text>

              <Text style={styles.total}>Total: R$ {total},00</Text>

              <Text style={styles.pix}>Pagar com Pix</Text>

              <View style={{ alignItems: 'center', marginVertical: 10 }}>
                <QRCode value={`Total R$ ${total}`} size={180} />
              </View>

              <TouchableOpacity
                style={styles.btnWhatsapp}
                onPress={enviarWhatsapp}
              >
                <Text style={styles.btnText}>Enviar no WhatsApp</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.btnFechar}
                onPress={() => setMostrarResumo(false)}
              >
                <Text style={styles.btnText}>Fechar</Text>
              </TouchableOpacity>

            </View>

          </View>
        </Modal>

        <View style={styles.lista}>
          {produtos.map((produto, index) => (
            <ThemedView key={index} style={styles.card}>
              <Image
                source={{
                  uri:
                    produto.imagem_url ||
                    'https://via.placeholder.com/300/e0e0e0/969696?text=Sem+Imagem',
                }}
                style={styles.img}
                resizeMode="cover"
              />

              <Text style={styles.nome}>{produto.nome}</Text>
              <Text style={styles.desc}>{produto.descricao}</Text>
              <Text style={styles.preco}>
                R$ {Number(produto.preco).toFixed(2)}
              </Text>

              <TouchableOpacity
                style={styles.add}
                onPress={() => adicionarAoCarrinho(produto)}
              >
                <Text style={styles.btnText}>+ Adicionar</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.remove}
                onPress={() => removerDoCarrinho(produto)}
              >
                <Text style={styles.btnText}>- Remover</Text>
              </TouchableOpacity>
            </ThemedView>
          ))}
        </View>

        <View style={styles.footer}>
          <TouchableOpacity
            style={styles.btnFinalizar}
            onPress={() => setMostrarResumo(true)}
          >
            <Text style={styles.btnText}>Finalizar Pedido</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.btnWhatsapp}
            onPress={enviarWhatsapp}
          >
            <Text style={styles.btnText}>Enviar no WhatsApp</Text>
          </TouchableOpacity>
        </View>

      </ScrollView>


    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
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
    backgroundColor: '#f2f2f2',
    padding: 10,
    borderRadius: 10,
    marginBottom: 15,
  },

  img: {
    width: '100%',
    height: 120,
    borderRadius: 10,
  },

  nome: {
    color: '#000',
    fontWeight: 'bold',
    marginTop: 5,
  },

  desc: {
    color: '#333',
  },

  preco: {
    color: '#000',
    fontWeight: 'bold',
    marginBottom: 8,
  },

  add: {
    backgroundColor: '#2ecc71',
    padding: 8,
    borderRadius: 6,
    marginTop: 5,
    alignItems: 'center',
  },

  remove: {
    backgroundColor: '#e74c3c',
    padding: 8,
    borderRadius: 6,
    marginTop: 5,
    alignItems: 'center',
  },

  btnText: {
    color: '#fff',
    fontWeight: 'bold',
  },

  resumo: {
    backgroundColor: '#fff',
    padding: 10,
    marginTop: 15,
    borderRadius: 8,
  },

  resumoTitulo: {
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
  },

  total: {
    fontWeight: 'bold',
    marginTop: 5,
  },

  pix: {
    fontWeight: 'bold',
    marginTop: 10,
  },

  botoesContainer: {
    marginTop: 20,
    marginBottom: 30,
    width: '100%',
    marginHorizontal: -16,
    paddingHorizontal: 16,
    alignSelf: 'stretch',
    backgroundColor: '#fff',
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

  footer: {
    marginTop: 20,
    marginBottom: 30,
    marginHorizontal: -16,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end', // 🔥 faz vir de baixo
  },

  bottomSheet: {
    backgroundColor: '#fff',
    padding: 20,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    minHeight: '50%',
  },

  btnFechar: {
    backgroundColor: '#999',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
});