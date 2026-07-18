import * as MediaLibrary from 'expo-media-library';
import * as Sharing from 'expo-sharing';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Alert, Image, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { FadeIn } from 'react-native-reanimated';

import { Body, BrandTitle, GhostButton, IconButton, PrimaryButton } from '@/components/ui';
import { colors, fonts, spacing } from '@/constants/theme';

export default function ResultScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { uri, mood, source } = useLocalSearchParams<{
    uri: string;
    lookId?: string;
    mood?: string;
    source?: string;
  }>();

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
      <Image source={{ uri }} style={StyleSheet.absoluteFill} resizeMode="cover" />

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
          <Body style={styles.note}>Collage preview · add an API key for AI try-on</Body>
        ) : mood ? (
          <Body style={styles.note}>{mood}</Body>
        ) : null}
        <View style={styles.actions}>
          <PrimaryButton label="Save" onPress={onSave} style={styles.half} />
          <GhostButton
            label="New look"
            textColor={colors.ivory}
            onPress={() => router.replace('/(tabs)/create')}
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
    backgroundColor: 'rgba(26,26,24,0.55)',
    gap: spacing.sm,
  },
  note: {
    color: colors.ivory,
    fontFamily: fonts.bodyMedium,
    fontSize: 13,
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
