import { Image, StyleSheet, Text, View } from 'react-native';

import { colors, fonts, type Mood } from '@/constants/theme';

export const COLLAGE_WIDTH = 1080;
export const COLLAGE_HEIGHT = 1440;

type CollageCanvasProps = {
  bodyUri: string;
  faceUri: string;
  garmentUris: string[];
  mood: Mood;
  onAssetLoad?: () => void;
};

/** Editorial fashion board: body base + face inset + garment photos. */
export function CollageCanvas({
  bodyUri,
  faceUri,
  garmentUris,
  mood,
  onAssetLoad,
}: CollageCanvasProps) {
  const pieces = garmentUris.slice(0, 4);

  return (
    <View style={styles.root}>
      <View style={styles.bodyWrap}>
        <Image
          source={{ uri: bodyUri }}
          style={styles.bodyImage}
          resizeMode="contain"
          onLoad={onAssetLoad}
        />
      </View>

      <View style={styles.scrimTop} />
      <View style={styles.scrimBottom} />

      <View style={styles.brandRow}>
        <Text style={styles.brand}>DRAPE</Text>
        <Text style={styles.mood}>{mood}</Text>
      </View>

      <View style={styles.faceFrame}>
        <Image
          source={{ uri: faceUri }}
          style={styles.faceImage}
          resizeMode="cover"
          onLoad={onAssetLoad}
        />
        <Text style={styles.faceLabel}>Likeness</Text>
      </View>

      <View style={styles.garmentRow}>
        {pieces.map((uri, index) => (
          <View
            key={`${uri}-${index}`}
            style={[
              styles.garmentCard,
              pieces.length === 1 && styles.garmentCardSolo,
              index % 2 === 1 && styles.garmentCardLift,
            ]}
          >
            <Image
              source={{ uri }}
              style={styles.garmentImage}
              resizeMode="contain"
              onLoad={onAssetLoad}
            />
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    width: COLLAGE_WIDTH,
    height: COLLAGE_HEIGHT,
    backgroundColor: colors.charcoal,
    overflow: 'hidden',
  },
  bodyWrap: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#2A2A26',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  bodyImage: {
    width: '100%',
    height: '100%',
  },
  scrimTop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 220,
    backgroundColor: 'rgba(26,26,24,0.28)',
  },
  scrimBottom: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 420,
    backgroundColor: 'rgba(26,26,24,0.42)',
  },
  brandRow: {
    position: 'absolute',
    top: 56,
    left: 56,
    right: 56,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  brand: {
    fontFamily: fonts.display,
    fontSize: 54,
    letterSpacing: 4,
    color: colors.ivory,
  },
  mood: {
    fontFamily: fonts.bodyMedium,
    fontSize: 28,
    letterSpacing: 2,
    textTransform: 'uppercase',
    color: colors.ivory,
    opacity: 0.9,
  },
  faceFrame: {
    position: 'absolute',
    top: 160,
    right: 56,
    width: 260,
    alignItems: 'center',
    gap: 12,
  },
  faceImage: {
    width: 260,
    height: 320,
    borderWidth: 3,
    borderColor: colors.ivory,
    backgroundColor: '#EFEBE4',
  },
  faceLabel: {
    fontFamily: fonts.bodyMedium,
    fontSize: 22,
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    color: colors.ivory,
  },
  garmentRow: {
    position: 'absolute',
    left: 40,
    right: 40,
    bottom: 64,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'flex-end',
    gap: 20,
  },
  garmentCard: {
    flex: 1,
    maxWidth: 240,
    height: 300,
    backgroundColor: 'rgba(247,244,239,0.92)',
    padding: 16,
    borderWidth: 2,
    borderColor: colors.ivory,
  },
  garmentCardSolo: {
    maxWidth: 320,
    height: 360,
    flexGrow: 0,
    flexBasis: 320,
  },
  garmentCardLift: {
    marginBottom: 36,
  },
  garmentImage: {
    width: '100%',
    height: '100%',
  },
});
