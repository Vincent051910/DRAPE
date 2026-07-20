import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
  ActivityIndicator,
  Image,
  Modal,
  Pressable,
  StyleSheet,
  View,
} from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { AccentRule, Body, Heading, PrimaryButton, Screen } from '@/components/ui';
import { colors, fonts, radii, spacing } from '@/constants/theme';
import { useApp } from '@/context/AppContext';
import { promptImageSource } from '@/lib/pickImage';

function CaptureZone({
  label,
  hint,
  uri,
  onPress,
  delay,
  contain,
}: {
  label: string;
  hint: string;
  uri: string | null;
  onPress: () => void;
  delay: number;
  contain?: boolean;
}) {
  return (
    <Animated.View entering={FadeInDown.delay(delay).duration(500)} style={styles.zoneWrap}>
      <Pressable
        onPress={onPress}
        style={({ pressed }) => [styles.zone, pressed && { opacity: 0.88 }]}
      >
        {uri ? (
          <View style={styles.zoneImageWrap}>
            <Image
              source={{ uri }}
              style={styles.zoneImage}
              resizeMode={contain ? 'contain' : 'cover'}
            />
          </View>
        ) : (
          <View style={styles.zoneEmpty}>
            <View style={styles.zonePlus} />
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
    </Animated.View>
  );
}

export default function LikenessScreen() {
  const router = useRouter();
  const { data, setLikenessPhoto, likenessReady } = useApp();
  const [processing, setProcessing] = useState(false);

  const onPick = (kind: 'body' | 'face') => {
    // Taller crop for head so the neck is not clipped in the editor.
    const pickOptions = kind === 'face' ? { aspect: [2, 3] as [number, number] } : {};
    promptImageSource(async (uri) => {
      setProcessing(true);
      try {
        await setLikenessPhoto(kind, uri);
      } finally {
        setProcessing(false);
      }
    }, pickOptions);
  };

  return (
    <Screen style={styles.screen}>
      <Modal visible={processing} transparent animationType="fade">
        <View style={styles.processingOverlay}>
          <ActivityIndicator size="large" color={colors.olive} />
          <Body style={styles.processingText}>Cutting out likeness…</Body>
        </View>
      </Modal>

      <Animated.View entering={FadeInDown.duration(450)}>
        <Heading>Your likeness</Heading>
        <AccentRule />
        <Body muted style={styles.sub}>
          A full-body and head photo so DRAPE can model looks on you. Both are
          cut out from the background — include your neck in the head shot.
        </Body>
      </Animated.View>

      <View style={styles.zones}>
        <CaptureZone
          label="Full body"
          hint="Stand straight, full frame"
          uri={data.likeness.bodyUri}
          onPress={() => onPick('body')}
          delay={80}
          contain
        />
        <CaptureZone
          label="Head"
          hint="Face and neck, front-facing"
          uri={data.likeness.faceUri}
          onPress={() => onPick('face')}
          delay={160}
          contain
        />
      </View>

      <PrimaryButton
        label={router.canGoBack() ? 'Done' : 'Continue'}
        disabled={!likenessReady}
        onPress={() => {
          if (router.canGoBack()) {
            router.back();
          } else {
            router.replace('/(tabs)');
          }
        }}
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
    marginTop: spacing.md,
    marginBottom: spacing.sm,
    maxWidth: 320,
  },
  zones: {
    flex: 1,
    gap: spacing.md,
  },
  zoneWrap: {
    flex: 1,
  },
  zone: {
    flex: 1,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.mist,
    borderRadius: radii.md,
    overflow: 'hidden',
    backgroundColor: 'rgba(255,255,255,0.3)',
  },
  zoneImageWrap: {
    flex: 1,
    backgroundColor: colors.linen,
    padding: 8,
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
    gap: spacing.md,
  },
  zonePlus: {
    width: 28,
    height: 1.5,
    backgroundColor: colors.olive,
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
    paddingVertical: spacing.sm + 2,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.mist,
    backgroundColor: colors.overlayLight,
  },
  zoneLabel: {
    fontFamily: fonts.bodyMedium,
    fontSize: 14,
  },
  zoneAction: {
    fontFamily: fonts.bodyMedium,
    fontSize: 13,
    color: colors.olive,
    letterSpacing: 0.3,
  },
  processingOverlay: {
    flex: 1,
    backgroundColor: colors.overlay,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.md,
  },
  processingText: {
    color: colors.white,
    fontFamily: fonts.bodyMedium,
  },
});
