import { useState } from 'react';
import { View, TextInput, TouchableOpacity, Text, StyleSheet, StatusBar } from 'react-native';
import { useRouter } from 'expo-router';
import { API_URL } from '@/constants/config';
import { salvarToken, salvarUsuario, pegarToken } from '@/services/storage';

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
        if (!tokenSalvo) { setMsg('Erro ao salvar token'); return; }
        setTimeout(() => {
          if (data.usuario.admin) router.replace('/admin');
          else router.replace('/(tabs)');
        }, 300);
      } else {
        setMsg(data.erro);
      }
    } catch (error) {
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
        setNome(''); setEmail(''); setSenha('');
      } else {
        setMsg(data.erro);
      }
    } catch (error) {
      setMsg('Erro ao conectar');
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />

      {/* Brand mark */}
      <View style={styles.brandArea}>
        <View style={styles.logoRing}>
          <Text style={styles.logoChar}>B</Text>
        </View>
        <Text style={styles.brandName}>Bar Extensão</Text>
        <Text style={styles.brandTagline}>cardápio digital</Text>
      </View>

      {/* Divider */}
      <View style={styles.divider} />

      {/* Form */}
      <View style={styles.formArea}>
        <Text style={styles.formTitle}>
          {isCadastro ? 'Criar conta' : 'Entrar'}
        </Text>

        {isCadastro && (
          <View style={styles.inputWrapper}>
            <Text style={styles.label}>Nome</Text>
            <TextInput
              placeholder="Seu nome"
              placeholderTextColor="#4a3f2f"
              style={styles.input}
              value={nome}
              onChangeText={setNome}
            />
          </View>
        )}

        <View style={styles.inputWrapper}>
          <Text style={styles.label}>E-mail</Text>
          <TextInput
            placeholder="seu@email.com"
            placeholderTextColor="#4a3f2f"
            style={styles.input}
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
          />
        </View>

        <View style={styles.inputWrapper}>
          <Text style={styles.label}>Senha</Text>
          <TextInput
            placeholder="••••••••"
            placeholderTextColor="#4a3f2f"
            secureTextEntry
            style={styles.input}
            value={senha}
            onChangeText={setSenha}
          />
        </View>

        <TouchableOpacity
          style={styles.btnPrimary}
          onPress={isCadastro ? handleRegister : handleLogin}
          activeOpacity={0.85}
        >
          <Text style={styles.btnPrimaryText}>
            {isCadastro ? 'Criar conta' : 'Entrar'}
          </Text>
        </TouchableOpacity>

        {msg ? (
          <View style={styles.msgBox}>
            <Text style={styles.msgText}>{msg}</Text>
          </View>
        ) : null}

        <TouchableOpacity
          style={styles.switchBtn}
          onPress={() => { setIsCadastro(!isCadastro); setMsg(''); }}
        >
          <Text style={styles.switchText}>
            {isCadastro ? 'Já tem conta? ' : 'Não tem conta? '}
            <Text style={styles.switchTextAccent}>
              {isCadastro ? 'Entrar' : 'Cadastre-se'}
            </Text>
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0e0b08',
    justifyContent: 'center',
    paddingHorizontal: 28,
  },
  brandArea: {
    alignItems: 'center',
    marginBottom: 36,
  },
  logoRing: {
    width: 72,
    height: 72,
    borderRadius: 36,
    borderWidth: 1.5,
    borderColor: '#c9943a',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  logoChar: {
    color: '#c9943a',
    fontSize: 32,
    fontWeight: '300',
    letterSpacing: 2,
  },
  brandName: {
    color: '#f0e6d3',
    fontSize: 24,
    fontWeight: '300',
    letterSpacing: 4,
    textTransform: 'uppercase',
  },
  brandTagline: {
    color: '#6b5840',
    fontSize: 11,
    letterSpacing: 3,
    textTransform: 'uppercase',
    marginTop: 4,
  },
  divider: {
    height: 1,
    backgroundColor: '#2a2018',
    marginBottom: 36,
  },
  formArea: {},
  formTitle: {
    color: '#c9943a',
    fontSize: 13,
    letterSpacing: 3,
    textTransform: 'uppercase',
    marginBottom: 20,
  },
  inputWrapper: {
    marginBottom: 16,
  },
  label: {
    color: '#6b5840',
    fontSize: 11,
    letterSpacing: 2,
    textTransform: 'uppercase',
    marginBottom: 6,
  },
  input: {
    backgroundColor: '#17120c',
    color: '#f0e6d3',
    paddingHorizontal: 14,
    paddingVertical: 13,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#2a2018',
    fontSize: 15,
  },
  btnPrimary: {
    backgroundColor: '#c9943a',
    paddingVertical: 15,
    borderRadius: 6,
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 16,
  },
  btnPrimaryText: {
    color: '#0e0b08',
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
  msgBox: {
    backgroundColor: '#17120c',
    borderWidth: 1,
    borderColor: '#3d2a12',
    borderRadius: 6,
    padding: 10,
    marginBottom: 12,
  },
  msgText: {
    color: '#c9943a',
    textAlign: 'center',
    fontSize: 13,
  },
  switchBtn: {
    alignItems: 'center',
    paddingVertical: 8,
  },
  switchText: {
    color: '#6b5840',
    fontSize: 13,
  },
  switchTextAccent: {
    color: '#c9943a',
  },
});