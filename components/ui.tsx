import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
  type PressableProps,
  type TextProps,
  type ViewProps,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { colors, fonts, spacing } from '@/constants/theme';

export function Screen({
  children,
  style,
  padded = true,
  ...rest
}: ViewProps & { padded?: boolean }) {
  const insets = useSafeAreaInsets();
  return (
    <View
      style={[
        styles.screen,
        padded && {
          paddingTop: insets.top + spacing.md,
          paddingBottom: Math.max(insets.bottom, spacing.md),
          paddingHorizontal: spacing.lg,
        },
        style,
      ]}
      {...rest}
    >
      {children}
    </View>
  );
}

export function BrandTitle({
  size = 48,
  color = colors.charcoal,
  style,
  ...rest
}: TextProps & { size?: number; color?: string }) {
  return (
    <Text
      style={[
        {
          fontFamily: fonts.display,
          fontSize: size,
          color,
          letterSpacing: 2,
        },
        style,
      ]}
      {...rest}
    >
      DRAPE
    </Text>
  );
}

export function Heading({ children, style, ...rest }: TextProps) {
  return (
    <Text style={[styles.heading, style]} {...rest}>
      {children}
    </Text>
  );
}

export function Body({ children, style, muted, ...rest }: TextProps & { muted?: boolean }) {
  return (
    <Text style={[styles.body, muted && styles.bodyMuted, style]} {...rest}>
      {children}
    </Text>
  );
}

export function PrimaryButton({
  label,
  onPress,
  disabled,
  loading,
  style,
}: {
  label: string;
  loading?: boolean;
  onPress?: () => void;
  disabled?: boolean;
  style?: PressableProps['style'];
}) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled || loading}
      style={(state) => [
        styles.primaryBtn,
        (disabled || loading) && styles.primaryBtnDisabled,
        state.pressed && !disabled && styles.pressed,
        typeof style === 'function' ? style(state) : style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={colors.ivory} />
      ) : (
        <Text style={styles.primaryBtnText}>{label}</Text>
      )}
    </Pressable>
  );
}

export function GhostButton({
  label,
  onPress,
  style,
  textColor = colors.charcoal,
}: {
  label: string;
  onPress?: () => void;
  textColor?: string;
  style?: PressableProps['style'];
}) {
  return (
    <Pressable
      onPress={onPress}
      style={(state) => [
        styles.ghostBtn,
        state.pressed && styles.pressed,
        typeof style === 'function' ? style(state) : style,
      ]}
    >
      <Text style={[styles.ghostBtnText, { color: textColor }]}>{label}</Text>
    </Pressable>
  );
}

export function IconButton({
  name,
  onPress,
  color = colors.charcoal,
  size = 22,
}: {
  name: keyof typeof Ionicons.glyphMap;
  onPress?: () => void;
  color?: string;
  size?: number;
}) {
  return (
    <Pressable onPress={onPress} hitSlop={12} style={({ pressed }) => pressed && styles.pressed}>
      <Ionicons name={name} size={size} color={color} />
    </Pressable>
  );
}

export function Hairline() {
  return <View style={styles.hairline} />;
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.ivory,
  },
  heading: {
    fontFamily: fonts.display,
    fontSize: 32,
    color: colors.charcoal,
    letterSpacing: 0.5,
  },
  body: {
    fontFamily: fonts.body,
    fontSize: 16,
    lineHeight: 24,
    color: colors.charcoal,
  },
  bodyMuted: {
    color: colors.stoneMuted,
  },
  primaryBtn: {
    backgroundColor: colors.olive,
    paddingVertical: 16,
    paddingHorizontal: 24,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 54,
  },
  primaryBtnDisabled: {
    opacity: 0.45,
  },
  primaryBtnText: {
    fontFamily: fonts.bodyMedium,
    fontSize: 16,
    color: colors.ivory,
    letterSpacing: 0.4,
  },
  ghostBtn: {
    paddingVertical: 14,
    alignItems: 'center',
  },
  ghostBtnText: {
    fontFamily: fonts.bodyMedium,
    fontSize: 15,
    color: colors.charcoal,
  },
  pressed: {
    opacity: 0.7,
  },
  hairline: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.stone,
    width: '100%',
  },
});
