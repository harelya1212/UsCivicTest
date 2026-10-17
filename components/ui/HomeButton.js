/**
 * HomeButton - Small home icon that navigates to HomeTab.
 * Place in any screen header for quick access home.
 */
import React from 'react';
import { TouchableOpacity, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { colors, spacing } from '../../theme';

export default function HomeButton({ size = 22, style }) {
  const navigation = useNavigation();

  const goHome = () => {
    navigation.navigate('MainTabs', { screen: 'HomeTab' });
  };

  return (
    <TouchableOpacity onPress={goHome} style={[styles.button, style]} hitSlop={8}>
      <MaterialCommunityIcons name="home" size={size} color={colors.primary} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    padding: spacing.xs,
  },
});
