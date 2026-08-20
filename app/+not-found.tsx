import { Link, Stack } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';

import { Design } from '@/constants/Design';

export default function NotFoundScreen() {
  return (
    <>
      <Stack.Screen options={{ title: 'Oops!' }} />
      <View style={styles.container}>
        <Text style={styles.title}>Page not found</Text>
        <Text style={styles.message}>
          Sorry, we couldn&apos;t find that screen. Tap below to return home.
        </Text>
        <Link href="/" style={styles.link}>
          <Text style={styles.linkText}>Go to home screen</Text>
        </Link>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: Design.spacing.lg,
    backgroundColor: Design.colors.background.medium,
  },
  title: {
    fontSize: Design.typography.sizes.xl,
    fontWeight: Design.typography.weights.bold,
    color: Design.colors.text.primary,
  },
  message: {
    marginTop: Design.spacing.md,
    fontSize: Design.typography.sizes.md,
    color: Design.colors.text.secondary,
    textAlign: 'center',
  },
  link: {
    marginTop: Design.spacing.lg,
    paddingVertical: Design.spacing.md,
  },
  linkText: {
    fontSize: Design.typography.sizes.md,
    fontWeight: Design.typography.weights.semibold,
    color: Design.colors.primary,
  },
});
