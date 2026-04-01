import { useState } from 'react';
import { View, TextInput, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { API_URL } from '@/constants/config';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';

export default function Usuario() {
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [msg, setMsg] = useState('');

  const router = useRouter();

  const handleLogout = async () => {
    await AsyncStorage.removeItem('user');
    router.replace('/login');
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
        setMsg('Usuário criado com sucesso!');
        setNome('');
        setEmail('');
        setSenha('');
      } else {
        setMsg(data.erro);
      }

    } catch (error) {
    }
  };
  const handleLogin = async () => {
    try {
      const response = await fetch(`${API_URL}/usuario/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, senha }),
      });

      const data = await response.json();

      if (response.ok) {
        setMsg('Login realizado!');
        console.log('Usuário:', data.usuario);
      } else {
        setMsg(data.erro);
      }

    } catch (error) {
      setMsg('Erro ao conectar com o servidor');
    }
  };




  return (
    <View style={styles.container}>
      <Text style={styles.titulo}>Cadastro</Text>

      <View style={styles.card}>
        <TextInput
          placeholder="Nome"
          placeholderTextColor="#ccc"
          style={styles.input}
          value={nome}
          onChangeText={setNome}
        />

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

        <TouchableOpacity style={styles.botao} onPress={handleRegister}>
          <Text style={styles.botaoTexto}>Cadastrar</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.botao} onPress={handleLogin}>
          <Text style={styles.botaoTexto}>Login</Text>
        </TouchableOpacity>

        {msg ? <Text style={styles.msg}>{msg}</Text> : null}
      </View>
      <TouchableOpacity style={styles.botao} onPress={handleLogout}>
        <Text style={styles.botaoTexto}>Sair</Text>
      </TouchableOpacity>
    </View>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
    justifyContent: 'center',
    padding: 20,
  },
  titulo: {
    color: '#e6e1e1',
    fontSize: 22,
    textAlign: 'center',
    marginBottom: 20,
    fontWeight: 'bold',
  },
  card: {
    backgroundColor: '#5e3030',
    padding: 20,
    borderRadius: 10,
  },
  input: {
    backgroundColor: '#2a2a2a',
    color: '#fff',
    padding: 10,
    borderRadius: 6,
    marginBottom: 10,
  },
  botao: {
    backgroundColor: '#48704a',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  botaoTexto: {
    color: '#fff',
    fontWeight: 'bold',
  },
  msg: {
    color: '#fff',
    marginTop: 10,
    textAlign: 'center',
  },
});