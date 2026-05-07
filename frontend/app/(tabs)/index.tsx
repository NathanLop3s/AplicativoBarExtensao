import { ThemedView } from '@/components/themed-view';
import { ThemedText } from '@/components/themed-text';
import { useRouter } from 'expo-router';
import {
  removerToken,
  removerUsuario,
} from '@/services/storage';

import {
  TouchableOpacity,
  Text,
  StyleSheet,
} from 'react-native';

export default function HomeScreen() {

  const router = useRouter();

  const handleLogout = async () => {
    
    await removerToken();
    await removerUsuario();

    router.replace('/login');
  };

  return (
    <ThemedView style={styles.container}>

      <ThemedText type="title">
        Bem-vindo 👋
      </ThemedText>

      <ThemedText>
        Use a aba Cardápio para fazer seu pedido
      </ThemedText>

      <TouchableOpacity
        style={styles.logout}
        onPress={handleLogout}
      >
        <Text style={styles.logoutText}>Sair</Text>
      </TouchableOpacity>



    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },

  logout: {
    backgroundColor: '#61170f',
    padding: 12,
    borderRadius: 8,
    marginBottom: 20,
    width: 150,
    alignItems: 'center',
  },

  logoutText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});