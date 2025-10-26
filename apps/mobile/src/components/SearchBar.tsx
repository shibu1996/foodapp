/**
 * SearchBar Component
 */

import React from 'react';
import {
  View,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Text,
} from 'react-native';
import { colors, typography, spacing } from '../theme';

interface SearchBarProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
}

export const SearchBar: React.FC<SearchBarProps> = ({
  value,
  onChangeText,
  placeholder = 'Search...',
}) => {
  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        <Text style={styles.searchIcon}>🔍</Text>
        <TextInput
          style={styles.input}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={colors.text.tertiary}
        />
        {value.length > 0 && (
          <TouchableOpacity
            onPress={() => onChangeText('')}
            style={styles.clearButton}>
            <Text style={styles.clearIcon}>✕</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[3],
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: 12,
    paddingHorizontal: spacing[4],
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  searchIcon: {
    fontSize: 18,
    marginRight: spacing[2],
  },
  input: {
    flex: 1,
    paddingVertical: spacing[3],
    fontSize: typography.fontSize.base,
    color: colors.text.primary,
  },
  clearButton: {
    padding: spacing[1],
  },
  clearIcon: {
    fontSize: 18,
    color: colors.text.tertiary,
  },
});





