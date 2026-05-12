import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    TextInput,
    Modal,
    Alert,
    ScrollView,
} from 'react-native';

import { API_URL } from '@/constants/config';
import { pegarToken } from '@/services/storage';

export default function AdminScreen() {

    const [produtos, setProdutos] = useState<any[]>([]);

    const [modalVisible, setModalVisible] = useState(false);

    const [editandoId, setEditandoId] = useState<number | null>(null);

    const [nome, setNome] = useState('');
    const [descricao, setDescricao] = useState('');
    const [preco, setPreco] = useState('');
    const [categoria, setCategoria] = useState('');
    const [imagemUrl, setImagemUrl] = useState('');

    useEffect(() => {
        buscarProdutos();
    }, []);

    const buscarProdutos = async () => {
        try {

            const token = await pegarToken();

            const response = await fetch(
                `${API_URL}/admin/produtos`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            const data = await response.json();
            if (Array.isArray(data)) {
                setProdutos(data);
            } else {
                setProdutos([]);
            }

        } catch (error) {
            console.error(error);
        }
    };

    const limparCampos = () => {
        setNome('');
        setDescricao('');
        setPreco('');
        setCategoria('');
        setImagemUrl('');
        setEditandoId(null);
    };

    const abrirCriar = () => {
        limparCampos();
        setModalVisible(true);
    };

    const abrirEditar = (produto: any) => {

        setNome(produto.nome);
        setDescricao(produto.descricao);
        setPreco(String(produto.preco));
        setCategoria(produto.categoria);
        setImagemUrl(produto.imagem_url);

        setEditandoId(produto.id);

        setModalVisible(true);
    };

    const salvarProduto = async () => {
        try {

            const token = await pegarToken();

            const body = {
                nome,
                descricao,
                preco: Number(preco),
                categoria,
                imagem_url: imagemUrl,
            };

            const url = editandoId
                ? `${API_URL}/admin/produtos/${editandoId}`
                : `${API_URL}/admin/produtos`;

            const method = editandoId ? 'PUT' : 'POST';

            const response = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(body),
            });

            const data = await response.json();

            if (!response.ok) {
                Alert.alert('Erro', data.erro || 'Erro ao salvar');
                return;
            }

            Alert.alert('Sucesso', data.mensagem);

            setModalVisible(false);

            limparCampos();

            buscarProdutos();

        } catch (error) {
            console.error(error);

            Alert.alert('Erro', 'Erro ao salvar produto');
        }
    };

    const deletarProduto = async (id: number) => {

        Alert.alert(
            'Excluir',
            'Deseja remover este produto?',
            [
                {
                    text: 'Cancelar',
                },
                {
                    text: 'Excluir',
                    style: 'destructive',
                    onPress: async () => {

                        try {

                            const token = await pegarToken();

                            const response = await fetch(
                                `${API_URL}/admin/produtos/${id}`,
                                {
                                    method: 'DELETE',
                                    headers: {
                                        Authorization: `Bearer ${token}`,
                                    },
                                }
                            );

                            const data = await response.json();

                            if (!response.ok) {
                                Alert.alert('Erro', data.erro);
                                return;
                            }

                            buscarProdutos();

                        } catch (error) {
                            console.error(error);
                        }
                    },
                },
            ]
        );
    };

    return (
        <ScrollView
            style={styles.container}
            contentContainerStyle={{ paddingBottom: 120 }}>

            <Text style={styles.titulo}>
                Painel Admin
            </Text>

            <TouchableOpacity
                style={styles.btnAdicionar}
                onPress={abrirCriar}
            >
                <Text style={styles.btnText}>
                    + Adicionar Produto
                </Text>
            </TouchableOpacity>

            {produtos.map((item) => (
                <View
                    key={item.id}
                    style={styles.card}
                >

                    <Text style={styles.nome}>
                        {item.nome}
                    </Text>

                    <Text style={styles.descricao}>
                        {item.descricao}
                    </Text>

                    <Text style={styles.preco}>
                        R$ {Number(item.preco).toFixed(2)}
                    </Text>

                    <View style={styles.botoes}>

                        <TouchableOpacity
                            style={styles.btnEditar}
                            onPress={() => abrirEditar(item)}
                        >
                            <Text style={styles.btnText}>
                                Editar
                            </Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.btnExcluir}
                            onPress={() => deletarProduto(item.id)}
                        >
                            <Text style={styles.btnText}>
                                Excluir
                            </Text>
                        </TouchableOpacity>

                    </View>

                </View>
            ))}

            <Modal
                visible={modalVisible}
                animationType="slide"
            >

                <View style={styles.modal}>

                    <Text style={styles.modalTitulo}>
                        {editandoId
                            ? 'Editar Produto'
                            : 'Novo Produto'}
                    </Text>

                    <TextInput
                        placeholder="Nome"
                        style={styles.input}
                        value={nome}
                        onChangeText={setNome}
                    />

                    <TextInput
                        placeholder="Descrição"
                        style={styles.input}
                        value={descricao}
                        onChangeText={setDescricao}
                    />

                    <TextInput
                        placeholder="Preço"
                        style={styles.input}
                        value={preco}
                        onChangeText={setPreco}
                        keyboardType="numeric"
                    />

                    <TextInput
                        placeholder="Categoria"
                        style={styles.input}
                        value={categoria}
                        onChangeText={setCategoria}
                    />

                    <TextInput
                        placeholder="URL da imagem"
                        style={styles.input}
                        value={imagemUrl}
                        onChangeText={setImagemUrl}
                    />

                    <TouchableOpacity
                        style={styles.btnSalvar}
                        onPress={salvarProduto}
                    >
                        <Text style={styles.btnText}>
                            Salvar
                        </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.btnCancelar}
                        onPress={() => {
                            setModalVisible(false);
                            limparCampos();
                        }}
                    >
                        <Text style={styles.btnText}>
                            Cancelar
                        </Text>
                    </TouchableOpacity>

                </View>

            </Modal>

        </ScrollView>);
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

    btnAdicionar: {
        backgroundColor: '#2ecc71',
        padding: 12,
        borderRadius: 8,
        alignItems: 'center',
        marginBottom: 20,
    },

    card: {
        backgroundColor: '#222',
        borderRadius: 10,
        padding: 12,
        marginBottom: 15,
    },

    imagem: {
        width: '100%',
        height: 180,
        borderRadius: 8,
        marginBottom: 10,
    },

    nome: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
    },

    descricao: {
        color: '#ccc',
        marginTop: 5,
    },

    preco: {
        color: '#2ecc71',
        marginTop: 10,
        fontWeight: 'bold',
    },

    botoes: {
        flexDirection: 'row',
        marginTop: 15,
        justifyContent: 'space-between',
    },

    btnEditar: {
        backgroundColor: '#3498db',
        padding: 10,
        borderRadius: 8,
        flex: 1,
        marginRight: 5,
        alignItems: 'center',
    },

    btnExcluir: {
        backgroundColor: '#e74c3c',
        padding: 10,
        borderRadius: 8,
        flex: 1,
        marginLeft: 5,
        alignItems: 'center',
    },

    btnSalvar: {
        backgroundColor: '#2ecc71',
        padding: 12,
        borderRadius: 8,
        alignItems: 'center',
        marginTop: 20,
    },

    btnCancelar: {
        backgroundColor: '#999',
        padding: 12,
        borderRadius: 8,
        alignItems: 'center',
        marginTop: 10,
    },

    btnText: {
        color: '#fff',
        fontWeight: 'bold',
    },

    modal: {
        flex: 1,
        backgroundColor: '#111',
        padding: 20,
        justifyContent: 'center',
    },

    modalTitulo: {
        color: '#fff',
        fontSize: 22,
        fontWeight: 'bold',
        marginBottom: 20,
        textAlign: 'center',
    },

    input: {
        backgroundColor: '#fff',
        borderRadius: 8,
        padding: 12,
        marginBottom: 10,
    },

});