import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Image, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import {
  AccentRule,
  Body,
  Heading,
  IconButton,
  PrimaryButton,
  Screen,
  SectionLabel,
} from '@/components/ui';
import { colors, fonts, radii, spacing } from '@/constants/theme';
import { useApp } from '@/context/AppContext';
import { hasApiKey } from '@/lib/generate';

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { data, likenessReady } = useApp();
  const aiReady = hasApiKey();
  const plannedCount = data.plannedDays.length;

  return (
    <Screen padded={false} style={styles.screen}>
      <ScrollView
        contentContainerStyle={[
          styles.content,
          {
            paddingTop: insets.top + spacing.md,
            paddingBottom: Math.max(insets.bottom, spacing.lg) + spacing.xl,
          },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View entering={FadeIn.duration(450)}>
          <View style={styles.headerRow}>
            <View style={styles.headerText}>
              <Heading>Profile</Heading>
              <AccentRule />
            </View>
            <IconButton name="close" onPress={() => router.back()} />
          </View>
          <Body muted style={styles.sub}>
            Your likeness and account snapshot.
          </Body>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(60).duration(450)} style={styles.likenessCard}>
          <SectionLabel>Likeness</SectionLabel>
          <View style={styles.photoRow}>
            <PhotoTile
              uri={data.likeness.bodyUri}
              label="Full body"
              empty="Add body"
              contain
            />
            <PhotoTile
              uri={data.likeness.faceUri}
              label="Face"
              empty="Add face"
            />
          </View>
          <Body muted style={styles.likenessStatus}>
            {likenessReady
              ? 'Ready for try-on and collage.'
              : 'Add both photos to generate looks on you.'}
          </Body>
          <PrimaryButton
            label={likenessReady ? 'Update likeness' : 'Set up likeness'}
            icon="person-outline"
            onPress={() => router.push('/likeness')}
          />
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(120).duration(450)} style={styles.section}>
          <SectionLabel>Your closet</SectionLabel>
          <View style={styles.statGrid}>
            <StatCard
              icon="shirt-outline"
              value={String(data.garments.length)}
              label="Pieces"
              onPress={() => router.push('/(tabs)/wardrobe')}
            />
            <StatCard
              icon="images-outline"
              value={String(data.looks.length)}
              label="Looks"
              onPress={() => router.push('/(tabs)/looks')}
            />
            <StatCard
              icon="calendar-outline"
              value={String(plannedCount)}
              label="Planned"
              onPress={() => router.push('/(tabs)/plan')}
            />
          </View>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(180).duration(450)} style={styles.section}>
          <SectionLabel>Preferences</SectionLabel>
          <InfoRow
            icon="color-palette-outline"
            label="Default mood"
            value={data.selectedMood}
            onPress={() => router.push('/(tabs)/create')}
          />
          <InfoRow
            icon="sparkles-outline"
            label="AI generation"
            value={aiReady ? 'Ready' : 'Offline'}
            valueTone={aiReady ? 'ok' : 'warn'}
          />
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(240).duration(450)} style={styles.section}>
          <SectionLabel>More</SectionLabel>
          <InfoRow
            icon="images-outline"
            label="Browse examples"
            value="Inspiration"
            onPress={() => router.push('/examples')}
          />
          <InfoRow
            icon="sparkles-outline"
            label="Compose a look"
            value="Create"
            onPress={() => router.push('/(tabs)/create')}
          />
        </Animated.View>
      </ScrollView>
    </Screen>
  );
}

function PhotoTile({
  uri,
  label,
  empty,
  contain,
}: {
  uri: string | null;
  label: string;
  empty: string;
  contain?: boolean;
}) {
  return (
    <View style={styles.photoTile}>
      {uri ? (
        <View style={styles.photoImageWrap}>
          <Image
            source={{ uri }}
            style={styles.photoImage}
            resizeMode={contain ? 'contain' : 'cover'}
          />
        </View>
      ) : (
        <View style={styles.photoEmpty}>
          <View style={styles.photoMark} />
          <Body muted style={styles.photoEmptyText}>
            {empty}
          </Body>
        </View>
      )}
      <Body style={styles.photoLabel}>{label}</Body>
    </View>
  );
}

