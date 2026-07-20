import { useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Dimensions, StyleSheet, View } from 'react-native';
import Animated, {
  Easing,
  FadeIn,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import ViewShot from 'react-native-view-shot';

import { CollageCanvas, COLLAGE_HEIGHT, COLLAGE_WIDTH } from '@/components/CollageCanvas';
import { Body, BrandTitle } from '@/components/ui';
import { colors, fonts, spacing } from '@/constants/theme';
import { useApp } from '@/context/AppContext';
import { generateLook } from '@/lib/generate';
import { createId } from '@/lib/id';
import { persistImage } from '@/lib/storage';

const { width: SCREEN_W } = Dimensions.get('window');

export default function GeneratingScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ mode?: string }>();
  const { data, saveLook } = useApp();
  const isCollage = params.mode === 'collage';
  const [phase, setPhase] = useState<'ai' | 'collage' | 'done'>(
    isCollage ? 'collage' : 'ai'
  );
  const [status, setStatus] = useState(
    isCollage ? 'Composing collage…' : 'Draping your look…'
  );
  const started = useRef(false);
  const collageStarted = useRef(false);
  const shotRef = useRef<ViewShot>(null);
  const loadedCount = useRef(0);
  const pulse = useSharedValue(0.35);

  const bodyUri = data.likeness.bodyUri;
  const faceUri = data.likeness.faceUri;
  const selectedIds = data.selectedGarmentIds;
  const garmentUris = useMemo(
    () =>
      data.garments.filter((g) => selectedIds.includes(g.id)).map((g) => g.uri),
    [data.garments, selectedIds]
  );
  const expectedLoads = 2 + Math.min(garmentUris.length, 4);
  const previewScale = SCREEN_W / COLLAGE_WIDTH;

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

  const finishWithUri = useCallback(
    async (uri: string, source: 'ai' | 'collage') => {
      setPhase('done');
      setStatus(source === 'collage' ? 'Collage ready' : 'Look ready');
      const look = await saveLook({
        resultUri: uri,
        garmentIds: [...selectedIds],
        mood: data.selectedMood,
      });
      router.replace({
        pathname: '/result',
        params: {
          uri: look.resultUri,
          lookId: look.id,
          mood: look.mood,
          source,
        },
      });
    },
    [data.selectedMood, router, saveLook, selectedIds]
  );

  const captureCollage = useCallback(async () => {
    if (collageStarted.current) return;
    collageStarted.current = true;
    try {
      await new Promise((r) => setTimeout(r, 400));
      const uri = await shotRef.current?.capture?.();
      if (!uri) throw new Error('Could not capture collage');
      const saved = await persistImage(uri, createId('collage'), { ext: 'png' });
      await finishWithUri(saved, 'collage');
    } catch {
      setStatus('Could not build collage');
      setTimeout(() => router.replace('/(tabs)/create'), 1800);
    }
  }, [finishWithUri, router]);

  const onAssetLoad = useCallback(() => {
    loadedCount.current += 1;
    if (loadedCount.current >= expectedLoads) {
      void captureCollage();
    }
  }, [captureCollage, expectedLoads]);

  useEffect(() => {
    if (phase !== 'ai' || started.current) return;
    started.current = true;

    (async () => {
      if (!bodyUri || !faceUri) {
        setStatus('Likeness missing');
        setTimeout(() => router.replace('/likeness'), 1200);
        return;
      }
      if (!garmentUris.length) {
        setStatus('Select at least one garment');
        setTimeout(() => router.replace('/(tabs)/wardrobe'), 1400);
        return;
      }

      const result = await generateLook({
        bodyUri,
        faceUri,
        garmentUris,
        mood: data.selectedMood,
      });

      if (result.ok) {
        await finishWithUri(result.uri, 'ai');
        return;
      }

      setStatus(result.message);
      // Quota errors are long — give time to read before bouncing back.
      const delay = /429|quota/i.test(result.message) ? 5200 : 2200;
      setTimeout(() => router.replace('/(tabs)/create'), delay);
    })();
  }, [bodyUri, data.selectedMood, faceUri, finishWithUri, garmentUris, phase, router]);

  useEffect(() => {
    if (phase !== 'collage') return;
    const t = setTimeout(() => {
      void captureCollage();
    }, 4500);
    return () => clearTimeout(t);
  }, [captureCollage, phase]);

  if (phase === 'collage' && bodyUri && faceUri) {
    return (
      <View style={styles.root}>
        <View style={styles.previewWrap}>
          <View
            style={{
              width: COLLAGE_WIDTH,
              height: COLLAGE_HEIGHT,
              transform: [{ scale: previewScale }],
            }}
          >
            <View collapsable={false}>
              <ViewShot
                ref={shotRef}
                options={{ format: 'png', quality: 1, result: 'tmpfile' }}
                style={{ width: COLLAGE_WIDTH, height: COLLAGE_HEIGHT }}
              >
                <CollageCanvas
                  bodyUri={bodyUri}
                  faceUri={faceUri}
                  garmentUris={garmentUris}
                  mood={data.selectedMood}
                  onAssetLoad={onAssetLoad}
                />
              </ViewShot>
            </View>
          </View>
        </View>

        <Animated.View entering={FadeIn.duration(400)} style={styles.statusOverlay}>
          <BrandTitle size={36} color={colors.ivory} />
          <Animated.View style={[styles.lineLight, pulseStyle]} />
          <Body style={styles.statusLight}>{status}</Body>
        </Animated.View>
      </View>
    );
  }

  return (
    <View style={styles.rootPlain}>
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
    backgroundColor: colors.charcoal,
    overflow: 'hidden',
  },
  rootPlain: {
    flex: 1,
    backgroundColor: colors.ivory,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
  },
  previewWrap: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
  },
  center: {
    alignItems: 'center',
    gap: spacing.lg,
  },
  statusOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.lg,
    backgroundColor: 'rgba(26,26,24,0.45)',
    padding: spacing.xl,
  },
  line: {
    width: 72,
    height: 1.5,
    backgroundColor: colors.olive,
  },
  lineLight: {
    width: 72,
    height: 1.5,
    backgroundColor: colors.ivory,
  },
  status: {
    fontFamily: fonts.body,
    fontSize: 15,
    color: colors.stoneMuted,
    textAlign: 'center',
    lineHeight: 22,
    maxWidth: 320,
  },
  statusLight: {
    fontFamily: fonts.body,
    fontSize: 15,
    color: colors.ivory,
    textAlign: 'center',
  },
});
