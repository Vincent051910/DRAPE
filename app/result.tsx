import * as MediaLibrary from 'expo-media-library';
import * as Sharing from 'expo-sharing';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Alert, Image, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { FadeIn } from 'react-native-reanimated';

import { Body, BrandTitle, GhostButton, IconButton, PrimaryButton } from '@/components/ui';
import { getExampleById } from '@/constants/examples';
import { colors, fonts, spacing } from '@/constants/theme';

export default function ResultScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { uri, mood, source, exampleId } = useLocalSearchParams<{
    uri: string;
    lookId?: string;
    mood?: string;
    source?: string;
    exampleId?: string;
  }>();

  const example = exampleId ? getExampleById(exampleId) : undefined;

  const onShare = async () => {
    if (!uri) return;
    const can = await Sharing.isAvailableAsync();
    if (!can) {
      Alert.alert('Sharing unavailable on this device');
      return;
    }
    await Sharing.shareAsync(uri);
  };

  const onSave = async () => {
    if (!uri) return;
    const perm = await MediaLibrary.requestPermissionsAsync();
    if (!perm.granted) {
      Alert.alert('Permission needed', 'Allow photo library access to save looks.');
      return;
    }
    await MediaLibrary.saveToLibraryAsync(uri);
    Alert.alert('Saved', 'Look saved to your photos.');
  };

  if (!uri) {
    return (
      <View style={[styles.root, { paddingTop: insets.top + spacing.lg }]}>
        <Body>No look to show.</Body>
        <GhostButton label="Back" onPress={() => router.replace('/(tabs)')} />
      </View>
    );
  }

  return (
    <View style={styles.root}>
      <Image
        source={{ uri }}
        style={StyleSheet.absoluteFill}
        resizeMode={source === 'example' ? 'contain' : 'cover'}
      />

      <Animated.View
        entering={FadeIn.duration(500)}
        style={[styles.topBar, { paddingTop: insets.top + spacing.sm }]}
      >
        <IconButton name="chevron-back" color={colors.ivory} onPress={() => router.back()} />
        <BrandTitle size={18} color={colors.ivory} />
        <IconButton name="share-outline" color={colors.ivory} onPress={onShare} />
      </Animated.View>

      <View style={[styles.bottom, { paddingBottom: insets.bottom + spacing.md }]}>
        {source === 'collage' ? (
          <Body style={styles.note}>
            Collage · {mood ? `${mood} · ` : ''}body, face & selected pieces
          </Body>
        ) : source === 'example' ? (
          <View style={styles.exampleMeta}>
            <Body style={styles.note}>
              {example?.title ?? 'Example'} · {mood ?? ''} · full body
            </Body>
            {example?.pieces.map((piece) => (
              <Body key={piece} style={styles.pieceLine}>
                · {piece}
              </Body>
            ))}
          </View>
        ) : mood ? (
          <Body style={styles.note}>{mood}</Body>
        ) : null}
        <View style={styles.actions}>
          {source === 'example' ? (
            <PrimaryButton
              label="Compose your look"
              onPress={() => router.replace('/(tabs)/create')}
              style={styles.half}
            />
          ) : (
            <PrimaryButton label="Save" onPress={onSave} style={styles.half} />
          )}
          <GhostButton
            label={source === 'example' ? 'More examples' : 'New look'}
            textColor={colors.ivory}
            onPress={() =>
              router.replace(source === 'example' ? '/examples' : '/(tabs)/create')
            }
            style={[styles.half, styles.newLook]}
          />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.charcoal,
  },
  topBar: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
    backgroundColor: 'rgba(26,26,24,0.35)',
  },
  bottom: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 2,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    backgroundColor: 'rgba(26,26,24,0.62)',
    gap: spacing.sm,
  },
  exampleMeta: {
    gap: 2,
    marginBottom: spacing.xs,
  },
  note: {
    color: colors.ivory,
    fontFamily: fonts.bodyMedium,
    fontSize: 13,
    textAlign: 'center',
  },
  pieceLine: {
    color: 'rgba(247,244,239,0.88)',
    fontFamily: fonts.body,
    fontSize: 12,
    textAlign: 'center',
  },
  actions: {
    flexDirection: 'row',
    gap: spacing.sm,
    alignItems: 'center',
  },
  half: {
    flex: 1,
  },
  newLook: {
    backgroundColor: 'transparent',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.ivory,
  },
});
