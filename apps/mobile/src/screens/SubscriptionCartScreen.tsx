/**
 * Subscription Cart Screen
 * Display and manage subscription cart items
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';
import { MainStackParamList } from '../navigation/types';
import { Button } from '../components';
import { colors, typography, spacing } from '../theme';
import { apiClient } from '../services/apiClient';

type SubscriptionCartScreenNavigationProp = StackNavigationProp<
  MainStackParamList,
  'SubscriptionCart'
>;
type SubscriptionCartScreenRouteProp = RouteProp<
  MainStackParamList,
  'SubscriptionCart'
>;

interface Props {
  navigation: SubscriptionCartScreenNavigationProp;
  route: SubscriptionCartScreenRouteProp;
}

export const SubscriptionCartScreen: React.FC<Props> = ({ navigation }) => {
  const [cart, setCart] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [checkingOut, setCheckingOut] = useState(false);

  useEffect(() => {
    loadCart();
  }, []);

  const loadCart = async () => {
    try {
      setLoading(true);
      const response = await apiClient.getSubscriptionCart();
      if (response.success) {
        setCart(response.data);
      }
    } catch (error) {
      console.error('Load cart error:', error);
      Alert.alert('Error', 'Failed to load cart');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadCart();
    setRefreshing(false);
  };

  const handleRemove = async (itemId: string) => {
    Alert.alert(
      'Remove Item',
      'Remove this subscription from cart?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            try {
              const response = await apiClient.removeFromSubscriptionCart(itemId);
              if (response.success) {
                setCart(response.data);
                Alert.alert('Success', 'Item removed from cart');
              }
            } catch (error: any) {
              Alert.alert('Error', error.response?.data?.message || 'Failed to remove item');
            }
          },
        },
      ]
    );
  };

  const handleCheckout = async () => {
    if (!cart || cart.items.length === 0) {
      Alert.alert('Cart Empty', 'Please add subscriptions to cart first');
      return;
    }

    Alert.alert(
      'Checkout',
      `Create ${cart.items.length} subscription(s)?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Confirm',
          onPress: async () => {
            try {
              setCheckingOut(true);
              const response = await apiClient.checkoutSubscriptionCart('cod');

              if (response.success) {
                Alert.alert(
                  'Success!',
                  `${response.data.count} subscription(s) created successfully`,
                  [
                    {
                      text: 'View Subscriptions',
                      onPress: () => navigation.navigate('Subscriptions'),
                    },
                  ]
                );
              }
            } catch (error: any) {
              Alert.alert('Error', error.response?.data?.message || 'Checkout failed');
            } finally {
              setCheckingOut(false);
            }
          },
        },
      ]
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Loading cart...</Text>
      </View>
    );
  }

  if (!cart || cart.items.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyEmoji}>📅</Text>
        <Text style={styles.emptyTitle}>Your subscription cart is empty</Text>
        <Text style={styles.emptySubtitle}>Add subscriptions to get started</Text>
        <TouchableOpacity
          style={styles.browseButton}
          onPress={() => navigation.navigate('Home')}
          activeOpacity={0.7}>
          <Text style={styles.browseButtonText}>Browse Products</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={[colors.primary]}
          />
        }
        showsVerticalScrollIndicator={false}>
        <Text style={styles.header}>{cart.items.length} Subscription(s) in Cart</Text>

        {cart.items.map((item: any) => (
          <View key={item._id} style={styles.itemCard}>
            <View style={styles.itemHeader}>
              <Text style={styles.productName}>{item.product.name}</Text>
              <Text style={styles.price}>₹{item.calculatedAmount}</Text>
            </View>

            <View style={styles.itemDetails}>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Duration:</Text>
                <Text style={styles.detailValue}>{item.duration} days</Text>
              </View>

              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Timeslot:</Text>
                <Text style={styles.detailValue}>
                  {item.deliverySlot === 'morning' ? '🌅 Morning (6-9 AM)' : '🌆 Evening (5-8 PM)'}
                </Text>
              </View>

              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Start Date:</Text>
                <Text style={styles.detailValue}>
                  {new Date(item.startDate).toLocaleDateString()}
                </Text>
              </View>

              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Per Day:</Text>
                <Text style={styles.detailValue}>
                  ₹{Math.round(item.calculatedAmount / item.duration)}
                </Text>
              </View>
            </View>

            <View style={styles.addressSection}>
              <Text style={styles.addressLabel}>Delivery Address:</Text>
              <Text style={styles.addressText}>
                {item.deliveryAddress.street}, {item.deliveryAddress.city}, {item.deliveryAddress.state} - {item.deliveryAddress.pincode}
              </Text>
            </View>

            <TouchableOpacity
              style={styles.removeButton}
              onPress={() => handleRemove(item._id)}
              activeOpacity={0.7}>
              <Text style={styles.removeButtonText}>🗑️ Remove</Text>
            </TouchableOpacity>
          </View>
        ))}
      </ScrollView>

      <View style={styles.bottomContainer}>
        <View style={styles.totalContainer}>
          <Text style={styles.totalLabel}>Total Amount</Text>
          <Text style={styles.totalAmount}>₹{cart.totalAmount}</Text>
        </View>

        <Button
          title="Checkout"
          onPress={handleCheckout}
          loading={checkingOut}
          fullWidth
          size="lg"
        />

        <TouchableOpacity
          style={styles.continueButton}
          onPress={() => navigation.navigate('Home')}
          activeOpacity={0.7}>
          <Text style={styles.continueButtonText}>Add More Subscriptions</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.backgroundSecondary,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
  loadingText: {
    marginTop: spacing[4],
    fontSize: typography.fontSize.base,
    color: colors.text.secondary,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
    padding: spacing[6],
  },
  emptyEmoji: {
    fontSize: 80,
    marginBottom: spacing[4],
  },
  emptyTitle: {
    fontSize: typography.fontSize['2xl'],
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
    marginBottom: spacing[2],
  },
  emptySubtitle: {
    fontSize: typography.fontSize.base,
    color: colors.text.secondary,
    textAlign: 'center',
    marginBottom: spacing[6],
  },
  browseButton: {
    backgroundColor: colors.primary,
    paddingVertical: spacing[3],
    paddingHorizontal: spacing[6],
    borderRadius: 8,
  },
  browseButtonText: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
    color: colors.white,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing[4],
  },
  header: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text.primary,
    marginBottom: spacing[4],
  },
  itemCard: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: spacing[4],
    marginBottom: spacing[3],
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing[3],
  },
  productName: {
    flex: 1,
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
  },
  price: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    color: colors.primary,
  },
  itemDetails: {
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: spacing[3],
    marginBottom: spacing[3],
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing[2],
  },
  detailLabel: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
  },
  detailValue: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    color: colors.text.primary,
  },
  addressSection: {
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: spacing[3],
    marginBottom: spacing[3],
  },
  addressLabel: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    color: colors.text.secondary,
    marginBottom: spacing[1],
  },
  addressText: {
    fontSize: typography.fontSize.sm,
    color: colors.text.primary,
  },
  removeButton: {
    backgroundColor: colors.error + '20',
    paddingVertical: spacing[2],
    borderRadius: 8,
    alignItems: 'center',
  },
  removeButtonText: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semibold,
    color: colors.error,
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
  continueButton: {
    marginTop: spacing[3],
    paddingVertical: spacing[3],
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.primary,
    borderRadius: 8,
  },
  continueButtonText: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
    color: colors.primary,
  },
});





