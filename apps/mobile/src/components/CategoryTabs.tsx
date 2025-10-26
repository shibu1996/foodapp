/**
 * CategoryTabs Component
 * Horizontal scrollable category tabs
 */

import React, { useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { colors, typography, spacing } from '../theme';
import { Category } from '../types';

interface CategoryTabsProps {
  categories: Category[];
  selectedCategory: string;
  onSelectCategory: (categoryId: string) => void;
}

export const CategoryTabs: React.FC<CategoryTabsProps> = ({
  categories,
  selectedCategory,
  onSelectCategory,
}) => {
  const scrollViewRef = useRef<ScrollView>(null);

  // Auto-scroll to selected category
  useEffect(() => {
    // This would need more sophisticated logic to calculate position
    // For now, just scroll to beginning when category changes
  }, [selectedCategory]);

  const allCategories = [
    { _id: 'all', name: 'All', isActive: true },
    ...categories.filter(c => c.isActive),
  ];

  return (
    <View style={styles.container}>
      <ScrollView
        ref={scrollViewRef}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}>
        {allCategories.map((category, index) => {
          const isSelected = selectedCategory === category._id;
          return (
            <TouchableOpacity
              key={category._id}
              style={[
                styles.tab,
                isSelected && styles.tabSelected,
                index === 0 && styles.firstTab,
                index === allCategories.length - 1 && styles.lastTab,
              ]}
              onPress={() => onSelectCategory(category._id)}
              activeOpacity={0.7}>
              <Text
                style={[styles.tabText, isSelected && styles.tabTextSelected]}>
                {category.name}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing[4],
  },
  scrollContent: {
    paddingHorizontal: spacing[4],
  },
  tab: {
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[2],
    marginRight: spacing[2],
    borderRadius: 20,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
  },
  tabSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  firstTab: {
    // No extra styling needed
  },
  lastTab: {
    marginRight: spacing[4],
  },
  tabText: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    color: colors.text.secondary,
  },
  tabTextSelected: {
    color: colors.white,
    fontWeight: typography.fontWeight.semibold,
  },
});





