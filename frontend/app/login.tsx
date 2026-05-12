import { useState } from 'react';
import { View, TextInput, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { API_URL } from '@/constants/config';
import {
  salvarToken,
  salvarUsuario,
  pegarToken,
} from '@/services/storage';

export default function Login() {
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [msg, setMsg] = useState('');
  const [isCadastro, setIsCadastro] = useState(false);
  const [nome, setNome] = useState('');

  const handleLogin = async () => {
    try {
      const response = await fetch(`${API_URL}/usuario/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, senha }),
      });

      const data = await response.json();


      if (response.ok) {

        await salvarUsuario(data.usuario);
        await salvarToken(data.token);

        const tokenSalvo = await pegarToken();

        if (!tokenSalvo) {
          setMsg('Erro ao salvar token');
          return;
        }

        setTimeout(() => {

          if (data.usuario.admin) {
            router.replace('/admin');
          } else {
            router.replace('/(tabs)');
          }

        }, 300);

      } else {
        setMsg(data.erro);
      }

    } catch (error) {
      console.log('ERRO LOGIN:', error);
      setMsg('Erro ao conectar');
    }
  };

  const handleRegister = async () => {
    try {
      const response = await fetch(`${API_URL}/usuario/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nome, email, senha }),
      });

      const data = await response.json();

      if (response.ok) {
        setMsg('Conta criada com sucesso!');
        setIsCadastro(false);

        setNome('');
        setEmail('');
        setSenha('');
      } else {
        setMsg(data.erro);
      }

    } catch (error) {
      setMsg('Erro ao conectar');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.titulo}>
        {isCadastro ? 'Cadastro' : 'Login'}
      </Text>

      {isCadastro && (
        <TextInput
          placeholder="Nome"
          placeholderTextColor="#ccc"
          style={styles.input}
          value={nome}
          onChangeText={setNome}
        />
      )}
      <TextInput
        placeholder="Email"
        placeholderTextColor="#ccc"
        style={styles.input}
        value={email}
        onChangeText={setEmail}
      />

      <TextInput
        placeholder="Senha"
        placeholderTextColor="#ccc"
        secureTextEntry
        style={styles.input}
        value={senha}
        onChangeText={setSenha}
      />

      <TouchableOpacity
        style={styles.botao}
        onPress={isCadastro ? handleRegister : handleLogin}
      >
        <Text style={styles.botaoTexto}>
          {isCadastro ? 'Cadastrar' : 'Entrar'}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => setIsCadastro(!isCadastro)}>
        <Text style={styles.link}>
          {isCadastro
            ? 'Já tem conta? Entrar'
            : 'Não tem conta? Cadastre-se'}
        </Text>
      </TouchableOpacity>

      {msg ? <Text style={styles.msg}>{msg}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000', justifyContent: 'center', padding: 20 },
  titulo: { color: '#fff', fontSize: 22, textAlign: 'center', marginBottom: 20 },
  input: { backgroundColor: '#2a2a2a', color: '#fff', padding: 10, borderRadius: 6, marginBottom: 10 },
  botao: { backgroundColor: '#48704a', padding: 12, borderRadius: 8, alignItems: 'center' },
  botaoTexto: { color: '#fff', fontWeight: 'bold' },
  msg: { color: '#fff', marginTop: 10, textAlign: 'center' },
  link: { color: '#4da6ff', textAlign: 'center', marginTop: 15, },
});