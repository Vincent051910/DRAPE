import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  Easing,
  FadeIn,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';

import { Body, BrandTitle } from '@/components/ui';
import { colors, fonts, spacing } from '@/constants/theme';
import { useApp } from '@/context/AppContext';
import { generateLook } from '@/lib/generate';

export default function GeneratingScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ fallback?: string }>();
  const { data, saveLook } = useApp();
  const [status, setStatus] = useState('Draping your look…');
  const started = useRef(false);
  const pulse = useSharedValue(0.35);

  useEffect(() => {
    pulse.value = withRepeat(
      withTiming(1, { duration: 1400, easing: Easing.inOut(Easing.ease) }),
      -1,
      true
    );
  }, [pulse]);

  const pulseStyle = useAnimatedStyle(() => ({
    opacity: pulse.value,
  }));

  useEffect(() => {
    if (started.current) return;
    started.current = true;

    (async () => {
      const garmentUris = data.garments
        .filter((g) => data.selectedGarmentIds.includes(g.id))
        .map((g) => g.uri);

      const bodyUri = data.likeness.bodyUri;
      const faceUri = data.likeness.faceUri;

      if (!bodyUri || !faceUri) {
        setStatus('Likeness missing');
        setTimeout(() => router.replace('/likeness'), 1200);
        return;
      }

      const result = await generateLook(
        {
          bodyUri,
          faceUri,
          garmentUris,
          mood: data.selectedMood,
        },
        { allowCollageFallback: params.fallback === '1' }
      );

      if (!result.ok) {
        setStatus(result.message);
        setTimeout(() => router.replace('/(tabs)/create'), 2200);
        return;
      }

      if (result.source === 'collage') {
        setStatus('Preview ready (collage fallback)');
      } else {
        setStatus('Look ready');
      }

      const look = await saveLook({
        resultUri: result.uri,
        garmentIds: [...data.selectedGarmentIds],
        mood: data.selectedMood,
      });

      router.replace({
        pathname: '/result',
        params: {
          uri: look.resultUri,
          lookId: look.id,
          mood: look.mood,
          source: result.source,
        },
      });
    })();
  }, [data, params.fallback, router, saveLook]);

  return (
    <View style={styles.root}>
      <Animated.View entering={FadeIn.duration(600)} style={styles.center}>
        <BrandTitle size={44} />
        <Animated.View style={[styles.line, pulseStyle]} />
        <Body style={styles.status}>{status}</Body>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.ivory,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
  },
  center: {
    alignItems: 'center',
    gap: spacing.lg,
  },
  line: {
    width: 72,
    height: 1.5,
    backgroundColor: colors.olive,
  },
  status: {
    fontFamily: fonts.body,
    fontSize: 15,
    color: colors.stoneMuted,
    textAlign: 'center',
  },
});
