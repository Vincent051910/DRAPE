import { useRouter } from 'expo-router';
import { Image, Pressable, StyleSheet, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { Body, Heading, PrimaryButton, Screen } from '@/components/ui';
import { colors, fonts, spacing } from '@/constants/theme';
import { useApp } from '@/context/AppContext';
import { promptImageSource } from '@/lib/pickImage';

function CaptureZone({
  label,
  hint,
  uri,
  onPress,
}: {
  label: string;
  hint: string;
  uri: string | null;
  onPress: () => void;
}) {
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.zone, pressed && { opacity: 0.85 }]}>
      {uri ? (
        <Image source={{ uri }} style={styles.zoneImage} />
      ) : (
        <View style={styles.zoneEmpty}>
          <Body muted style={styles.zoneHint}>
            {hint}
          </Body>
        </View>
      )}
      <View style={styles.zoneLabelBar}>
        <Body style={styles.zoneLabel}>{label}</Body>
        <Body style={styles.zoneAction}>{uri ? 'Replace' : 'Add'}</Body>
      </View>
    </Pressable>
  );
}

export default function LikenessScreen() {
  const router = useRouter();
  const { data, setLikenessPhoto, likenessReady } = useApp();

  return (
    <Screen style={styles.screen}>
      <Animated.View entering={FadeInDown.duration(500)}>
        <Heading>Your likeness</Heading>
        <Body muted style={styles.sub}>
          A full-body and face photo so DRAPE can model looks on you.
        </Body>
      </Animated.View>

      <View style={styles.zones}>
        <CaptureZone
          label="Full body"
          hint="Stand straight, full frame"
          uri={data.likeness.bodyUri}
          onPress={() => promptImageSource((uri) => setLikenessPhoto('body', uri))}
        />
        <CaptureZone
          label="Face"
          hint="Clear, front-facing portrait"
          uri={data.likeness.faceUri}
          onPress={() => promptImageSource((uri) => setLikenessPhoto('face', uri))}
        />
      </View>

      <PrimaryButton
        label="Continue"
        disabled={!likenessReady}
        onPress={() => router.replace('/(tabs)')}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  screen: {
    justifyContent: 'space-between',
    gap: spacing.lg,
  },
  sub: {
    marginTop: spacing.sm,
    marginBottom: spacing.md,
  },
  zones: {
    flex: 1,
    gap: spacing.md,
  },
  zone: {
    flex: 1,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.stone,
    overflow: 'hidden',
    backgroundColor: '#EFEBE4',
  },
  zoneImage: {
    flex: 1,
    width: '100%',
  },
  zoneEmpty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.lg,
  },
  zoneHint: {
    textAlign: 'center',
    fontSize: 14,
  },
  zoneLabelBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.stone,
    backgroundColor: colors.ivory,
  },
  zoneLabel: {
    fontFamily: fonts.bodyMedium,
    fontSize: 14,
  },
  zoneAction: {
    fontFamily: fonts.bodyMedium,
    fontSize: 13,
    color: colors.olive,
  },
});
