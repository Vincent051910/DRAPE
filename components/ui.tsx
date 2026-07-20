import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
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
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Atmosphere } from '@/components/Atmosphere';
import { colors, fonts, radii, spacing } from '@/constants/theme';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

type IconName = keyof typeof Ionicons.glyphMap;

export function Screen({
  children,
  style,
  padded = true,
  atmosphere = true,
  ...rest
}: ViewProps & { padded?: boolean; atmosphere?: boolean }) {
  const insets = useSafeAreaInsets();
  return (
    <View style={styles.screen} {...rest}>
      {atmosphere ? <Atmosphere /> : null}
      <View
        style={[
          styles.screenInner,
          padded && {
            paddingTop: insets.top + spacing.md,
            paddingBottom: Math.max(insets.bottom, spacing.md),
            paddingHorizontal: spacing.lg,
          },
          style,
        ]}
      >
        {children}
      </View>
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
          letterSpacing: 2.5,
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

export function SectionLabel({ children, style, ...rest }: TextProps) {
  return (
    <Text style={[styles.sectionLabel, style]} {...rest}>
      {children}
    </Text>
  );
}

export function AccentRule({ light = false }: { light?: boolean }) {
  return <View style={[styles.accentRule, light && styles.accentRuleLight]} />;
}

export function PrimaryButton({
  label,
  onPress,
  disabled,
  loading,
  icon,
  style,
}: {
  label: string;
  loading?: boolean;
  onPress?: () => void;
  disabled?: boolean;
  icon?: IconName;
  style?: PressableProps['style'];
}) {
  const scale = useSharedValue(1);
  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <AnimatedPressable
      onPress={onPress}
      disabled={disabled || loading}
      onPressIn={() => {
        if (!disabled) scale.value = withSpring(0.97, { damping: 18, stiffness: 320 });
      }}
      onPressOut={() => {
        scale.value = withSpring(1, { damping: 16, stiffness: 260 });
      }}
      style={(state) => [
        styles.primaryBtnWrap,
        animStyle,
        (disabled || loading) && styles.primaryBtnDisabled,
        typeof style === 'function' ? style(state) : style,
      ]}
    >
      <LinearGradient
        colors={['#5A7049', colors.olive, '#3A4A32']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.primaryBtn}
      >
        {loading ? (
          <ActivityIndicator color={colors.ivory} />
        ) : (
          <View style={styles.btnInner}>
            {icon ? <Ionicons name={icon} size={20} color={colors.ivory} /> : null}
            <Text style={styles.primaryBtnText}>{label}</Text>
          </View>
        )}
      </LinearGradient>
    </AnimatedPressable>
  );
}

export function SecondaryButton({
  label,
  onPress,
  disabled,
  icon,
  style,
}: {
  label: string;
  onPress?: () => void;
  disabled?: boolean;
  icon?: IconName;
  style?: PressableProps['style'];
}) {
  const scale = useSharedValue(1);
  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <AnimatedPressable
      onPress={onPress}
      disabled={disabled}
      onPressIn={() => {
        if (!disabled) scale.value = withSpring(0.97, { damping: 18, stiffness: 320 });
      }}
      onPressOut={() => {
        scale.value = withSpring(1, { damping: 16, stiffness: 260 });
      }}
      style={(state) => [
        styles.secondaryBtn,
        animStyle,
        disabled && styles.primaryBtnDisabled,
        typeof style === 'function' ? style(state) : style,
      ]}
    >
      <View style={styles.btnInner}>
        {icon ? <Ionicons name={icon} size={20} color={colors.olive} /> : null}
        <Text style={styles.secondaryBtnText}>{label}</Text>
      </View>
    </AnimatedPressable>
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
    <Pressable
      onPress={onPress}
      hitSlop={12}
      style={({ pressed }) => [styles.iconBtn, pressed && styles.pressed]}
    >
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
  screenInner: {
    flex: 1,
  },
  heading: {
    fontFamily: fonts.display,
    fontSize: 34,
    color: colors.charcoal,
    letterSpacing: 0.4,
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
  sectionLabel: {
    fontFamily: fonts.bodyMedium,
    fontSize: 12,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    color: colors.stoneMuted,
  },
  accentRule: {
    width: 40,
    height: 1.5,
    backgroundColor: colors.olive,
    marginTop: spacing.sm,
  },
  accentRuleLight: {
    backgroundColor: colors.ivory,
  },
  primaryBtnWrap: {
    borderRadius: radii.md,
    overflow: 'hidden',
  },
  primaryBtn: {
    paddingVertical: 18,
    paddingHorizontal: 24,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 58,
  },
  primaryBtnDisabled: {
    opacity: 0.4,
  },
  btnInner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  primaryBtnText: {
    fontFamily: fonts.bodyBold,
    fontSize: 17,
    color: colors.ivory,
    letterSpacing: 0.8,
  },
  secondaryBtn: {
    paddingVertical: 17,
    paddingHorizontal: 24,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 56,
    borderRadius: radii.md,
    borderWidth: 1.5,
    borderColor: colors.olive,
    backgroundColor: 'rgba(74, 93, 62, 0.1)',
  },
  secondaryBtnText: {
    fontFamily: fonts.bodyBold,
    fontSize: 16,
    color: colors.olive,
    letterSpacing: 0.6,
  },
  ghostBtn: {
    paddingVertical: 14,
    alignItems: 'center',
  },
  ghostBtnText: {
    fontFamily: fonts.bodyMedium,
    fontSize: 15,
    letterSpacing: 0.3,
  },
  iconBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.oliveSoft,
  },
  pressed: {
    opacity: 0.72,
  },
  hairline: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.mist,
    width: '100%',
  },
});
