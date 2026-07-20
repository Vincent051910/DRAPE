import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  FlatList,
  Image,
  Modal,
  Pressable,
  StyleSheet,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AccentRule, Body, Heading, IconButton, Screen } from '@/components/ui';
import {
  categories,
  colors,
  filterToCategory,
  fonts,
  radii,
  spacing,
  type CategoryFilter,
  type GarmentCategory,
} from '@/constants/theme';
import { useApp } from '@/context/AppContext';
import { promptImageSource } from '@/lib/pickImage';

const GAP = 10;
const COLS = 2;
const TILE = (Dimensions.get('window').width - spacing.lg * 2 - GAP) / COLS;

export default function WardrobeScreen() {
  const insets = useSafeAreaInsets();
  const { data, addGarment, removeGarment, toggleGarmentSelection } = useApp();
  const [filter, setFilter] = useState<CategoryFilter>('All');
  const [processing, setProcessing] = useState(false);

  const items =
    filter === 'All'
      ? data.garments
      : data.garments.filter((g) => g.category === filterToCategory[filter]);

  const onAdd = () => {
    Alert.alert('Category', 'What kind of piece is this?', [
      ...(['top', 'bottom', 'outer', 'shoes', 'other'] as GarmentCategory[]).map((cat) => ({
        text: cat.charAt(0).toUpperCase() + cat.slice(1),
        onPress: () =>
          promptImageSource(async (uri) => {
            setProcessing(true);
            try {
              await addGarment(uri, cat);
            } finally {
              setProcessing(false);
            }
          }),
      })),
      { text: 'Cancel', style: 'cancel' as const },
    ]);
  };

  return (
    <Screen padded={false} style={styles.screen}>
      <Modal visible={processing} transparent animationType="fade">
        <View style={styles.processingOverlay}>
          <ActivityIndicator size="large" color={colors.olive} />
          <Body style={styles.processingText}>Cutting out piece…</Body>
        </View>
      </Modal>

      <View style={[styles.header, { paddingTop: insets.top + spacing.md }]}>
        <View>
          <Heading>Wardrobe</Heading>
          <AccentRule />
        </View>
        <IconButton name="add" onPress={onAdd} size={26} color={colors.olive} />
      </View>

      <View style={styles.tabs}>
        {categories.map((cat) => {
          const active = filter === cat;
          return (
            <Pressable key={cat} onPress={() => setFilter(cat)} style={styles.tab}>
              <Body style={[styles.tabText, active && styles.tabTextActive]}>{cat}</Body>
              {active ? <View style={styles.tabUnderline} /> : <View style={styles.tabSpacer} />}
            </Pressable>
          );
        })}
      </View>

      <FlatList
        data={items}
        keyExtractor={(item) => item.id}
        numColumns={COLS}
        columnWrapperStyle={{ gap: GAP }}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Body muted style={{ textAlign: 'center' }}>
              No pieces yet. Tap + to photograph or import clothing.
            </Body>
          </View>
        }
        renderItem={({ item }) => {
          const selected = data.selectedGarmentIds.includes(item.id);
          return (
            <Pressable
              onPress={() => toggleGarmentSelection(item.id)}
              onLongPress={() =>
                Alert.alert('Remove piece?', undefined, [
                  { text: 'Cancel', style: 'cancel' },
                  {
                    text: 'Remove',
                    style: 'destructive',
                    onPress: () => removeGarment(item.id),
                  },
                ])
              }
              style={[styles.tile, selected && styles.tileSelected]}
            >
              <View style={styles.tileImageWrap}>
                <Image
                  source={{ uri: item.uri }}
                  style={styles.tileImage}
                  resizeMode="contain"
                />
              </View>
              <View style={styles.tileMeta}>
                <Body style={styles.tileLabel}>{item.category}</Body>
                {selected ? (
                  <Ionicons name="checkmark" size={16} color={colors.olive} />
                ) : null}
              </View>
            </Pressable>
          );
        }}
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
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  tabs: {
    flexDirection: 'row',
    paddingHorizontal: spacing.lg,
    marginTop: spacing.md,
    gap: spacing.md,
    flexWrap: 'wrap',
  },
  tab: {
    paddingBottom: 4,
  },
  tabText: {
    fontFamily: fonts.body,
    fontSize: 14,
    color: colors.stoneMuted,
  },
  tabTextActive: {
    fontFamily: fonts.bodyMedium,
    color: colors.charcoal,
  },
  tabUnderline: {
    marginTop: 4,
    height: 1.5,
    backgroundColor: colors.olive,
  },
  tabSpacer: {
    marginTop: 4,
    height: 1.5,
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
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.mist,
    borderRadius: radii.md,
    overflow: 'hidden',
    backgroundColor: 'rgba(255,255,255,0.35)',
  },
  tileSelected: {
    borderColor: colors.olive,
    borderWidth: 1.5,
    backgroundColor: colors.oliveSoft,
  },
  tileImageWrap: {
    width: '100%',
    height: TILE * 1.15,
    backgroundColor: colors.linen,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 8,
  },
  tileImage: {
    width: '100%',
    height: '100%',
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
  tileMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 6,
  },
  tileLabel: {
    fontSize: 12,
    fontFamily: fonts.bodyMedium,
    textTransform: 'capitalize',
  },
});