function StatCard({
  icon,
  value,
  label,
  onPress,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  value: string;
  label: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.statCard, pressed && styles.pressed]}
    >
      <Ionicons name={icon} size={18} color={colors.olive} />
      <Body style={styles.statValue}>{value}</Body>
      <Body muted style={styles.statLabel}>
        {label}
      </Body>
    </Pressable>
  );
}

function InfoRow({
  icon,
  label,
  value,
  valueTone,
  onPress,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: string;
  valueTone?: 'ok' | 'warn';
  onPress?: () => void;
}) {
  const content = (
    <>
      <View style={styles.infoLeft}>
        <View style={styles.infoIcon}>
          <Ionicons name={icon} size={18} color={colors.olive} />
        </View>
        <Body style={styles.infoLabel}>{label}</Body>
      </View>
      <View style={styles.infoRight}>
        <Body
          style={[
            styles.infoValue,
            valueTone === 'ok' && styles.infoOk,
            valueTone === 'warn' && styles.infoWarn,
          ]}
        >
          {value}
        </Body>
        {onPress ? (
          <Ionicons name="chevron-forward" size={16} color={colors.stoneMuted} />
        ) : null}
      </View>
    </>
  );

  if (onPress) {
    return (
      <Pressable
        onPress={onPress}
        style={({ pressed }) => [styles.infoRow, pressed && styles.pressed]}
      >
        {content}
      </Pressable>
    );
  }

  return <View style={styles.infoRow}>{content}</View>;
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  content: {
    paddingHorizontal: spacing.lg,
    gap: spacing.lg,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  headerText: {
    flex: 1,
  },
  sub: {
    marginTop: spacing.md,
    maxWidth: 300,
  },
  likenessCard: {
    gap: spacing.md,
    padding: spacing.md,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.mist,
    borderRadius: radii.md,
    backgroundColor: 'rgba(255,255,255,0.35)',
  },
  photoRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  photoTile: {
    flex: 1,
    gap: 8,
  },
  photoImageWrap: {
    height: 160,
    borderRadius: radii.sm,
    overflow: 'hidden',
    backgroundColor: colors.linen,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.mist,
    padding: 6,
  },
  photoImage: {
    width: '100%',
    height: '100%',
  },
  photoEmpty: {
    height: 160,
    borderRadius: radii.sm,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.mist,
    backgroundColor: colors.linen,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    padding: spacing.md,
  },
  photoMark: {
    width: 28,
    height: 1.5,
    backgroundColor: colors.olive,
  },
  photoEmptyText: {
    fontSize: 13,
    textAlign: 'center',
  },
  photoLabel: {
    fontFamily: fonts.bodyMedium,
    fontSize: 13,
  },
  likenessStatus: {
    fontSize: 14,
    lineHeight: 20,
  },
  section: {
    gap: spacing.sm,
  },
  statGrid: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  statCard: {
    flex: 1,
    gap: 4,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.sm,
    alignItems: 'center',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.mist,
    borderRadius: radii.md,
    backgroundColor: 'rgba(255,255,255,0.35)',
  },
  statValue: {
    fontFamily: fonts.display,
    fontSize: 26,
    marginTop: 4,
  },
  statLabel: {
    fontSize: 12,
    letterSpacing: 0.3,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.mist,
    borderRadius: radii.md,
    backgroundColor: 'rgba(255,255,255,0.35)',
    marginBottom: spacing.sm,
  },
  infoLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  infoIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.oliveSoft,
  },
  infoLabel: {
    fontFamily: fonts.bodyMedium,
    fontSize: 15,
  },
  infoRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  infoValue: {
    fontSize: 14,
    color: colors.stoneMuted,
  },
  infoOk: {
    color: colors.olive,
    fontFamily: fonts.bodyMedium,
  },
  infoWarn: {
    color: colors.stoneMuted,
  },
  pressed: {
    opacity: 0.75,
  },
});
