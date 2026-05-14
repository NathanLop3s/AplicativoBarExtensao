import React, { useState, useCallback } from 'react';
import {
  View, ScrollView, Image, Text, TouchableOpacity, StyleSheet, Modal, StatusBar,
} from 'react-native';
import * as Linking from 'expo-linking';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { API_URL } from '@/constants/config';
import { useRouter, useFocusEffect } from 'expo-router';
import { pegarToken, removerToken } from '@/services/storage';
import * as Clipboard from 'expo-clipboard';

export default function CardapioScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const [produtos, setProdutos] = useState<any[]>([]);
  const [carrinho, setCarrinho] = useState<any[]>([]);
  const [loadingPedido, setLoadingPedido] = useState(false);
  const [mostrarResumo, setMostrarResumo] = useState(false);
  const [pixCopiaECola, setPixCopiaECola] = useState('');
  const [qrCode, setQrCode] = useState('');

  const total = carrinho.reduce((acc, item) => acc + item.preco * item.quantidade, 0);
  const totalItens = carrinho.reduce((acc, item) => acc + item.quantidade, 0);

  useFocusEffect(useCallback(() => { fetchData(); }, []));

  const fetchData = async () => {
    try {
      const token = await pegarToken();
      if (!token) { router.replace('/login'); return; }
      const response = await fetch(`${API_URL}/produtos`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.status === 401) { await removerToken(); router.replace('/login'); return; }
      const data = await response.json();
      setProdutos(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Erro ao buscar produtos:', error);
    }
  };

  const formatarMoeda = (valor: number) =>
    valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

  const getQtd = (id: number) => carrinho.find(p => p.id === id)?.quantidade || 0;

  const adicionarAoCarrinho = (produto: any) => {
    setCarrinho(prev => {
      const existente = prev.find(p => p.id === produto.id);
      if (existente) return prev.map(p => p.id === produto.id ? { ...p, quantidade: p.quantidade + 1 } : p);
      return [...prev, { ...produto, quantidade: 1 }];
    });
  };

  const removerDoCarrinho = (produto: any) => {
    setCarrinho(prev => {
      const existente = prev.find(p => p.id === produto.id);
      if (!existente) return prev;
      if (existente.quantidade === 1) return prev.filter(p => p.id !== produto.id);
      return prev.map(p => p.id === produto.id ? { ...p, quantidade: p.quantidade - 1 } : p);
    });
  };

  const enviarWhatsapp = () => {
    const listaProdutos = carrinho.map(p => `${p.nome} x${p.quantidade}`).join(', ');
    const mensagem = `Olá, segue meu pedido:\n\nItens: ${totalItens}\nProdutos: ${listaProdutos || 'nenhum'}\nTotal: ${formatarMoeda(total)}`;
    Linking.openURL(`https://wa.me/5537999432706?text=${encodeURIComponent(mensagem)}`);
  };

  const finalizarPedido = async () => {
    setLoadingPedido(true);
    try {
      const token = await pegarToken();
      if (!token) { router.replace('/login'); return; }
      const items = carrinho.map(item => ({ produto_id: item.id, quantidade: item.quantidade }));
      const pedidoResponse = await fetch(`${API_URL}/pedidos`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ items }),
      });
      const pedidoData = await pedidoResponse.json();
      if (!pedidoResponse.ok) { alert(pedidoData.erro || 'Erro ao criar pedido'); return; }
      const pixResponse = await fetch(`${API_URL}/pagamento/pix`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ total, pedidoId: pedidoData.pedido_id }),
      });
      const pixData = await pixResponse.json();
      if (!pixResponse.ok) { alert(pixData.erro || 'Erro ao gerar PIX'); return; }
      setQrCode(pixData.qr_code_base64);
      setPixCopiaECola(pixData.qr_code);
      setMostrarResumo(true);
    } catch (error) {
      alert('Erro ao conectar com servidor');
    } finally {
      setLoadingPedido(false);
    }
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar barStyle="light-content" />

      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerEyebrow}>Bar Extensão</Text>
          <Text style={styles.headerTitle}>Cardápio</Text>
        </View>
        {totalItens > 0 && (
          <View style={styles.carrinhoChip}>
            <Text style={styles.carrinhoChipQtd}>{totalItens}</Text>
            <Text style={styles.carrinhoChipVal}>{formatarMoeda(total)}</Text>
          </View>
        )}
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Product grid */}
        <View style={styles.lista}>
          {produtos.map((produto) => {
            const qtd = getQtd(produto.id);
            return (
              <View key={produto.id} style={styles.card}>
                <Image
                  source={{ uri: produto.imagem_url || 'https://via.placeholder.com/300/1a1208/4a3f2f?text=' }}
                  style={styles.img}
                  resizeMode="cover"
                />
                {qtd > 0 && (
                  <View style={styles.badge}>
                    <Text style={styles.badgeText}>{qtd}</Text>
                  </View>
                )}
                <View style={styles.cardBody}>
                  <Text style={styles.nome} numberOfLines={1}>{produto.nome}</Text>
                  <Text style={styles.desc} numberOfLines={2}>{produto.descricao}</Text>
                  <Text style={styles.preco}>{formatarMoeda(Number(produto.preco))}</Text>
                  <View style={styles.cardActions}>
                    {qtd > 0 ? (
                      <>
                        <TouchableOpacity style={styles.actionBtn} onPress={() => removerDoCarrinho(produto)}>
                          <Text style={styles.actionBtnText}>−</Text>
                        </TouchableOpacity>
                        <Text style={styles.qtdText}>{qtd}</Text>
                        <TouchableOpacity style={[styles.actionBtn, styles.actionBtnActive]} onPress={() => adicionarAoCarrinho(produto)}>
                          <Text style={[styles.actionBtnText, styles.actionBtnTextActive]}>+</Text>
                        </TouchableOpacity>
                      </>
                    ) : (
                      <TouchableOpacity style={styles.addBtn} onPress={() => adicionarAoCarrinho(produto)}>
                        <Text style={styles.addBtnText}>+ Adicionar</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                </View>
              </View>
            );
          })}
        </View>

        {/* Footer actions */}
        {carrinho.length > 0 && (
          <View style={styles.footer}>
            <TouchableOpacity
              style={[styles.btnFinalizar, loadingPedido && styles.btnDisabled]}
              disabled={loadingPedido}
              onPress={finalizarPedido}
              activeOpacity={0.85}
            >
              <Text style={styles.btnFinalizarText}>
                {loadingPedido ? 'Processando...' : `Finalizar pedido · ${formatarMoeda(total)}`}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.btnWhatsapp} onPress={enviarWhatsapp} activeOpacity={0.85}>
              <Text style={styles.btnWhatsappText}>Enviar no WhatsApp</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>

      {/* PIX Modal */}
      <Modal visible={mostrarResumo} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.bottomSheet}>
            <View style={styles.sheetHandle} />

            <Text style={styles.sheetEyebrow}>Pedido realizado</Text>
            <Text style={styles.sheetTitle}>Pagar com PIX</Text>

            <View style={styles.resumoRow}>
              <Text style={styles.resumoLabel}>Itens</Text>
              <Text style={styles.resumoVal}>{totalItens}</Text>
            </View>
            <View style={styles.resumoRow}>
              <Text style={styles.resumoLabel}>Total</Text>
              <Text style={styles.resumoValDestaque}>{formatarMoeda(total)}</Text>
            </View>

            <View style={styles.qrContainer}>
              {qrCode ? (
                <Image source={{ uri: `data:image/png;base64,${qrCode}` }} style={styles.qrImg} />
              ) : (
                <View style={styles.qrPlaceholder}>
                  <Text style={styles.qrPlaceholderText}>Gerando PIX...</Text>
                </View>
              )}
            </View>

            {pixCopiaECola ? (
              <Text style={styles.pixCopiaECola} selectable numberOfLines={2}>{pixCopiaECola}</Text>
            ) : null}

            <TouchableOpacity
              style={styles.btnCopiarPix}
              onPress={async () => { await Clipboard.setStringAsync(pixCopiaECola); alert('PIX copiado!'); }}
              activeOpacity={0.85}
            >
              <Text style={styles.btnCopiarPixText}>Copiar código PIX</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.btnFechar}
              onPress={() => { setMostrarResumo(false); setCarrinho([]); }}
              activeOpacity={0.85}
            >
              <Text style={styles.btnFecharText}>Fechar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0e0b08' },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#1e1810',
  },
  headerEyebrow: { color: '#6b5840', fontSize: 10, letterSpacing: 3, textTransform: 'uppercase' },
  headerTitle: { color: '#f0e6d3', fontSize: 22, fontWeight: '300', letterSpacing: 1, marginTop: 2 },
  carrinhoChip: {
    backgroundColor: '#c9943a',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
    alignItems: 'center',
  },
  carrinhoChipQtd: { color: '#0e0b08', fontSize: 10, fontWeight: '800', letterSpacing: 1 },
  carrinhoChipVal: { color: '#0e0b08', fontSize: 12, fontWeight: '700' },
  scrollContent: { padding: 16, paddingBottom: 40 },
  lista: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', gap: 12 },
  card: {
    width: '47.5%',
    backgroundColor: '#17120c',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#2a2018',
    overflow: 'hidden',
  },
  img: { width: '100%', height: 110 },
  badge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: '#c9943a',
    borderRadius: 12,
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: { color: '#0e0b08', fontSize: 11, fontWeight: '800' },
  cardBody: { padding: 10 },
  nome: { color: '#f0e6d3', fontSize: 13, fontWeight: '600', marginBottom: 3 },
  desc: { color: '#6b5840', fontSize: 11, lineHeight: 15, marginBottom: 8 },
  preco: { color: '#c9943a', fontSize: 14, fontWeight: '700', marginBottom: 10 },
  cardActions: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  addBtn: {
    flex: 1,
    backgroundColor: '#c9943a',
    borderRadius: 5,
    paddingVertical: 7,
    alignItems: 'center',
  },
  addBtnText: { color: '#0e0b08', fontSize: 11, fontWeight: '700' },
  actionBtn: {
    width: 28,
    height: 28,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: '#2a2018',
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionBtnActive: { backgroundColor: '#c9943a', borderColor: '#c9943a' },
  actionBtnText: { color: '#f0e6d3', fontSize: 16, fontWeight: '400', lineHeight: 20 },
  actionBtnTextActive: { color: '#0e0b08' },
  qtdText: { color: '#f0e6d3', fontSize: 14, fontWeight: '600', minWidth: 16, textAlign: 'center' },
  footer: { marginTop: 24, gap: 10 },
  btnFinalizar: {
    backgroundColor: '#c9943a',
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  btnDisabled: { opacity: 0.5 },
  btnFinalizarText: { color: '#0e0b08', fontSize: 13, fontWeight: '700', letterSpacing: 0.5 },
  btnWhatsapp: {
    backgroundColor: '#17120c',
    borderWidth: 1,
    borderColor: '#25D366',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  btnWhatsappText: { color: '#25D366', fontSize: 13, fontWeight: '600' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'flex-end' },
  bottomSheet: {
    backgroundColor: '#17120c',
    paddingHorizontal: 24,
    paddingBottom: 36,
    paddingTop: 16,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    borderTopWidth: 1,
    borderColor: '#2a2018',
  },
  sheetHandle: {
    width: 36,
    height: 3,
    backgroundColor: '#2a2018',
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 20,
  },
  sheetEyebrow: { color: '#6b5840', fontSize: 10, letterSpacing: 3, textTransform: 'uppercase', marginBottom: 4 },
  sheetTitle: { color: '#f0e6d3', fontSize: 22, fontWeight: '300', letterSpacing: 1, marginBottom: 20 },
  resumoRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  resumoLabel: { color: '#6b5840', fontSize: 13 },
  resumoVal: { color: '#f0e6d3', fontSize: 13, fontWeight: '600' },
  resumoValDestaque: { color: '#c9943a', fontSize: 16, fontWeight: '700' },
  qrContainer: { alignItems: 'center', marginVertical: 20 },
  qrImg: { width: 180, height: 180, borderRadius: 6 },
  qrPlaceholder: {
    width: 180,
    height: 180,
    backgroundColor: '#0e0b08',
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#2a2018',
  },
  qrPlaceholderText: { color: '#6b5840', fontSize: 12 },
  pixCopiaECola: {
    color: '#6b5840',
    fontSize: 11,
    textAlign: 'center',
    marginBottom: 16,
    lineHeight: 16,
  },
  btnCopiarPix: {
    backgroundColor: '#c9943a',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 10,
  },
  btnCopiarPixText: { color: '#0e0b08', fontSize: 13, fontWeight: '700', letterSpacing: 0.5 },
  btnFechar: {
    borderWidth: 1,
    borderColor: '#2a2018',
    paddingVertical: 13,
    borderRadius: 8,
    alignItems: 'center',
  },
  btnFecharText: { color: '#6b5840', fontSize: 13 },
});