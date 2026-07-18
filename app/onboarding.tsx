import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { ImageBackground, StyleSheet, View } from 'react-native';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Body, BrandTitle, PrimaryButton } from '@/components/ui';
import { colors, fonts, spacing } from '@/constants/theme';
import { useApp } from '@/context/AppContext';

const HERO =
  'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=1200&q=80';

export default function OnboardingScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { completeOnboarding } = useApp();

  const onStart = async () => {
    await completeOnboarding();
    router.replace('/likeness');
  };

  return (
    <View style={styles.root}>
      <ImageBackground source={{ uri: HERO }} style={StyleSheet.absoluteFill} resizeMode="cover">
        <LinearGradient
          colors={['rgba(26,26,24,0.15)', 'rgba(26,26,24,0.72)']}
          style={StyleSheet.absoluteFill}
        />
      </ImageBackground>

      <View style={[styles.content, { paddingTop: insets.top + spacing.xl, paddingBottom: insets.bottom + spacing.lg }]}>
        <Animated.View entering={FadeIn.duration(800)}>
          <BrandTitle color={colors.ivory} size={56} />
        </Animated.View>

        <View style={styles.bottom}>
          <Animated.View entering={FadeInDown.delay(200).duration(700)}>
            <Body style={styles.tagline}>
              Your likeness. Your clothes. One polished look.
            </Body>
          </Animated.View>
          <Animated.View entering={FadeInDown.delay(400).duration(700)}>
            <PrimaryButton label="Create your look" onPress={onStart} />
          </Animated.View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.charcoal,
  },
  content: {
    flex: 1,
    paddingHorizontal: spacing.lg,
    justifyContent: 'space-between',
  },
  bottom: {
    gap: spacing.lg,
  },
  tagline: {
    color: colors.ivory,
    fontFamily: fonts.body,
    fontSize: 17,
    lineHeight: 26,
    maxWidth: 280,
    marginBottom: spacing.sm,
  },
});
