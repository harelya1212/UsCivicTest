/**
 * Screen - Standard screen wrapper: SafeAreaView + background + optional scroll.
 */
import React from 'react';
import { SafeAreaView, ScrollView, View, StyleSheet } from 'react-native';
import { colors, spacing } from '../../theme';

export default function Screen({ children, scroll = true, style, contentStyle }) {
  const content = scroll ? (
    <ScrollView
      contentContainerStyle={[styles.content, contentStyle]}
      showsVerticalScrollIndicator={false}
    >
      {children}
    </ScrollView>
  ) : (
    <View style={[styles.content, contentStyle]}>{children}</View>
  );

  return <SafeAreaView style={[styles.safe, style]}>{content}</SafeAreaView>;
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.md, paddingBottom: spacing.xl },
});
