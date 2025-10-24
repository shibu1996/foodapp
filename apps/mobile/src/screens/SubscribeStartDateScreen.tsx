/**
 * Subscribe Start Date Screen
 * Select subscription start date
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';
import { MainStackParamList } from '../navigation/types';
import { Button } from '../components';
import { colors, typography, spacing } from '../theme';
import { useSubscription } from '../context/SubscriptionContext';

type SubscribeStartDateScreenNavigationProp = StackNavigationProp<
  MainStackParamList,
  'SubscribeStartDate'
>;
type SubscribeStartDateScreenRouteProp = RouteProp<
  MainStackParamList,
  'SubscribeStartDate'
>;

interface Props {
  navigation: SubscribeStartDateScreenNavigationProp;
  route: SubscribeStartDateScreenRouteProp;
}

export const SubscribeStartDateScreen: React.FC<Props> = ({ navigation }) => {
  const { setStartDate, subscriptionData } = useSubscription();
  
  // Generate next 7 days
  const generateDates = () => {
    const dates = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date();
      date.setDate(date.getDate() + i);
      dates.push(date);
    }
    return dates;
  };

  const dates = generateDates();
  const [selectedDate, setSelectedDate] = useState<Date | null>(
    subscriptionData.startDate ? new Date(subscriptionData.startDate) : null
  );

  const handleNext = () => {
    if (selectedDate) {
      setStartDate(selectedDate.toISOString());
      navigation.navigate('SubscribeSummary');
    }
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  const getDayName = (date: Date) => {
    const today = new Date();
    const tomorrow = new Date();
    tomorrow.setDate(today.getDate() + 1);

    if (date.toDateString() === today.toDateString()) return 'Today';
    if (date.toDateString() === tomorrow.toDateString()) return 'Tomorrow';
    return date.toLocaleDateString('en-US', { weekday: 'long' });
  };

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>When to Start?</Text>
        <Text style={styles.subtitle}>
          Choose when you'd like your subscription to begin
        </Text>

        {dates.map((date, index) => {
          const isSelected =
            selectedDate &&
            date.toDateString() === selectedDate.toDateString();

          return (
            <TouchableOpacity
              key={index}
              style={[
                styles.dateCard,
                isSelected && styles.dateCardSelected,
              ]}
              onPress={() => setSelectedDate(date)}
              activeOpacity={0.7}>
              <View style={styles.dateContent}>
                <Text
                  style={[
                    styles.dayName,
                    isSelected && styles.dayNameSelected,
                  ]}>
                  {getDayName(date)}
                </Text>
                <Text style={styles.dateText}>{formatDate(date)}</Text>
              </View>

              {isSelected && (
                <View style={styles.checkmark}>
                  <Text style={styles.checkmarkText}>✓</Text>
                </View>
              )}
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      <View style={styles.bottomContainer}>
        <Button
          title="Continue"
          onPress={handleNext}
          disabled={!selectedDate}
          fullWidth
          size="lg"
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.backgroundSecondary,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing[4],
  },
  title: {
    fontSize: typography.fontSize['2xl'],
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
    marginBottom: spacing[2],
  },
  subtitle: {
    fontSize: typography.fontSize.base,
    color: colors.text.secondary,
    marginBottom: spacing[6],
  },
  dateCard: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: spacing[4],
    marginBottom: spacing[3],
    borderWidth: 2,
    borderColor: colors.border,
    flexDirection: 'row',
    alignItems: 'center',
  },
  dateCardSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primary + '05',
  },
  dateContent: {
    flex: 1,
  },
  dayName: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text.primary,
    marginBottom: spacing[1],
  },
  dayNameSelected: {
    color: colors.primary,
  },
  dateText: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
  },
  checkmark: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: spacing[3],
  },
  checkmarkText: {
    color: colors.white,
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.bold,
  },
  bottomContainer: {
    backgroundColor: colors.white,
    padding: spacing[4],
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
});


