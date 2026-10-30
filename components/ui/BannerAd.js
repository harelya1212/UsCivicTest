import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, typography } from '../../theme';

/**
 * BannerAd - Placeholder banner ad at bottom of every screen.
 * Assaf's revenue model: ads ONLY, never charge users.
 * When AdMob is set up, replace the placeholder with the real BannerAd component.
 */
export default function BannerAd() {
  return (
    <View style={styles.container}>
      <View style={styles.banner}>
        <Text style={styles.label}>AD</Text>
        <Text style={styles.text}>Advertisement</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: colors.background,
  },
  banner: {
    height: 50,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: colors.border,
    borderRadius: 8,
    backgroundColor: colors.surfaceAlt,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  label: {
    ...typography.caption,
    color: colors.textMuted,
    fontWeight: 'bold',
    marginRight: 8,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  text: {
    ...typography.caption,
    color: colors.textMuted,
  },
});
