/**
 * Card - Rounded surface container with subtle shadow.
 */
import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { colors, radius, spacing, shadows } from '../../theme';

export default function Card({ children, onPress, style, padded = true }) {
  const cardStyle = [styles.card, padded && styles.padded, style];
  if (onPress) {
    return (
      <TouchableOpacity onPress={onPress} activeOpacity={0.92} style={cardStyle}>
        {children}
      </TouchableOpacity>
    );
  }
  return <View style={cardStyle}>{children}</View>;
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.borderLight,
    ...shadows.card,
  },
  padded: { padding: spacing.md },
});
