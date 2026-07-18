export const colors = {
  ivory: '#F7F4EF',
  charcoal: '#1A1A18',
  olive: '#4A5D3E',
  stone: '#C8C2B8',
  stoneMuted: '#A39E94',
  white: '#FFFFFF',
  overlay: 'rgba(26, 26, 24, 0.55)',
  overlayLight: 'rgba(247, 244, 239, 0.92)',
} as const;

export const fonts = {
  display: 'Fraunces_600SemiBold',
  displayRegular: 'Fraunces_400Regular',
  body: 'DMSans_400Regular',
  bodyMedium: 'DMSans_500Medium',
  bodyBold: 'DMSans_700Bold',
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
} as const;

export const moods = ['Clean', 'Editorial', 'Street', 'Evening'] as const;
export type Mood = (typeof moods)[number];

export const categories = ['All', 'Tops', 'Bottoms', 'Outer', 'Shoes', 'Other'] as const;
export type CategoryFilter = (typeof categories)[number];

export type GarmentCategory = 'top' | 'bottom' | 'outer' | 'shoes' | 'other';

export const categoryToFilter: Record<GarmentCategory, Exclude<CategoryFilter, 'All'>> = {
  top: 'Tops',
  bottom: 'Bottoms',
  outer: 'Outer',
  shoes: 'Shoes',
  other: 'Other',
};

export const filterToCategory: Record<Exclude<CategoryFilter, 'All'>, GarmentCategory> = {
  Tops: 'top',
  Bottoms: 'bottom',
  Outer: 'outer',
  Shoes: 'shoes',
  Other: 'other',
};
