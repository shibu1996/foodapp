/**
 * Subscribe Duration Screen
 * Select subscription duration (7, 15, or 30 days)
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

type SubscribeDurationScreenNavigationProp = StackNavigationProp<
  MainStackParamList,
  'SubscribeDuration'
>;
type SubscribeDurationScreenRouteProp = RouteProp<
  MainStackParamList,
  'SubscribeDuration'
>;

interface Props {
  navigation: SubscribeDurationScreenNavigationProp;
  route: SubscribeDurationScreenRouteProp;
}

const DURATIONS = [
  {
    days: 7,
    title: '1 Week',
    description: '7 days subscription',
    savings: '5%',
    popular: false,
  },
  {
    days: 15,
    title: '2 Weeks',
    description: '15 days subscription',
    savings: '10%',
    popular: true,
  },
  {
    days: 30,
    title: '1 Month',
    description: '30 days subscription',
    savings: '15%',
    popular: false,
  },
] as const;

export const SubscribeDurationScreen: React.FC<Props> = ({
  navigation,
  route,
}) => {
  const { product } = route.params;
  const { setProduct, setDuration, subscriptionData } = useSubscription();
  const [selectedDuration, setSelectedDuration] = useState<7 | 15 | 30 | null>(
    subscriptionData.duration
  );

  // Set product in context
  React.useEffect(() => {
    setProduct(product);
  }, [product]);

  const handleNext = () => {
    if (selectedDuration) {
      setDuration(selectedDuration);
      navigation.navigate('SubscribeTimeslot');
    }
  };

  const calculatePrice = (days: number) => {
    const basePrice = product.discountPrice || product.price;
    const totalPrice = basePrice * days;
    const discount =
      days === 7 ? 0.05 : days === 15 ? 0.1 : days === 30 ? 0.15 : 0;
    return Math.round(totalPrice * (1 - discount));
  };

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.productName}>{product.name}</Text>
          <Text style={styles.subtitle}>Choose your subscription duration</Text>
        </View>

        {/* Duration Cards */}
        {DURATIONS.map(duration => {
          const isSelected = selectedDuration === duration.days;
          const price = calculatePrice(duration.days);

          return (
            <TouchableOpacity
              key={duration.days}
              style={[
                styles.durationCard,
                isSelected && styles.durationCardSelected,
              ]}
              onPress={() => setSelectedDuration(duration.days)}
              activeOpacity={0.7}>
              {duration.popular && (
                <View style={styles.popularBadge}>
                  <Text style={styles.popularText}>POPULAR</Text>
                </View>
              )}

              <View style={styles.cardHeader}>
                <View style={styles.titleContainer}>
                  <Text
                    style={[
                      styles.durationTitle,
                      isSelected && styles.durationTitleSelected,
                    ]}>
                    {duration.title}
                  </Text>
                  <Text style={styles.durationDescription}>
                    {duration.description}
                  </Text>
                </View>

                {isSelected && (
                  <View style={styles.checkmark}>
                    <Text style={styles.checkmarkText}>✓</Text>
                  </View>
                )}
              </View>

              <View style={styles.cardFooter}>
                <View style={styles.priceContainer}>
                  <Text style={styles.price}>₹{price}</Text>
                  <Text style={styles.perDay}>
                    ₹{Math.round(price / duration.days)}/day
                  </Text>
                </View>

                <View style={styles.savingsBadge}>
                  <Text style={styles.savingsText}>Save {duration.savings}</Text>
                </View>
              </View>
            </TouchableOpacity>
          );
        })}

        {/* Info Card */}
        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>📝 Subscription Benefits</Text>
          <View style={styles.benefitItem}>
            <Text style={styles.benefitIcon}>✓</Text>
            <Text style={styles.benefitText}>
              Daily fresh delivery at your doorstep
            </Text>
          </View>
          <View style={styles.benefitItem}>
            <Text style={styles.benefitIcon}>✓</Text>
            <Text style={styles.benefitText}>
              Choose morning or evening delivery
            </Text>
          </View>
          <View style={styles.benefitItem}>
            <Text style={styles.benefitIcon}>✓</Text>
            <Text style={styles.benefitText}>
              Pause or skip delivery anytime
            </Text>
          </View>
          <View style={styles.benefitItem}>
            <Text style={styles.benefitIcon}>✓</Text>
            <Text style={styles.benefitText}>
              Cancel subscription without charges
            </Text>
          </View>
        </View>
      </ScrollView>

      {/* Bottom Button */}
      <View style={styles.bottomContainer}>
        <Button
          title="Continue"
          onPress={handleNext}
          disabled={!selectedDuration}
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
  header: {
    marginBottom: spacing[6],
  },
  productName: {
    fontSize: typography.fontSize['2xl'],
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
    marginBottom: spacing[2],
  },
  subtitle: {
    fontSize: typography.fontSize.base,
    color: colors.text.secondary,
  },
  durationCard: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: spacing[4],
    marginBottom: spacing[3],
    borderWidth: 2,
    borderColor: colors.border,
    position: 'relative',
  },
  durationCardSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primary + '05',
  },
  popularBadge: {
    position: 'absolute',
    top: -10,
    right: spacing[4],
    backgroundColor: colors.secondary,
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[1],
    borderRadius: 12,
  },
  popularText: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.bold,
    color: colors.white,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing[3],
  },
  titleContainer: {
    flex: 1,
  },
  durationTitle: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
    marginBottom: spacing[1],
  },
  durationTitleSelected: {
    color: colors.primary,
  },
  durationDescription: {
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
  },
  checkmarkText: {
    color: colors.white,
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.bold,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  priceContainer: {
    flex: 1,
  },
  price: {
    fontSize: typography.fontSize['2xl'],
    fontWeight: typography.fontWeight.bold,
    color: colors.primary,
    marginBottom: spacing[1],
  },
  perDay: {
    fontSize: typography.fontSize.sm,
    color: colors.text.tertiary,
  },
  savingsBadge: {
    backgroundColor: colors.success + '20',
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[2],
    borderRadius: 8,
  },
  savingsText: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semibold,
    color: colors.success,
  },
  infoCard: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: spacing[4],
    marginTop: spacing[2],
  },
  infoTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text.primary,
    marginBottom: spacing[3],
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing[2],
  },
  benefitIcon: {
    fontSize: 16,
    color: colors.success,
    marginRight: spacing[2],
  },
  benefitText: {
    flex: 1,
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
  },
  bottomContainer: {
    backgroundColor: colors.white,
    padding: spacing[4],
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
});





