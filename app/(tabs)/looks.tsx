import { useRouter } from 'expo-router';
import {
  Alert,
  Dimensions,
  FlatList,
  Image,
  Pressable,
  StyleSheet,
  View,
} from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AccentRule, Body, Heading, Screen, SecondaryButton } from '@/components/ui';
import { colors, fonts, radii, spacing } from '@/constants/theme';
import { useApp } from '@/context/AppContext';

const GAP = 12;
const COLS = 2;
const TILE = (Dimensions.get('window').width - spacing.lg * 2 - GAP) / COLS;

export default function LooksScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { data, removeLook } = useApp();

  return (
    <Screen padded={false} style={styles.screen}>
      <View style={[styles.header, { paddingTop: insets.top + spacing.md }]}>
        <View>
          <Heading>Looks</Heading>
          <AccentRule />
        </View>
        <Body muted style={styles.count}>
          {data.looks.length} saved
        </Body>
      </View>

      <FlatList
        data={data.looks}
        keyExtractor={(item) => item.id}
        numColumns={COLS}
        columnWrapperStyle={{ gap: GAP }}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <View style={styles.empty}>
            <View style={styles.emptyMark} />
            <Body muted style={{ textAlign: 'center' }}>
              Generated looks will appear here.
            </Body>
            <SecondaryButton
              label="Browse examples"
              icon="images-outline"
              onPress={() => router.push('/examples')}
              style={styles.examplesLink}
            />
          </View>
        }
        renderItem={({ item, index }) => (
          <Animated.View entering={FadeInDown.delay(Math.min(index, 6) * 50).duration(400)}>
            <Pressable
              onPress={() =>
                router.push({
                  pathname: '/result',
                  params: { uri: item.resultUri, lookId: item.id, mood: item.mood },
                })
              }
              onLongPress={() =>
                Alert.alert('Delete look?', undefined, [
                  { text: 'Cancel', style: 'cancel' },
                  {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: () => removeLook(item.id),
                  },
                ])
              }
              style={styles.tile}
            >
              <Image source={{ uri: item.resultUri }} style={styles.tileImage} />
              <Body style={styles.tileLabel}>{item.mood}</Body>
            </Pressable>
          </Animated.View>
        )}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  header: {
    paddingHorizontal: spacing.lg,
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  count: {
    fontSize: 13,
    marginTop: 8,
    letterSpacing: 0.3,
  },
  list: {
    padding: spacing.lg,
    paddingBottom: spacing.xxl,
    gap: GAP,
  },
  empty: {
    paddingTop: spacing.xxl,
    paddingHorizontal: spacing.xl,
    alignItems: 'center',
    gap: spacing.md,
  },
  emptyMark: {
    width: 32,
    height: 1.5,
    backgroundColor: colors.olive,
  },
  examplesLink: {
    marginTop: spacing.sm,
    alignSelf: 'stretch',
  },
  tile: {
    width: TILE,
    marginBottom: GAP,
  },
  tileImage: {
    width: '100%',
    height: TILE * 1.35,
    backgroundColor: colors.linen,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.mist,
    borderRadius: radii.md,
  },
  tileLabel: {
    marginTop: 8,
    fontSize: 12,
    fontFamily: fonts.bodyMedium,
    letterSpacing: 0.3,
  },
});
