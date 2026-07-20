import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import {
  AccentRule,
  Body,
  GhostButton,
  Heading,
  IconButton,
  PrimaryButton,
  Screen,
  SectionLabel,
} from '@/components/ui';
import { colors, fonts, radii, spacing } from '@/constants/theme';
import { useApp } from '@/context/AppContext';
import { formatDayTitle } from '@/lib/calendar';

export default function PlanDayScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { date } = useLocalSearchParams<{ date: string }>();
  const { data, getDayPlan, setDayPlan, clearDayPlan } = useApp();

  const existing = date ? getDayPlan(date) : undefined;
  const [lookId, setLookId] = useState<string | null>(existing?.lookId ?? null);
  const [garmentIds, setGarmentIds] = useState<string[]>(
    existing?.garmentIds ?? []
  );
  const [note, setNote] = useState(existing?.note ?? '');

  useEffect(() => {
    if (!date) return;
    const plan = getDayPlan(date);
    setLookId(plan?.lookId ?? null);
    setGarmentIds(plan?.garmentIds ?? []);
    setNote(plan?.note ?? '');
  }, [date, getDayPlan]);

  const selectedLook = useMemo(
    () => data.looks.find((l) => l.id === lookId),
    [data.looks, lookId]
  );

  if (!date) {
    return (
      <Screen>
        <Body>Missing date.</Body>
        <GhostButton label="Back" onPress={() => router.back()} />
      </Screen>
    );
  }

  const toggleGarment = (id: string) => {
    setGarmentIds((prev) =>
      prev.includes(id) ? prev.filter((g) => g !== id) : [...prev, id]
    );
  };

  const onSave = async () => {
    await setDayPlan(date, {
      lookId,
      garmentIds,
      note,
    });
    router.back();
  };

  const onClear = () => {
    Alert.alert('Clear this day?', 'Remove the planned look and pieces.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Clear',
        style: 'destructive',
        onPress: async () => {
          await clearDayPlan(date);
          router.back();
        },
      },
    ]);
  };

  return (
    <Screen padded={false} style={styles.screen}>
      <View style={[styles.topBar, { paddingTop: insets.top + spacing.sm }]}>
        <IconButton name="chevron-back" onPress={() => router.back()} />
        <View style={styles.topTitle}>
          <Heading style={styles.heading}>Plan day</Heading>
          <AccentRule />
        </View>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        contentContainerStyle={[
          styles.content,
          { paddingBottom: insets.bottom + spacing.xl },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View entering={FadeInDown.duration(400)}>
          <Body style={styles.dateTitle}>{formatDayTitle(date)}</Body>
          <Body muted style={styles.sub}>
            Assign a saved look, wardrobe pieces, or both.
          </Body>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(60).duration(400)}>
          <SectionLabel style={styles.section}>Saved look</SectionLabel>
          {data.looks.length === 0 ? (
            <View style={styles.emptyBox}>
              <Body muted>No saved looks yet. Generate or collage one first.</Body>
            </View>
          ) : (
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <Pressable
                onPress={() => setLookId(null)}
                style={[styles.lookCard, !lookId && styles.lookCardActive]}
              >
                <View style={styles.lookNone}>
                  <Body muted style={{ fontSize: 12 }}>
                    None
                  </Body>
                </View>
              </Pressable>
              {data.looks.map((look) => {
                const active = lookId === look.id;
                return (
                  <Pressable
                    key={look.id}
                    onPress={() => setLookId(look.id)}
                    style={[styles.lookCard, active && styles.lookCardActive]}
                  >
                    <Image
                      source={{ uri: look.resultUri }}
                      style={styles.lookImage}
                    />
                    <Body style={styles.lookLabel}>{look.mood}</Body>
                  </Pressable>
                );
              })}
            </ScrollView>
          )}
          {selectedLook ? (
            <Body muted style={styles.previewNote}>
              Day preview will use this look’s image.
            </Body>
          ) : null}
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(120).duration(400)}>
          <SectionLabel style={styles.section}>Wardrobe pieces</SectionLabel>
          {data.garments.length === 0 ? (
            <View style={styles.emptyBox}>
              <Body muted>Add pieces in Wardrobe to plan an outfit.</Body>
            </View>
          ) : (
            <View style={styles.garmentGrid}>
              {data.garments.map((g) => {
                const active = garmentIds.includes(g.id);
                return (
                  <Pressable
                    key={g.id}
                    onPress={() => toggleGarment(g.id)}
                    style={[styles.garmentTile, active && styles.garmentActive]}
                  >
                    <Image
                      source={{ uri: g.uri }}
                      style={styles.garmentImage}
                      resizeMode="contain"
                    />
                    <Body style={styles.garmentLabel}>{g.category}</Body>
                  </Pressable>
                );
              })}
            </View>
          )}
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(180).duration(400)}>
          <SectionLabel style={styles.section}>Note</SectionLabel>
          <TextInput
            value={note}
            onChangeText={setNote}
            placeholder="e.g. Client meeting"
            placeholderTextColor={colors.stoneMuted}
            style={styles.noteInput}
            maxLength={80}
          />
        </Animated.View>

        <View style={styles.actions}>
          <PrimaryButton label="Save plan" onPress={onSave} />
          {existing ? (
            <GhostButton label="Clear day" onPress={onClear} />
          ) : null}
        </View>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  topBar: {
    paddingHorizontal: spacing.lg,
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  topTitle: {
    alignItems: 'center',
  },
  heading: {
    fontSize: 28,
  },
  content: {
    paddingHorizontal: spacing.lg,
    gap: spacing.lg,
  },
  dateTitle: {
    fontFamily: fonts.display,
    fontSize: 22,
    marginBottom: spacing.xs,
  },
  sub: {
    marginBottom: spacing.sm,
  },
  section: {
    marginBottom: spacing.sm,
  },
  emptyBox: {
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.mist,
    borderRadius: radii.md,
    padding: spacing.lg,
    backgroundColor: 'rgba(255,255,255,0.3)',
  },
  lookCard: {
    width: 100,
    marginRight: spacing.sm,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.mist,
    borderRadius: radii.md,
    overflow: 'hidden',
    backgroundColor: 'rgba(255,255,255,0.3)',
  },
  lookCardActive: {
    borderColor: colors.olive,
    borderWidth: 1.5,
    backgroundColor: colors.oliveSoft,
  },
  lookNone: {
    width: 100,
    height: 120,
    alignItems: 'center',
    justifyContent: 'center',
  },
  lookImage: {
    width: 100,
    height: 120,
    backgroundColor: colors.linen,
  },
  lookLabel: {
    fontSize: 11,
    fontFamily: fonts.bodyMedium,
    padding: 6,
  },
  previewNote: {
    marginTop: spacing.sm,
    fontSize: 12,
  },
  garmentGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  garmentTile: {
    width: '30%',
    flexGrow: 1,
    maxWidth: '32%',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.mist,
    borderRadius: radii.md,
    overflow: 'hidden',
    backgroundColor: 'rgba(255,255,255,0.3)',
    paddingBottom: 6,
  },
  garmentActive: {
    borderColor: colors.olive,
    borderWidth: 1.5,
    backgroundColor: colors.oliveSoft,
  },
  garmentImage: {
    width: '100%',
    height: 96,
    backgroundColor: colors.linen,
  },
  garmentLabel: {
    fontSize: 11,
    fontFamily: fonts.bodyMedium,
    textTransform: 'capitalize',
    paddingHorizontal: 6,
    marginTop: 4,
  },
  noteInput: {
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.mist,
    borderRadius: radii.md,
    paddingHorizontal: spacing.md,
    paddingVertical: 12,
    fontFamily: fonts.body,
    fontSize: 15,
    color: colors.charcoal,
    backgroundColor: 'rgba(255,255,255,0.4)',
  },
  actions: {
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
});
