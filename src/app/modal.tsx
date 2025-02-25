import { Box } from '@/components/ui/box';
import { Text } from '@/components/ui/text';
import { VStack } from '@/components/ui/vstack';
import { StatusBar } from 'expo-status-bar';
import { Platform, StyleSheet } from 'react-native';


export default function ModalScreen() {
  return (
    <VStack style={styles.container}>
      <Text style={styles.title}>Modal</Text>
      <Box style={styles.separator} />
      <StatusBar style={Platform.OS === 'ios' ? 'light' : 'auto'} />
    </VStack>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  separator: {
    marginVertical: 30,
    height: 1,
    width: '80%',
  },
});
