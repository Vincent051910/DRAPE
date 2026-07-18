import { Link, Stack } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { Body, Heading } from '@/components/ui';
import { colors, spacing } from '@/constants/theme';

export default function NotFoundScreen() {
  return (
    <>
      <Stack.Screen options={{ title: 'Not found', headerShown: true }} />
      <View style={styles.container}>
        <Heading>Lost thread</Heading>
        <Body muted style={{ marginTop: spacing.sm }}>
          This screen does not exist.
        </Body>
        <Link href="/" style={styles.link}>
          <Body style={{ color: colors.olive }}>Go home</Body>
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
    padding: spacing.lg,
    backgroundColor: colors.ivory,
  },
  link: {
    marginTop: spacing.lg,
  },
});
