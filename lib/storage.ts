import AsyncStorage from '@react-native-async-storage/async-storage';
import * as FileSystem from 'expo-file-system/legacy';

import type { AppData, Garment, Likeness, Look } from '@/types';
import type { Mood } from '@/constants/theme';

const STORAGE_KEY = 'drape_app_data_v1';

const defaultData: AppData = {
  onboardingComplete: false,
  likeness: { bodyUri: null, faceUri: null },
  garments: [],
  looks: [],
  selectedGarmentIds: [],
  selectedMood: 'Clean',
};

function mediaDir(): string {
  return `${FileSystem.documentDirectory}drape/`;
}

export async function ensureMediaDir(): Promise<string> {
  const dir = mediaDir();
  const info = await FileSystem.getInfoAsync(dir);
  if (!info.exists) {
    await FileSystem.makeDirectoryAsync(dir, { intermediates: true });
  }
  return dir;
}

export async function persistImage(
  sourceUri: string,
  name: string,
  options?: { ext?: 'png' | 'jpg' }
): Promise<string> {
  const dir = await ensureMediaDir();
  const ext =
    options?.ext ?? (sourceUri.toLowerCase().includes('.png') ? 'png' : 'jpg');
  const dest = `${dir}${name}.${ext}`;
  await FileSystem.copyAsync({ from: sourceUri, to: dest });
  return dest;
}

export async function loadAppData(): Promise<AppData> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (!raw) return { ...defaultData, likeness: { ...defaultData.likeness } };
    const parsed = JSON.parse(raw) as Partial<AppData>;
    return {
      ...defaultData,
      ...parsed,
      likeness: { ...defaultData.likeness, ...parsed.likeness },
      garments: parsed.garments ?? [],
      looks: parsed.looks ?? [],
      selectedGarmentIds: parsed.selectedGarmentIds ?? [],
      selectedMood: (parsed.selectedMood as Mood) ?? 'Clean',
    };
  } catch {
    return { ...defaultData, likeness: { ...defaultData.likeness } };
  }
}

export async function saveAppData(data: AppData): Promise<void> {
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

export async function updateAppData(
  updater: (current: AppData) => AppData
): Promise<AppData> {
  const current = await loadAppData();
  const next = updater(current);
  await saveAppData(next);
  return next;
}

export type { AppData, Garment, Likeness, Look };
