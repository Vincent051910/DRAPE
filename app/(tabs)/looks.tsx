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
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Body, Heading, Screen } from '@/components/ui';
import { colors, fonts, spacing } from '@/constants/theme';
import { useApp } from '@/context/AppContext';

const GAP = 10;
const COLS = 2;
const TILE = (Dimensions.get('window').width - spacing.lg * 2 - GAP) / COLS;

export default function LooksScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { data, removeLook } = useApp();

  return (
    <Screen padded={false} style={styles.screen}>
      <View style={[styles.header, { paddingTop: insets.top + spacing.md }]}>
        <Heading>Looks</Heading>
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
            <Body muted style={{ textAlign: 'center' }}>
              Generated looks will appear here.
            </Body>
          </View>
        }
        renderItem={({ item }) => (
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
    alignItems: 'baseline',
    justifyContent: 'space-between',
  },
  count: {
    fontSize: 13,
  },
  list: {
    padding: spacing.lg,
    paddingBottom: spacing.xxl,
    gap: GAP,
  },
  empty: {
    paddingTop: spacing.xxl,
    paddingHorizontal: spacing.xl,
  },
  tile: {
    width: TILE,
    marginBottom: GAP,
  },
  tileImage: {
    width: '100%',
    height: TILE * 1.35,
    backgroundColor: '#EFEBE4',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.stone,
  },
  tileLabel: {
    marginTop: 6,
    fontSize: 12,
    fontFamily: fonts.bodyMedium,
  },
});
