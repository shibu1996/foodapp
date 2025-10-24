/**
 * Subscribe Summary Screen
 * Review subscription details and confirm
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
} from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';
import { MainStackParamList } from '../navigation/types';
import { Button } from '../components';
import { colors, typography, spacing } from '../theme';
import { useSubscription } from '../context/SubscriptionContext';
import { apiClient } from '../services/apiClient';
import { storage } from '../utils/storage';

type SubscribeSummaryScreenNavigationProp = StackNavigationProp<
  MainStackParamList,
  'SubscribeSummary'
>;
type SubscribeSummaryScreenRouteProp = RouteProp<
  MainStackParamList,
  'SubscribeSummary'
>;

interface Props {
  navigation: SubscribeSummaryScreenNavigationProp;
  route: SubscribeSummaryScreenRouteProp;
}

export const SubscribeSummaryScreen: React.FC<Props> = ({ navigation }) => {
  const { subscriptionData, resetSubscription } = useSubscription();
  const [loading, setLoading] = useState(false);
  const [deliveryAddress, setDeliveryAddress] = useState<any>(null);

  useEffect(() => {
    loadAddress();
  }, []);

  const loadAddress = async () => {
    try {
      const user = await storage.getUser();
      if (user && user.addresses) {
        const defaultAddr = user.addresses.find(addr => addr.isDefault);
        setDeliveryAddress(defaultAddr || user.addresses[0]);
      }
    } catch (error) {
      console.error('Error loading address:', error);
    }
  };

  const calculateTotal = () => {
    if (!subscriptionData.product || !subscriptionData.duration) return 0;
    const basePrice = subscriptionData.product.discountPrice || subscriptionData.product.price;
    const totalPrice = basePrice * subscriptionData.duration;
    const discount =
      subscriptionData.duration === 7 ? 0.05 : subscriptionData.duration === 15 ? 0.1 : 0.15;
    return Math.round(totalPrice * (1 - discount));
  };

  const handleAddToCart = async () => {
    if (!deliveryAddress) {
      Alert.alert('Address Required', 'Please add a delivery address first');
      return;
    }

    setLoading(true);
    try {
      const response = await apiClient.addToSubscriptionCart({
        product: subscriptionData.product!._id,
        duration: subscriptionData.duration!,
        deliverySlot: subscriptionData.deliverySlot!,
        startDate: subscriptionData.startDate!,
        deliveryAddress,
      });

      if (response.success) {
        Alert.alert(
          'Added to Cart!',
          'Subscription added to cart successfully',
          [
            {
              text: 'View Cart',
              onPress: () => navigation.navigate('SubscriptionCart'),
            },
            {
              text: 'Continue Shopping',
              onPress: () => navigation.navigate('Home'),
            },
          ]
        );
      }
    } catch (error: any) {
      Alert.alert(
        'Error',
        error.response?.data?.message || 'Failed to add to cart'
      );
    } finally {
      setLoading(false);
    }
  };

  if (!subscriptionData.product) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Invalid subscription data</Text>
      </View>
    );
  }

  const total = calculateTotal();

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>Subscription Summary</Text>

        {/* Product Card */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>📦 Product</Text>
          <Text style={styles.productName}>{subscriptionData.product.name}</Text>
          <Text style={styles.productDescription}>
            {subscriptionData.product.description}
          </Text>
        </View>

        {/* Duration & Schedule */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>📅 Duration & Schedule</Text>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Duration:</Text>
            <Text style={styles.detailValue}>
              {subscriptionData.duration} days
            </Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Delivery Time:</Text>
            <Text style={styles.detailValue}>
              {subscriptionData.deliverySlot === 'morning' ? '🌅 Morning (6-9 AM)' : '🌆 Evening (5-8 PM)'}
            </Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Start Date:</Text>
            <Text style={styles.detailValue}>
              {subscriptionData.startDate &&
                new Date(subscriptionData.startDate).toLocaleDateString('en-US', {
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric',
                })}
            </Text>
          </View>
        </View>

        {/* Delivery Address */}
        {deliveryAddress && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>📍 Delivery Address</Text>
            <Text style={styles.addressText}>{deliveryAddress.street}</Text>
            <Text style={styles.addressText}>
              {deliveryAddress.city}, {deliveryAddress.state}
            </Text>
            <Text style={styles.addressText}>
              Pincode: {deliveryAddress.pincode}
            </Text>
          </View>
        )}

        {/* Pricing */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>💰 Pricing</Text>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Total Amount:</Text>
            <Text style={styles.priceValue}>₹{total}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Per Day:</Text>
            <Text style={styles.detailValue}>
              ₹{Math.round(total / subscriptionData.duration!)}
            </Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Payment:</Text>
            <Text style={styles.detailValue}>Cash on Delivery</Text>
          </View>
        </View>
      </ScrollView>

      <View style={styles.bottomContainer}>
        <View style={styles.totalContainer}>
          <Text style={styles.totalLabel}>Total Amount</Text>
          <Text style={styles.totalAmount}>₹{total}</Text>
        </View>
        <Button
          title="Add to Cart"
          onPress={handleAddToCart}
          loading={loading}
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
    marginBottom: spacing[4],
  },
  card: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: spacing[4],
    marginBottom: spacing[3],
  },
  cardTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text.primary,
    marginBottom: spacing[3],
  },
  productName: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
    marginBottom: spacing[1],
  },
  productDescription: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing[2],
  },
  detailLabel: {
    fontSize: typography.fontSize.base,
    color: colors.text.secondary,
  },
  detailValue: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.medium,
    color: colors.text.primary,
  },
  priceValue: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    color: colors.primary,
  },
  addressText: {
    fontSize: typography.fontSize.base,
    color: colors.text.secondary,
    marginBottom: spacing[1],
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontSize: typography.fontSize.lg,
    color: colors.text.secondary,
  },
  bottomContainer: {
    backgroundColor: colors.white,
    padding: spacing[4],
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  totalContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing[3],
  },
  totalLabel: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text.primary,
  },
  totalAmount: {
    fontSize: typography.fontSize['2xl'],
    fontWeight: typography.fontWeight.bold,
    color: colors.primary,
  },
});

