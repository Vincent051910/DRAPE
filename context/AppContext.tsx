import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { ActivityIndicator, View } from 'react-native';

import { colors } from '@/constants/theme';
import type { GarmentCategory, Mood } from '@/constants/theme';
import { cutoutGarment } from '@/lib/cutoutGarment';
import { createId } from '@/lib/id';
import { loadAppData, persistImage, saveAppData } from '@/lib/storage';
import type { AppData, Garment, Look } from '@/types';

type AppContextValue = {
  ready: boolean;
  data: AppData;
  completeOnboarding: () => Promise<void>;
  setLikenessPhoto: (kind: 'body' | 'face', uri: string) => Promise<void>;
  addGarment: (uri: string, category: GarmentCategory) => Promise<void>;
  removeGarment: (id: string) => Promise<void>;
  toggleGarmentSelection: (id: string) => Promise<void>;
  setSelectedMood: (mood: Mood) => Promise<void>;
  clearGarmentSelection: () => Promise<void>;
  saveLook: (look: Omit<Look, 'id' | 'createdAt'> & { id?: string }) => Promise<Look>;
  removeLook: (id: string) => Promise<void>;
  likenessReady: boolean;
};

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState(false);
  const [data, setData] = useState<AppData | null>(null);

  useEffect(() => {
    loadAppData().then((loaded) => {
      setData(loaded);
      setReady(true);
    });
  }, []);

  const commit = useCallback(async (next: AppData) => {
    setData(next);
    await saveAppData(next);
  }, []);

  const completeOnboarding = useCallback(async () => {
    if (!data) return;
    await commit({ ...data, onboardingComplete: true });
  }, [commit, data]);

  const setLikenessPhoto = useCallback(
    async (kind: 'body' | 'face', uri: string) => {
      if (!data) return;
      const saved = await persistImage(uri, `${kind}_${createId(kind)}`);
      await commit({
        ...data,
        likeness: {
          ...data.likeness,
          [kind === 'body' ? 'bodyUri' : 'faceUri']: saved,
        },
      });
    },
    [commit, data]
  );

  const addGarment = useCallback(
    async (uri: string, category: GarmentCategory) => {
      if (!data) return;
      const id = createId('garment');
      let source = uri;
      try {
        source = await cutoutGarment(uri);
      } catch {
        // Keep the original photo if cutout fails.
      }
      const saved = await persistImage(source, id, { ext: 'png' });
      const garment: Garment = {
        id,
        uri: saved,
        category,
        createdAt: Date.now(),
      };
      await commit({ ...data, garments: [garment, ...data.garments] });
    },
    [commit, data]
  );

  const removeGarment = useCallback(
    async (id: string) => {
      if (!data) return;
      await commit({
        ...data,
        garments: data.garments.filter((g) => g.id !== id),
        selectedGarmentIds: data.selectedGarmentIds.filter((gid) => gid !== id),
      });
    },
    [commit, data]
  );

  const toggleGarmentSelection = useCallback(
    async (id: string) => {
      if (!data) return;
      const exists = data.selectedGarmentIds.includes(id);
      const selectedGarmentIds = exists
        ? data.selectedGarmentIds.filter((gid) => gid !== id)
        : [...data.selectedGarmentIds, id];
      await commit({ ...data, selectedGarmentIds });
    },
    [commit, data]
  );

  const setSelectedMood = useCallback(
    async (mood: Mood) => {
      if (!data) return;
      await commit({ ...data, selectedMood: mood });
    },
    [commit, data]
  );

  const clearGarmentSelection = useCallback(async () => {
    if (!data) return;
    await commit({ ...data, selectedGarmentIds: [] });
  }, [commit, data]);

  const saveLook = useCallback(
    async (look: Omit<Look, 'id' | 'createdAt'> & { id?: string }) => {
      if (!data) throw new Error('App not ready');
      const saved: Look = {
        id: look.id ?? createId('look'),
        resultUri: look.resultUri,
        garmentIds: look.garmentIds,
        mood: look.mood,
        createdAt: Date.now(),
      };
      await commit({ ...data, looks: [saved, ...data.looks] });
      return saved;
    },
    [commit, data]
  );

  const removeLook = useCallback(
    async (id: string) => {
      if (!data) return;
      await commit({ ...data, looks: data.looks.filter((l) => l.id !== id) });
    },
    [commit, data]
  );

  const likenessReady = Boolean(data?.likeness.bodyUri && data?.likeness.faceUri);

  const value = useMemo<AppContextValue | null>(() => {
    if (!data) return null;
    return {
      ready,
      data,
      completeOnboarding,
      setLikenessPhoto,
      addGarment,
      removeGarment,
      toggleGarmentSelection,
      setSelectedMood,
      clearGarmentSelection,
      saveLook,
      removeLook,
      likenessReady,
    };
  }, [
    ready,
    data,
    completeOnboarding,
    setLikenessPhoto,
    addGarment,
    removeGarment,
    toggleGarmentSelection,
    setSelectedMood,
    clearGarmentSelection,
    saveLook,
    removeLook,
    likenessReady,
  ]);

  if (!value) {
    return (
      <View
        style={{
          flex: 1,
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: colors.ivory,
        }}
      >
        <ActivityIndicator color={colors.olive} />
      </View>
    );
  }

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp(): AppContextValue {
  const ctx = useContext(AppContext);
  if (!ctx) {
    throw new Error('useApp must be used within AppProvider');
  }
  return ctx;
}
