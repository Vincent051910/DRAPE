import { type Href, useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import {
  Dimensions,
  Image,
  Pressable,
  StyleSheet,
  View,
} from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AccentRule, Body, Heading, IconButton, Screen } from '@/components/ui';
import { colors, fonts, radii, spacing } from '@/constants/theme';
import { useApp } from '@/context/AppContext';
import {
  addMonths,
  buildMonthGrid,
  formatMonthTitle,
  isToday,
  weekdayLabels,
} from '@/lib/calendar';
import type { PlannedDay } from '@/types';

const CELL = (Dimensions.get('window').width - spacing.lg * 2) / 7;

export default function PlanScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { data } = useApp();
  const [month, setMonth] = useState(() => new Date());

  const planByDate = useMemo(() => {
    const map = new Map<string, PlannedDay>();
    for (const day of data.plannedDays) map.set(day.date, day);
    return map;
  }, [data.plannedDays]);

  const lookById = useMemo(() => {
    const map = new Map(data.looks.map((l) => [l.id, l]));
    return map;
  }, [data.looks]);

  const cells = useMemo(() => buildMonthGrid(month), [month]);

  return (
    <Screen padded={false} style={styles.screen}>
      <View style={[styles.header, { paddingTop: insets.top + spacing.md }]}>
        <View>
          <Heading>Plan</Heading>
          <AccentRule />
        </View>
        <View style={styles.monthNav}>
          <IconButton
            name="chevron-back"
            onPress={() => setMonth((m) => addMonths(m, -1))}
            color={colors.olive}
            size={22}
          />
          <Body style={styles.monthTitle}>{formatMonthTitle(month)}</Body>
          <IconButton
            name="chevron-forward"
            onPress={() => setMonth((m) => addMonths(m, 1))}
            color={colors.olive}
            size={22}
          />
        </View>
      </View>

      <Animated.View entering={FadeIn.duration(400)} style={styles.gridWrap}>
        <View style={styles.weekdayRow}>
          {weekdayLabels().map((label) => (
            <View key={label} style={styles.weekdayCell}>
              <Body style={styles.weekdayText}>{label}</Body>
            </View>
          ))}
        </View>

        <View style={styles.grid}>
          {cells.map((cell, index) => {
            if (!cell.inMonth || !cell.dateKey) {
              return <View key={`empty-${index}`} style={styles.cell} />;
            }

            const plan = planByDate.get(cell.dateKey);
            const look =
              plan?.lookId != null ? lookById.get(plan.lookId) : undefined;
            const today = isToday(cell.dateKey);
            const hasPlan = Boolean(
              plan && (plan.lookId || plan.garmentIds.length > 0 || plan.note)
            );

            return (
              <Pressable
                key={cell.dateKey}
                onPress={() =>
                  router.push(
                    `/plan-day?date=${encodeURIComponent(cell.dateKey!)}` as Href
                  )
                }
                style={[styles.cell, today && styles.cellToday]}
              >
                <Body style={[styles.dayNum, today && styles.dayNumToday]}>
                  {cell.day}
                </Body>
                {look ? (
                  <Image source={{ uri: look.resultUri }} style={styles.thumb} />
                ) : hasPlan ? (
                  <View style={styles.dots}>
                    {Array.from({
                      length: Math.min(plan?.garmentIds.length || 1, 3),
                    }).map((_, i) => (
                      <View key={i} style={styles.dot} />
                    ))}
                  </View>
                ) : (
                  <View style={styles.thumbPlaceholder} />
                )}
              </Pressable>
            );
          })}
        </View>

        <Body muted style={styles.hint}>
          Tap a day to assign a look or wardrobe pieces.
        </Body>
      </Animated.View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  header: {
    paddingHorizontal: spacing.lg,
    gap: spacing.md,
  },
  monthNav: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  monthTitle: {
    fontFamily: fonts.bodyMedium,
    fontSize: 15,
    letterSpacing: 0.3,
  },
  gridWrap: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    flex: 1,
  },
  weekdayRow: {
    flexDirection: 'row',
    marginBottom: spacing.sm,
  },
  weekdayCell: {
    width: CELL,
    alignItems: 'center',
  },
  weekdayText: {
    fontSize: 11,
    fontFamily: fonts.bodyMedium,
    color: colors.stoneMuted,
    letterSpacing: 0.4,
    textTransform: 'uppercase',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  cell: {
    width: CELL,
    height: CELL + 18,
    alignItems: 'center',
    paddingTop: 4,
    paddingBottom: 6,
    gap: 4,
  },
  cellToday: {
    backgroundColor: colors.oliveSoft,
    borderRadius: radii.md,
  },
  dayNum: {
    fontSize: 13,
    fontFamily: fonts.bodyMedium,
    color: colors.charcoal,
  },
  dayNumToday: {
    color: colors.olive,
  },
  thumb: {
    width: CELL - 18,
    height: CELL - 18,
    borderRadius: radii.sm,
    backgroundColor: colors.linen,
  },
  thumbPlaceholder: {
    width: CELL - 18,
    height: CELL - 18,
  },
  dots: {
    flexDirection: 'row',
    gap: 3,
    height: CELL - 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.olive,
  },
  hint: {
    marginTop: spacing.lg,
    fontSize: 13,
    textAlign: 'center',
  },
});
