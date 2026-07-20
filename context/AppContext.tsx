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
import { cutoutClothes } from '@/lib/cutoutClothes';
import { createId } from '@/lib/id';
import { loadAppData, persistImage, saveAppData } from '@/lib/storage';
import type { AppData, Garment, Look, PlannedDay } from '@/types';

export type DayPlanInput = {
  lookId?: string | null;
  garmentIds?: string[];
  note?: string;
};

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
  getDayPlan: (date: string) => PlannedDay | undefined;
  setDayPlan: (date: string, plan: DayPlanInput) => Promise<void>;
  clearDayPlan: (date: string) => Promise<void>;
  likenessReady: boolean;
};

const AppContext = createContext<AppContextValue | null>(null);

function scrubPlans(
  plannedDays: PlannedDay[],
  garments: Garment[],
  looks: Look[]
): PlannedDay[] {
  const garmentIds = new Set(garments.map((g) => g.id));
  const lookIds = new Set(looks.map((l) => l.id));
  const cleaned: PlannedDay[] = [];
  for (const day of plannedDays) {
    const lookId = day.lookId && lookIds.has(day.lookId) ? day.lookId : null;
    const ids = day.garmentIds.filter((id) => garmentIds.has(id));
    if (!lookId && ids.length === 0 && !day.note?.trim()) continue;
    cleaned.push({ ...day, lookId, garmentIds: ids });
  }
  return cleaned;
}

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
      // Body + head use native cutout. Head keeps trim off so the neck stays.
      const result = await cutoutClothes(uri, {
        trim: kind === 'face' ? false : true,
      });
      const saved = await persistImage(
        result.uri,
        `${kind}_${createId(kind)}`,
        result.cutout ? { ext: 'png' } : undefined
      );
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
      const { uri: source, cutout } = await cutoutClothes(uri);
      const saved = await persistImage(source, id, cutout ? { ext: 'png' } : undefined);
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
      const garments = data.garments.filter((g) => g.id !== id);
      await commit({
        ...data,
        garments,
        selectedGarmentIds: data.selectedGarmentIds.filter((gid) => gid !== id),
        plannedDays: scrubPlans(data.plannedDays, garments, data.looks),
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
      const looks = data.looks.filter((l) => l.id !== id);
      await commit({
        ...data,
        looks,
        plannedDays: scrubPlans(data.plannedDays, data.garments, looks),
      });
    },
    [commit, data]
  );

  const getDayPlan = useCallback(
    (date: string) => data?.plannedDays.find((d) => d.date === date),
    [data]
  );

  const setDayPlan = useCallback(
    async (date: string, plan: DayPlanInput) => {
      if (!data) return;
      const lookId = plan.lookId === undefined ? undefined : plan.lookId;
      const garmentIds = plan.garmentIds;
      const note = plan.note;

      const existing = data.plannedDays.find((d) => d.date === date);
      const nextDay: PlannedDay = {
        date,
        lookId:
          lookId !== undefined
            ? lookId
            : (existing?.lookId ?? null),
        garmentIds: garmentIds ?? existing?.garmentIds ?? [],
        note: note !== undefined ? note.trim() || undefined : existing?.note,
      };

      const empty =
        !nextDay.lookId &&
        nextDay.garmentIds.length === 0 &&
        !nextDay.note;

      const others = data.plannedDays.filter((d) => d.date !== date);
      await commit({
        ...data,
        plannedDays: empty
          ? others
          : scrubPlans([nextDay, ...others], data.garments, data.looks),
      });
    },
    [commit, data]
  );

  const clearDayPlan = useCallback(
    async (date: string) => {
      if (!data) return;
      await commit({
        ...data,
        plannedDays: data.plannedDays.filter((d) => d.date !== date),
      });
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
      getDayPlan,
      setDayPlan,
      clearDayPlan,
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
    getDayPlan,
    setDayPlan,
    clearDayPlan,
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
