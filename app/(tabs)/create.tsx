import { useRouter } from 'expo-router';
import { Alert, Image, Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { Body, Heading, PrimaryButton, Screen } from '@/components/ui';
import { colors, fonts, moods, spacing, type Mood } from '@/constants/theme';
import { useApp } from '@/context/AppContext';
import { hasApiKey } from '@/lib/generate';

export default function CreateScreen() {
  const router = useRouter();
  const { data, setSelectedMood, likenessReady } = useApp();
  const selected = data.garments.filter((g) => data.selectedGarmentIds.includes(g.id));
  const aiReady = hasApiKey();

  const onGenerate = () => {
    if (!likenessReady) {
      Alert.alert('Likeness needed', 'Add a full-body and face photo first.', [
        { text: 'Set likeness', onPress: () => router.push('/likeness') },
        { text: 'Cancel', style: 'cancel' },
      ]);
      return;
    }
    if (!selected.length) {
      Alert.alert('Select clothes', 'Pick at least one piece from your wardrobe.', [
        { text: 'Wardrobe', onPress: () => router.push('/(tabs)/wardrobe') },
        { text: 'Cancel', style: 'cancel' },
      ]);
      return;
    }
    if (!aiReady) {
      Alert.alert(
        'API key needed',
        'Add EXPO_PUBLIC_GEMINI_API_KEY to a .env file in the project root, then restart Expo.\n\nYou can still preview a local collage fallback.',
        [
          {
            text: 'Use collage preview',
            onPress: () =>
              router.push({ pathname: '/generating', params: { fallback: '1' } }),
          },
          { text: 'Cancel', style: 'cancel' },
        ]
      );
      return;
    }
    router.push('/generating');
  };

  return (
    <Screen style={styles.screen}>
      <Heading>Compose</Heading>
      <Body muted style={styles.sub}>
        Choose pieces and a mood, then generate your look.
      </Body>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        <Body style={styles.sectionLabel}>Likeness</Body>
        <View style={styles.likenessRow}>
          <Thumb uri={data.likeness.bodyUri} label="Body" />
          <Thumb uri={data.likeness.faceUri} label="Face" />
        </View>

        <Body style={styles.sectionLabel}>Selected pieces</Body>
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
          <Pressable onPress={() => router.push('/(tabs)/wardrobe')} style={styles.emptyStrip}>
            <Body muted>Tap to select from wardrobe</Body>
          </Pressable>
        )}

        <Body style={styles.sectionLabel}>Mood</Body>
        <View style={styles.moodRow}>
          {moods.map((mood) => {
            const active = data.selectedMood === mood;
            return (
              <Pressable key={mood} onPress={() => setSelectedMood(mood as Mood)} style={styles.mood}>
                <Body style={[styles.moodText, active && styles.moodTextActive]}>{mood}</Body>
                {active ? <View style={styles.moodLine} /> : <View style={styles.moodSpacer} />}
              </Pressable>
            );
          })}
        </View>

        <Body muted style={styles.aiStatus}>
          {aiReady ? 'AI ready' : 'AI offline — set EXPO_PUBLIC_GEMINI_API_KEY'}
        </Body>
      </ScrollView>

      <PrimaryButton label="Generate look" onPress={onGenerate} />
    </Screen>
  );
}

function Thumb({ uri, label }: { uri: string | null; label: string }) {
  return (
    <View style={styles.thumb}>
      {uri ? (
        <Image source={{ uri }} style={styles.thumbImage} />
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
    marginBottom: spacing.sm,
  },
  scroll: {
    gap: spacing.md,
    paddingBottom: spacing.lg,
  },
  sectionLabel: {
    fontFamily: fonts.bodyMedium,
    fontSize: 13,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    color: colors.stoneMuted,
    marginTop: spacing.sm,
  },
  likenessRow: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  thumb: {
    width: 88,
  },
  thumbImage: {
    width: 88,
    height: 110,
    backgroundColor: '#EFEBE4',
  },
  thumbEmpty: {
    width: 88,
    height: 110,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.stone,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#EFEBE4',
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
    width: 96,
  },
  stripImageWrap: {
    width: 96,
    height: 120,
    backgroundColor: '#EFEBE4',
    padding: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stripImage: {
    width: '100%',
    height: '100%',
  },
  stripLabel: {
    marginTop: 4,
    fontSize: 11,
    textTransform: 'capitalize',
    fontFamily: fonts.bodyMedium,
  },
  emptyStrip: {
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.stone,
    padding: spacing.lg,
    alignItems: 'center',
    backgroundColor: '#EFEBE4',
  },
  moodRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  mood: {
    paddingBottom: 2,
  },
  moodText: {
    fontSize: 16,
    color: colors.stoneMuted,
    fontFamily: fonts.body,
  },
  moodTextActive: {
    color: colors.charcoal,
    fontFamily: fonts.bodyMedium,
  },
  moodLine: {
    marginTop: 4,
    height: 1.5,
    backgroundColor: colors.olive,
  },
  moodSpacer: {
    marginTop: 4,
    height: 1.5,
  },
  aiStatus: {
    fontSize: 12,
    letterSpacing: 0.6,
    textTransform: 'uppercase',
    marginTop: spacing.sm,
  },
});
