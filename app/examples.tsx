import { type Href, useRouter } from 'expo-router';
import {
  Dimensions,
  FlatList,
  Image,
  Pressable,
  StyleSheet,
  View,
} from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AccentRule, Body, Heading, IconButton, Screen } from '@/components/ui';
import { exampleOutfits, type ExampleOutfit } from '@/constants/examples';
import { colors, fonts, radii, spacing } from '@/constants/theme';

const GAP = 14;
const WIDTH = Dimensions.get('window').width - spacing.lg * 2;

export default function ExamplesScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const openExample = (item: ExampleOutfit) => {
    router.push(
      `/result?uri=${encodeURIComponent(item.imageUri)}&mood=${encodeURIComponent(item.mood)}&source=example&exampleId=${encodeURIComponent(item.id)}` as Href
    );
  };

  return (
    <Screen padded={false} style={styles.screen}>
      <View style={[styles.header, { paddingTop: insets.top + spacing.sm }]}>
        <IconButton name="chevron-back" onPress={() => router.back()} />
        <View style={styles.headerCenter}>
          <Heading style={styles.heading}>Examples</Heading>
          <AccentRule />
        </View>
        <View style={{ width: 40 }} />
      </View>

      <Body muted style={styles.sub}>
        Full-body looks for women and men. Each card lists the clothes you see in the photo.
      </Body>

      <FlatList
        data={exampleOutfits}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        renderItem={({ item, index }) => (
          <Animated.View entering={FadeInDown.delay(Math.min(index, 8) * 45).duration(400)}>
            <Pressable onPress={() => openExample(item)} style={styles.card}>
              <Image
                source={{ uri: item.imageUri }}
                style={styles.image}
                resizeMode="contain"
              />
              <View style={styles.meta}>
                <Body style={styles.mood}>{item.mood}</Body>
                <Body style={styles.title}>{item.title}</Body>
                <Body muted style={styles.blurb}>
                  {item.blurb}
                </Body>
                <Body style={styles.piecesLabel}>In this look</Body>
                {item.pieces.map((piece) => (
                  <View key={piece} style={styles.pieceRow}>
                    <View style={styles.pieceDot} />
                    <Body style={styles.pieceText}>{piece}</Body>
                  </View>
                ))}
              </View>
            </Pressable>
          </Animated.View>
        )}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  header: {
    paddingHorizontal: spacing.lg,
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  headerCenter: {
    alignItems: 'center',
  },
  heading: {
    fontSize: 30,
  },
  sub: {
    paddingHorizontal: spacing.lg,
    marginTop: spacing.md,
    marginBottom: spacing.sm,
    lineHeight: 22,
  },
  list: {
    padding: spacing.lg,
    paddingBottom: spacing.xxl,
    gap: GAP,
  },
  card: {
    width: WIDTH,
    marginBottom: GAP,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.mist,
    borderRadius: radii.md,
    overflow: 'hidden',
    backgroundColor: 'rgba(255,255,255,0.35)',
  },
  image: {
    width: '100%',
    height: WIDTH * 1.35,
    backgroundColor: colors.linen,
  },
  meta: {
    padding: spacing.md,
    gap: 2,
  },
  mood: {
    fontSize: 11,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    color: colors.olive,
    fontFamily: fonts.bodyMedium,
  },
  title: {
    marginTop: 2,
    fontSize: 22,
    fontFamily: fonts.display,
  },
  blurb: {
    marginTop: 4,
    fontSize: 13,
    lineHeight: 18,
    marginBottom: spacing.sm,
  },
  piecesLabel: {
    marginTop: spacing.xs,
    marginBottom: 4,
    fontSize: 11,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    color: colors.stoneMuted,
    fontFamily: fonts.bodyMedium,
  },
  pieceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 3,
  },
  pieceDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.olive,
  },
  pieceText: {
    fontSize: 14,
    fontFamily: fonts.body,
    color: colors.charcoal,
  },
});
