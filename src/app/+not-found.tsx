import { Link, Stack } from 'expo-router';
import { StyleSheet } from 'react-native';

import { Fragment } from 'react';
import { VStack } from '@/components/ui/vstack';
import { Text } from '@/components/ui/text';

export default function NotFoundScreen() {
  return (
    <Fragment>
      <Stack.Screen options={{ title: 'Oops!' }} />
      <VStack style={styles.container}>
        <Text style={styles.title}>This screen doesn't exist.</Text>

        <Link href="../" style={styles.link}>
          <Text style={styles.linkText}>Go to home screen!</Text>
        </Link>
      </VStack>
    </Fragment>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  link: {
    marginTop: 15,
    paddingVertical: 15,
  },
  linkText: {
    fontSize: 14,
    color: '#2e78b7',
  },
});
