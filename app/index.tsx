import { Redirect } from 'expo-router';
import { ActivityIndicator, View } from 'react-native';

import { colors } from '@/constants/theme';
import { useApp } from '@/context/AppContext';

export default function Gate() {
  const { ready, data, likenessReady } = useApp();

  if (!ready) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.ivory }}>
        <ActivityIndicator color={colors.olive} />
      </View>
    );
  }

  if (!data.onboardingComplete) {
    return <Redirect href="/onboarding" />;
  }

  if (!likenessReady) {
    return <Redirect href="/likeness" />;
  }

  return <Redirect href="/(tabs)" />;
}
