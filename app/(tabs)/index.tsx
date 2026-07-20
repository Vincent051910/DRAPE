import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useEffect } from 'react';
import { Image, Pressable, StyleSheet, View } from 'react-native';
import Animated, {
  Easing,
  FadeIn,
  FadeInDown,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

import {
  AccentRule,
  Body,
  BrandTitle,
  PrimaryButton,
  Screen,
  SecondaryButton,
} from '@/components/ui';
import { colors, fonts, radii, spacing } from '@/constants/theme';
import { useApp } from '@/context/AppContext';
import { hasApiKey } from '@/lib/generate';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export default function HomeScreen() {
  const router = useRouter();
  const { data, likenessReady } = useApp();
  const latest = data.looks[0];
  const aiReady = hasApiKey();

  return (
    <Screen style={styles.screen}>
      <Animated.View entering={FadeIn.duration(550)} style={styles.header}>
        <View style={styles.headerText}>
          <BrandTitle size={42} />
          <AccentRule />
          <Body muted style={styles.sub}>
            Build a look from your likeness and wardrobe.
          </Body>
        </View>
        <ProfileEntry
          faceUri={data.likeness.faceUri}
          ready={likenessReady}
          onPress={() => router.push('/profile')}
        />
      </Animated.View>

      <Animated.View entering={FadeInDown.delay(80).duration(500)} style={styles.statusRow}>
        <StatusChip
          label="Likeness"
          ok={likenessReady}
          onPress={() => router.push('/profile')}
        />
        <StatusChip
          label={`${data.garments.length} pieces`}
          ok={data.garments.length > 0}
          onPress={() => router.push('/(tabs)/wardrobe')}
        />
        <StatusChip label={aiReady ? 'AI ready' : 'AI offline'} ok={aiReady} />
      </Animated.View>

      {latest ? (
        <Animated.View entering={FadeInDown.delay(160).duration(550)} style={styles.hero}>
          <Pressable
            onPress={() =>
              router.push({
                pathname: '/result',
                params: { uri: latest.resultUri, lookId: latest.id },
              })
            }
            style={styles.heroPress}
          >
            <Image source={{ uri: latest.resultUri }} style={styles.heroImage} />
            <LinearGradient
              colors={['transparent', 'rgba(26,26,24,0.7)']}
              style={styles.heroGradient}
            />
            <View style={styles.heroCaption}>
              <Body style={styles.heroCaptionText}>Latest look</Body>
              <Body style={styles.heroMood}>{latest.mood}</Body>
            </View>
          </Pressable>
        </Animated.View>
      ) : (
        <Animated.View entering={FadeInDown.delay(160).duration(550)} style={styles.emptyHero}>
          <View style={styles.emptyMark} />
          <Body muted style={styles.emptyText}>
            No looks yet. Capture your likeness, add clothes, then compose.
          </Body>
        </Animated.View>
      )}

      <Animated.View entering={FadeInDown.delay(240).duration(500)} style={styles.actions}>
        <PrimaryButton
          label="Compose a look"
          icon="sparkles"
          onPress={() => router.push('/(tabs)/create')}
        />
        <SecondaryButton
          label="Browse examples"
          icon="images-outline"
          onPress={() => router.push('/examples')}
        />
      </Animated.View>
    </Screen>
  );
}

function ProfileEntry({
  faceUri,
  ready,
  onPress,
}: {
  faceUri: string | null;
  ready: boolean;
  onPress: () => void;
}) {
  const scale = useSharedValue(1);
  const ring = useSharedValue(0);

  useEffect(() => {
    ring.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 1400, easing: Easing.out(Easing.quad) }),
        withTiming(0, { duration: 1400, easing: Easing.in(Easing.quad) })
      ),
      -1,
      false
    );
  }, [ring]);

  const pressStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const ringStyle = useAnimatedStyle(() => ({
    opacity: 0.25 + ring.value * 0.45,
    transform: [{ scale: 1 + ring.value * 0.14 }],
  }));

  return (
    <AnimatedPressable
      onPress={onPress}
      hitSlop={8}
      onPressIn={() => {
        scale.value = withSpring(0.92, { damping: 16, stiffness: 320 });
      }}
      onPressOut={() => {
        scale.value = withSpring(1, { damping: 14, stiffness: 260 });
      }}
      style={[styles.profileBtn, pressStyle]}
      accessibilityRole="button"
      accessibilityLabel="Open profile"
    >
      <Animated.View style={[styles.profileRing, ringStyle]} />
      <LinearGradient
        colors={['#5A7049', colors.olive, '#3A4A32']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.profileInner}
      >
        {faceUri ? (
          <Image source={{ uri: faceUri }} style={styles.profileFace} />
        ) : (
          <Ionicons name="person" size={22} color={colors.ivory} />
        )}
      </LinearGradient>
      {!ready ? <View style={styles.profileDot} /> : null}
    </AnimatedPressable>
  );
}

function StatusChip({
  label,
  ok,
  onPress,
}: {
  label: string;
  ok: boolean;
  onPress?: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={[styles.chip, ok ? styles.chipOk : styles.chipWarn]}
    >
      <View style={[styles.dot, ok ? styles.dotOk : styles.dotWarn]} />
      <Body style={styles.chipText}>{label}</Body>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  screen: {
    gap: spacing.lg,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  headerText: {
    flex: 1,
  },
  sub: {
    marginTop: spacing.md,
    maxWidth: 260,
  },
  profileBtn: {
    width: 52,
    height: 52,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  profileRing: {
    position: 'absolute',
    width: 52,
    height: 52,
    borderRadius: 26,
    borderWidth: 2,
    borderColor: colors.olive,
  },
  profileInner: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: colors.ivory,
  },
  profileFace: {
    width: '100%',
    height: '100%',
  },
  profileDot: {
    position: 'absolute',
    right: 2,
    bottom: 2,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#C4A35A',
    borderWidth: 2,
    borderColor: colors.ivory,
  },
  statusRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: radii.sm,
    backgroundColor: 'rgba(255,255,255,0.35)',
  },
  chipOk: {
    borderColor: colors.olive,
  },
  chipWarn: {
    borderColor: colors.mist,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  dotOk: {
    backgroundColor: colors.olive,
  },
  dotWarn: {
    backgroundColor: colors.stone,
  },
  chipText: {
    fontFamily: fonts.bodyMedium,
    fontSize: 12,
    color: colors.charcoal,
    letterSpacing: 0.2,
  },
  hero: {
    flex: 1,
    minHeight: 280,
    borderRadius: radii.md,
    overflow: 'hidden',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.mist,
  },
  heroPress: {
    flex: 1,
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  heroGradient: {
    ...StyleSheet.absoluteFillObject,
    top: '40%',
  },
  heroCaption: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    padding: spacing.md,
    gap: 2,
  },
  heroCaptionText: {
    color: colors.ivory,
    fontFamily: fonts.body,
    fontSize: 12,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    opacity: 0.85,
  },
  heroMood: {
    color: colors.ivory,
    fontFamily: fonts.display,
    fontSize: 22,
  },
  emptyHero: {
    flex: 1,
    minHeight: 220,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.mist,
    borderRadius: radii.md,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
    backgroundColor: 'rgba(255,255,255,0.28)',
    gap: spacing.md,
  },
  emptyMark: {
    width: 36,
    height: 1.5,
    backgroundColor: colors.olive,
  },
  emptyText: {
    textAlign: 'center',
    lineHeight: 22,
  },
  actions: {
    gap: spacing.sm,
  },
});
