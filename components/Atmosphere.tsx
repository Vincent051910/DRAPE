import { LinearGradient } from 'expo-linear-gradient';
import { StyleSheet, View } from 'react-native';

import { colors } from '@/constants/theme';

/** Soft editorial wash behind screens — layered light, not a flat fill. */
export function Atmosphere() {
  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      <LinearGradient
        colors={[colors.ivory, '#F4F0E9', colors.linen, '#EAE5DC']}
        locations={[0, 0.35, 0.72, 1]}
        start={{ x: 0.05, y: 0 }}
        end={{ x: 0.95, y: 1 }}
        style={StyleSheet.absoluteFill}
      />
      <LinearGradient
        colors={['rgba(74,93,62,0.08)', 'transparent', 'rgba(26,26,24,0.05)']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFill}
      />
      <LinearGradient
        colors={['transparent', 'rgba(247,244,239,0.5)', 'rgba(234,229,220,0.65)']}
        locations={[0.45, 0.75, 1]}
        style={styles.bottomWash}
      />

      <View style={styles.orbTop} />
      <View style={styles.orbTopRing} />
      <View style={styles.orbMid} />
      <View style={styles.orbBottom} />
      <View style={styles.orbAccent} />

      <View style={styles.ruleVertical} />
      <View style={styles.ruleHorizontal} />
      <View style={styles.ruleDiagonal} />

      <View style={styles.cornerMark} />
      <View style={styles.cornerMarkShort} />
    </View>
  );
}

const styles = StyleSheet.create({
  bottomWash: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: '42%',
  },
  orbTop: {
    position: 'absolute',
    top: -90,
    right: -70,
    width: 260,
    height: 260,
    borderRadius: 130,
    backgroundColor: 'rgba(74, 93, 62, 0.09)',
  },
  orbTopRing: {
    position: 'absolute',
    top: -40,
    right: -20,
    width: 180,
    height: 180,
    borderRadius: 90,
    borderWidth: 1,
    borderColor: 'rgba(74, 93, 62, 0.12)',
    backgroundColor: 'transparent',
  },
  orbMid: {
    position: 'absolute',
    top: '38%',
    left: -100,
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: 'rgba(200, 194, 184, 0.22)',
  },
  orbBottom: {
    position: 'absolute',
    bottom: -60,
    right: '18%',
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: 'rgba(74, 93, 62, 0.06)',
  },
  orbAccent: {
    position: 'absolute',
    bottom: '22%',
    left: '42%',
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: 'rgba(255, 255, 255, 0.35)',
  },
  ruleVertical: {
    position: 'absolute',
    top: '12%',
    bottom: '28%',
    left: 28,
    width: StyleSheet.hairlineWidth,
    backgroundColor: 'rgba(74, 93, 62, 0.14)',
  },
  ruleHorizontal: {
    position: 'absolute',
    top: '18%',
    left: '22%',
    right: 40,
    height: StyleSheet.hairlineWidth,
    backgroundColor: 'rgba(26, 26, 24, 0.08)',
  },
  ruleDiagonal: {
    position: 'absolute',
    top: '62%',
    right: -20,
    width: 180,
    height: StyleSheet.hairlineWidth,
    backgroundColor: 'rgba(74, 93, 62, 0.12)',
    transform: [{ rotate: '-28deg' }],
  },
  cornerMark: {
    position: 'absolute',
    bottom: 48,
    left: 24,
    width: 28,
    height: 1.5,
    backgroundColor: 'rgba(74, 93, 62, 0.28)',
  },
  cornerMarkShort: {
    position: 'absolute',
    bottom: 48,
    left: 24,
    width: 1.5,
    height: 28,
    backgroundColor: 'rgba(74, 93, 62, 0.28)',
  },
});
