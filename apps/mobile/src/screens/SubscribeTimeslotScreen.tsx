/**
 * Subscribe Timeslot Screen
 * Select delivery timeslot (Morning/Evening)
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

type SubscribeTimeslotScreenNavigationProp = StackNavigationProp<
  MainStackParamList,
  'SubscribeTimeslot'
>;
type SubscribeTimeslotScreenRouteProp = RouteProp<
  MainStackParamList,
  'SubscribeTimeslot'
>;

interface Props {
  navigation: SubscribeTimeslotScreenNavigationProp;
  route: SubscribeTimeslotScreenRouteProp;
}

const TIMESLOTS = [
  {
    key: 'morning' as const,
    title: '🌅 Morning Delivery',
    time: '6:00 AM - 9:00 AM',
    description: 'Perfect for breakfast',
  },
  {
    key: 'evening' as const,
    title: '🌆 Evening Delivery',
    time: '5:00 PM - 8:00 PM',
    description: 'Perfect for dinner',
  },
];

export const SubscribeTimeslotScreen: React.FC<Props> = ({ navigation }) => {
  const { setDeliverySlot, subscriptionData } = useSubscription();
  const [selectedSlot, setSelectedSlot] = useState<'morning' | 'evening' | null>(
    subscriptionData.deliverySlot
  );

  const handleNext = () => {
    if (selectedSlot) {
      setDeliverySlot(selectedSlot);
      navigation.navigate('SubscribeStartDate');
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>Choose Delivery Time</Text>
        <Text style={styles.subtitle}>
          Select when you'd like to receive your daily delivery
        </Text>

        {TIMESLOTS.map(slot => {
          const isSelected = selectedSlot === slot.key;

          return (
            <TouchableOpacity
              key={slot.key}
              style={[
                styles.slotCard,
                isSelected && styles.slotCardSelected,
              ]}
              onPress={() => setSelectedSlot(slot.key)}
              activeOpacity={0.7}>
              <View style={styles.slotContent}>
                <Text
                  style={[
                    styles.slotTitle,
                    isSelected && styles.slotTitleSelected,
                  ]}>
                  {slot.title}
                </Text>
                <Text style={styles.slotTime}>{slot.time}</Text>
                <Text style={styles.slotDescription}>{slot.description}</Text>
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
          disabled={!selectedSlot}
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
  slotCard: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: spacing[4],
    marginBottom: spacing[3],
    borderWidth: 2,
    borderColor: colors.border,
    flexDirection: 'row',
    alignItems: 'center',
  },
  slotCardSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primary + '05',
  },
  slotContent: {
    flex: 1,
  },
  slotTitle: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text.primary,
    marginBottom: spacing[1],
  },
  slotTitleSelected: {
    color: colors.primary,
  },
  slotTime: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.medium,
    color: colors.text.secondary,
    marginBottom: spacing[1],
  },
  slotDescription: {
    fontSize: typography.fontSize.sm,
    color: colors.text.tertiary,
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





