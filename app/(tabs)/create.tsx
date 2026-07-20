import { useRouter } from 'expo-router';
import { Alert, Image, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';

import {
  AccentRule,
  Body,
  GhostButton,
  Heading,
  PrimaryButton,
  Screen,
  SectionLabel,
} from '@/components/ui';
import { colors, fonts, moods, radii, spacing, type Mood } from '@/constants/theme';
import { useApp } from '@/context/AppContext';
import { hasApiKey } from '@/lib/generate';

export default function CreateScreen() {
  const router = useRouter();
  const { data, setSelectedMood, likenessReady } = useApp();
  const selected = data.garments.filter((g) => data.selectedGarmentIds.includes(g.id));
  const aiReady = hasApiKey();

  const ensureReady = () => {
    if (!likenessReady) {
      Alert.alert('Likeness needed', 'Add a full-body and face photo first.', [
        { text: 'Set likeness', onPress: () => router.push('/profile') },
        { text: 'Cancel', style: 'cancel' },
      ]);
      return false;
    }
    if (!selected.length) {
      Alert.alert('Select clothes', 'Pick at least one piece from your wardrobe.', [
        { text: 'Wardrobe', onPress: () => router.push('/(tabs)/wardrobe') },
        { text: 'Cancel', style: 'cancel' },
      ]);
      return false;
    }
    return true;
  };

  const onGenerate = () => {
    if (!ensureReady()) return;
    if (!aiReady) {
      Alert.alert(
        'API key needed',
        'AI try-on needs a Gemini API key with image quota. Add EXPO_PUBLIC_GEMINI_API_KEY to .env and restart Expo.\n\nIf you see 429, free-tier image quota is often 0 — enable billing in AI Studio or wait/retry.\n\nCollage below does not need AI.',
        [{ text: 'OK' }]
      );
      return;
    }
    router.push('/generating');
  };

  const onCollage = () => {
    if (!ensureReady()) return;
    router.push({ pathname: '/generating', params: { mode: 'collage' } });
  };

  return (
    <Screen style={styles.screen}>
      <Animated.View entering={FadeIn.duration(450)}>
        <Heading>Compose</Heading>
        <AccentRule />
        <Body muted style={styles.sub}>
          Choose pieces and a mood, then generate an AI look or make a collage.
        </Body>
      </Animated.View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        <Animated.View entering={FadeInDown.delay(60).duration(450)}>
          <SectionLabel style={styles.sectionLabel}>Likeness</SectionLabel>
          <View style={styles.likenessRow}>
            <Thumb uri={data.likeness.bodyUri} label="Body" contain />
            <Thumb uri={data.likeness.faceUri} label="Face" />
          </View>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(120).duration(450)}>
          <SectionLabel style={styles.sectionLabel}>Selected pieces</SectionLabel>
          {selected.length ? (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.strip}>
              {selected.map((g) => (
                <View key={g.id} style={styles.stripItem}>
                  <View style={styles.stripImageWrap}>
                    <Image
                      source={{ uri: g.uri }}
                      style={styles.stripImage}
                      resizeMode="contain"
                    />
                  </View>
                  <Body style={styles.stripLabel}>{g.category}</Body>
                </View>
              ))}
            </ScrollView>
          ) : (
            <Pressable
              onPress={() => router.push('/(tabs)/wardrobe')}
              style={styles.emptyStrip}
            >
              <View style={styles.emptyMark} />
              <Body muted>Tap to select from wardrobe</Body>
            </Pressable>
          )}
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(180).duration(450)}>
          <SectionLabel style={styles.sectionLabel}>Mood</SectionLabel>
          <View style={styles.moodRow}>
            {moods.map((mood) => {
              const active = data.selectedMood === mood;
              return (
                <Pressable
                  key={mood}
                  onPress={() => setSelectedMood(mood as Mood)}
                  style={[styles.mood, active && styles.moodActive]}
                >
                  <Body style={[styles.moodText, active && styles.moodTextActive]}>{mood}</Body>
                </Pressable>
              );
            })}
          </View>

          <Body muted style={styles.aiStatus}>
            {aiReady ? 'AI ready' : 'AI offline — set EXPO_PUBLIC_GEMINI_API_KEY'}
          </Body>
        </Animated.View>
      </ScrollView>

      <PrimaryButton label="Generate look" icon="sparkles" onPress={onGenerate} />
      <GhostButton label="Make collage" onPress={onCollage} />
    </Screen>
  );
}

function Thumb({
  uri,
  label,
  contain,
}: {
  uri: string | null;
  label: string;
  contain?: boolean;
}) {
  return (
    <View style={styles.thumb}>
      {uri ? (
        <View style={styles.thumbImageWrap}>
          <Image
            source={{ uri }}
            style={styles.thumbImage}
            resizeMode={contain ? 'contain' : 'cover'}
          />
        </View>
      ) : (
        <View style={styles.thumbEmpty}>
          <Body muted style={{ fontSize: 12 }}>
            —
          </Body>
        </View>
      )}
      <Body style={styles.thumbLabel}>{label}</Body>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    gap: spacing.md,
  },
  sub: {
    marginTop: spacing.md,
    marginBottom: spacing.sm,
  },
  scroll: {
    gap: spacing.lg,
    paddingBottom: spacing.lg,
  },
  sectionLabel: {
    marginBottom: spacing.sm,
  },
  likenessRow: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  thumb: {
    width: 92,
  },
  thumbImageWrap: {
    width: 92,
    height: 114,
    borderRadius: radii.md,
    overflow: 'hidden',
    backgroundColor: colors.linen,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.mist,
  },
  thumbImage: {
    width: '100%',
    height: '100%',
  },
  thumbEmpty: {
    width: 92,
    height: 114,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.mist,
    borderRadius: radii.md,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.3)',
  },
  thumbLabel: {
    marginTop: 6,
    fontSize: 12,
    fontFamily: fonts.bodyMedium,
  },
  strip: {
    flexGrow: 0,
  },
  stripItem: {
    marginRight: spacing.sm,
    width: 100,
  },
  stripImageWrap: {
    width: 100,
    height: 124,
    backgroundColor: colors.linen,
    padding: 8,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radii.md,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.mist,
  },
  stripImage: {
    width: '100%',
    height: '100%',
  },
  stripLabel: {
    marginTop: 6,
    fontSize: 11,
    textTransform: 'capitalize',
    fontFamily: fonts.bodyMedium,
  },
  emptyStrip: {
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.mist,
    borderRadius: radii.md,
    padding: spacing.lg,
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.28)',
    gap: spacing.sm,
  },
  emptyMark: {
    width: 28,
    height: 1.5,
    backgroundColor: colors.olive,
  },
  moodRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  mood: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.mist,
    borderRadius: radii.sm,
    backgroundColor: 'rgba(255,255,255,0.25)',
  },
  moodActive: {
    borderColor: colors.olive,
    backgroundColor: colors.oliveSoft,
  },
  moodText: {
    fontSize: 15,
    color: colors.stoneMuted,
    fontFamily: fonts.body,
  },
  moodTextActive: {
    color: colors.charcoal,
    fontFamily: fonts.bodyMedium,
  },
  aiStatus: {
    fontSize: 11,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    marginTop: spacing.md,
  },
});
