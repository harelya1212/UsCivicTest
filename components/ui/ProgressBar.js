/**
 * ProgressBar - Rounded progress indicator with gradient fill.
 */
import React from 'react';
import { View, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, gradients, radius } from '../../theme';

export default function ProgressBar({ progress = 0, height = 8, style }) {
  const pct = Math.max(0, Math.min(1, progress));
  return (
    <View style={[styles.track, { height }, style]}>
      <LinearGradient
        colors={gradients.primary}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={[styles.fill, { width: `${pct * 100}%`, borderRadius: radius.full }]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    backgroundColor: colors.surfaceAlt,
    borderRadius: radius.full,
    overflow: 'hidden',
  },
  fill: { height: '100%' },
});
