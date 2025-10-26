/**
 * Card Component
 */

import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { colors, theme } from '../theme';

interface CardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  shadow?: 'sm' | 'base' | 'md' | 'lg';
  padding?: number;
}

export const Card: React.FC<CardProps> = ({
  children,
  style,
  shadow = 'base',
  padding = 16,
}) => {
  return (
    <View
      style={[
        styles.card,
        theme.shadows[shadow],
        { padding },
        style,
      ]}>
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.white,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
});





