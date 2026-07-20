import type { GarmentCategory, Mood } from '@/constants/theme';

export type Likeness = {
  bodyUri: string | null;
  faceUri: string | null;
};

export type Garment = {
  id: string;
  uri: string;
  category: GarmentCategory;
  createdAt: number;
};

export type Look = {
  id: string;
  resultUri: string;
  garmentIds: string[];
  mood: Mood;
  createdAt: number;
};

export type PlannedDay = {
  date: string; // YYYY-MM-DD local
  lookId: string | null;
  garmentIds: string[];
  note?: string;
};

export type AppData = {
  onboardingComplete: boolean;
  likeness: Likeness;
  garments: Garment[];
  looks: Look[];
  selectedGarmentIds: string[];
  selectedMood: Mood;
  plannedDays: PlannedDay[];
};
