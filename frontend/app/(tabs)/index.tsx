import { ThemedView } from '@/components/themed-view';
import { ThemedText } from '@/components/themed-text';
export default function HomeScreen() {
  return (
    <ThemedView style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <ThemedText type="title">Bem-vindo 👋</ThemedText>
      <ThemedText>Use a aba Cardápio para fazer seu pedido</ThemedText>
    </ThemedView>
  );
}