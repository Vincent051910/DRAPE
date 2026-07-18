import { useRouter } from 'expo-router';
import { Image, Pressable, StyleSheet, View } from 'react-native';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';

import { Body, BrandTitle, GhostButton, PrimaryButton, Screen } from '@/components/ui';
import { colors, fonts, spacing } from '@/constants/theme';
import { useApp } from '@/context/AppContext';
import { hasApiKey } from '@/lib/generate';

export default function HomeScreen() {
  const router = useRouter();
  const { data, likenessReady } = useApp();
  const latest = data.looks[0];
  const aiReady = hasApiKey();

  return (
    <Screen style={styles.screen}>
      <Animated.View entering={FadeIn.duration(500)}>
        <BrandTitle size={40} />
        <Body muted style={styles.sub}>
          Build a look from your likeness and wardrobe.
        </Body>
      </Animated.View>

      <Animated.View entering={FadeInDown.delay(100).duration(500)} style={styles.statusRow}>
        <StatusChip
          label="Likeness"
          ok={likenessReady}
          onPress={() => router.push('/likeness')}
        />
        <StatusChip
          label={`${data.garments.length} pieces`}
          ok={data.garments.length > 0}
          onPress={() => router.push('/(tabs)/wardrobe')}
        />
        <StatusChip label={aiReady ? 'AI ready' : 'AI offline'} ok={aiReady} />
      </Animated.View>

      {latest ? (
        <Animated.View entering={FadeInDown.delay(200).duration(500)} style={styles.hero}>
          <Pressable onPress={() => router.push({ pathname: '/result', params: { uri: latest.resultUri, lookId: latest.id } })}>
            <Image source={{ uri: latest.resultUri }} style={styles.heroImage} />
            <View style={styles.heroCaption}>
              <Body style={styles.heroCaptionText}>Latest look · {latest.mood}</Body>
            </View>
          </Pressable>
        </Animated.View>
      ) : (
        <Animated.View entering={FadeInDown.delay(200).duration(500)} style={styles.emptyHero}>
          <Body muted style={{ textAlign: 'center' }}>
            No looks yet. Capture your likeness, add clothes, then compose.
          </Body>
        </Animated.View>
      )}

      <View style={styles.actions}>
        <PrimaryButton label="Compose a look" onPress={() => router.push('/(tabs)/create')} />
        <GhostButton label="Update likeness" onPress={() => router.push('/likeness')} />
      </View>
    </Screen>
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
    <Pressable onPress={onPress} style={[styles.chip, ok ? styles.chipOk : styles.chipWarn]}>
      <Body style={styles.chipText}>{label}</Body>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  screen: {
    gap: spacing.lg,
  },
  sub: {
    marginTop: spacing.sm,
  },
  statusRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderWidth: StyleSheet.hairlineWidth,
  },
  chipOk: {
    borderColor: colors.olive,
  },
  chipWarn: {
    borderColor: colors.stone,
  },
  chipText: {
    fontFamily: fonts.bodyMedium,
    fontSize: 12,
    color: colors.charcoal,
  },
  hero: {
    flex: 1,
    minHeight: 280,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.stone,
    overflow: 'hidden',
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  heroCaption: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    padding: spacing.md,
    backgroundColor: colors.overlay,
  },
  heroCaptionText: {
    color: colors.ivory,
    fontFamily: fonts.bodyMedium,
    fontSize: 13,
  },
  emptyHero: {
    flex: 1,
    minHeight: 220,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.stone,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
    backgroundColor: '#EFEBE4',
  },
  actions: {
    gap: spacing.sm,
  },
});
