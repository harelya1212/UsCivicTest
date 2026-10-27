/**
 * Button - Primary/secondary/ghost button with gradient primary variant.
 */
import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, gradients, radius, spacing, typography } from '../../theme';

export default function Button({
  title,
  onPress,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  icon = null,
  style,
  textStyle,
}) {
  const content = (
    <>
      {loading ? (
        <ActivityIndicator color={variant === 'primary' ? '#fff' : colors.primary} />
      ) : (
        <>
          {icon}
          <Text style={[styles.text, styles[`text_${variant}`], styles[`text_${size}`], textStyle]}>
            {title}
          </Text>
        </>
      )}
    </>
  );

  const btnStyle = [
    styles.base,
    styles[`btn_${variant}`],
    styles[`btn_${size}`],
    disabled && styles.disabled,
    style,
  ];

  if (variant === 'primary' && !disabled) {
    return (
      <TouchableOpacity onPress={onPress} disabled={disabled || loading} activeOpacity={0.9} style={[btnStyle, styles.noBg]}>
        <LinearGradient
          colors={gradients.primary}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={[styles.gradient, styles[`btn_${size}`]]}
        >
          {content}
        </LinearGradient>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity onPress={onPress} disabled={disabled || loading} activeOpacity={0.85} style={btnStyle}>
      {content}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.md,
  },
  noBg: { backgroundColor: 'transparent', padding: 0 },
  gradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.md,
    width: '100%',
  },
  btn_primary: { backgroundColor: colors.primary },
  btn_secondary: { backgroundColor: colors.primaryLight },
  btn_ghost: { backgroundColor: 'transparent' },
  btn_outline: { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border },
  btn_sm: { paddingVertical: spacing.sm, paddingHorizontal: spacing.md, minHeight: 36 },
  btn_md: { paddingVertical: 14, paddingHorizontal: spacing.lg, minHeight: 52 },
  btn_lg: { paddingVertical: spacing.md, paddingHorizontal: spacing.xl, minHeight: 60 },
  disabled: { opacity: 0.5 },
  text: { fontFamily: typography.fontBold, fontWeight: typography.semibold, textAlign: 'center' },
  text_primary: { color: colors.textOnPrimary },
  text_secondary: { color: colors.primary },
  text_ghost: { color: colors.primary },
  text_outline: { color: colors.text },
  text_sm: { fontSize: typography.caption },
  text_md: { fontSize: typography.body },
  text_lg: { fontSize: typography.subtitle },
});
