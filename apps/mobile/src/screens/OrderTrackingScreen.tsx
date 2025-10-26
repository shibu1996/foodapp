/**
 * Order Tracking Screen
 * Track order status with timeline
 */

import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';
import { MainStackParamList } from '../navigation/types';
import { colors, typography, spacing } from '../theme';
import { apiClient } from '../services/apiClient';
import { Order } from '../types';

type OrderTrackingScreenNavigationProp = StackNavigationProp<
  MainStackParamList,
  'OrderTracking'
>;
type OrderTrackingScreenRouteProp = RouteProp<
  MainStackParamList,
  'OrderTracking'
>;

interface Props {
  navigation: OrderTrackingScreenNavigationProp;
  route: OrderTrackingScreenRouteProp;
}

const ORDER_STATUSES = [
  { key: 'pending', label: 'Order Placed', emoji: '📝' },
  { key: 'confirmed', label: 'Confirmed', emoji: '✓' },
  { key: 'preparing', label: 'Preparing', emoji: '👨‍🍳' },
  { key: 'out-for-delivery', label: 'Out for Delivery', emoji: '🚚' },
  { key: 'delivered', label: 'Delivered', emoji: '✅' },
];

export const OrderTrackingScreen: React.FC<Props> = ({ route }) => {
  const { orderId, order: initialOrder } = route.params;
  const [order, setOrder] = useState<Order | null>(initialOrder || null);
  const [loading, setLoading] = useState(!initialOrder);

  useEffect(() => {
    if (!initialOrder) {
      loadOrder();
    }
  }, [orderId]);

  const loadOrder = async () => {
    try {
      setLoading(true);
      const response = await apiClient.getOrderById(orderId);
      if (response.success && response.data) {
        setOrder(response.data);
      }
    } catch (error) {
      console.error('Error loading order:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIndex = (status: string) => {
    return ORDER_STATUSES.findIndex(s => s.key === status);
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (!order) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Order not found</Text>
      </View>
    );
  }

  const currentStatusIndex = getStatusIndex(order.status);
  const isCancelled = order.status === 'cancelled';

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}>
      {/* Order ID Card */}
      <View style={styles.orderIdCard}>
        <Text style={styles.orderIdLabel}>Order ID</Text>
        <Text style={styles.orderId}>#{order._id.slice(-6).toUpperCase()}</Text>
        <Text style={styles.orderDate}>
          {new Date(order.createdAt).toLocaleDateString('en-US', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
          })}
        </Text>
      </View>

      {/* Status Timeline */}
      {!isCancelled && (
        <View style={styles.timelineCard}>
          <Text style={styles.sectionTitle}>Order Status</Text>
          {ORDER_STATUSES.map((status, index) => {
            const isCompleted = index <= currentStatusIndex;
            const isCurrent = index === currentStatusIndex;

            return (
              <View key={status.key} style={styles.timelineItem}>
                {/* Connector Line */}
                {index > 0 && (
                  <View
                    style={[
                      styles.connector,
                      isCompleted && styles.connectorCompleted,
                    ]}
                  />
                )}

                {/* Status Point */}
                <View
                  style={[
                    styles.statusPoint,
                    isCompleted && styles.statusPointCompleted,
                    isCurrent && styles.statusPointCurrent,
                  ]}>
                  {isCompleted && (
                    <Text style={styles.statusEmoji}>{status.emoji}</Text>
                  )}
                </View>

                {/* Status Text */}
                <View style={styles.statusTextContainer}>
                  <Text
                    style={[
                      styles.statusLabel,
                      isCompleted && styles.statusLabelCompleted,
                    ]}>
                    {status.label}
                  </Text>
                  {isCurrent && (
                    <Text style={styles.currentStatusText}>Current Status</Text>
                  )}
                </View>
              </View>
            );
          })}
        </View>
      )}

      {/* Cancelled Status */}
      {isCancelled && (
        <View style={styles.cancelledCard}>
          <Text style={styles.cancelledEmoji}>❌</Text>
          <Text style={styles.cancelledTitle}>Order Cancelled</Text>
          <Text style={styles.cancelledText}>
            This order has been cancelled
          </Text>
        </View>
      )}

      {/* Order Items */}
      <View style={styles.itemsCard}>
        <Text style={styles.sectionTitle}>Order Items</Text>
        {order.items.map((item, index) => {
          const productName =
            typeof item.product === 'string' ? 'Product' : item.product.name;
          return (
            <View key={index} style={styles.orderItem}>
              <View style={styles.itemInfo}>
                <Text style={styles.itemName}>{productName}</Text>
                <Text style={styles.itemQuantity}>Qty: {item.quantity}</Text>
              </View>
              <Text style={styles.itemPrice}>₹{item.price * item.quantity}</Text>
            </View>
          );
        })}
      </View>

      {/* Bill Details */}
      <View style={styles.billCard}>
        <Text style={styles.sectionTitle}>Bill Details</Text>
        <View style={styles.billRow}>
          <Text style={styles.billLabel}>Item Total</Text>
          <Text style={styles.billValue}>₹{order.totalAmount}</Text>
        </View>
        <View style={styles.divider} />
        <View style={styles.billRow}>
          <Text style={styles.billTotalLabel}>Total</Text>
          <Text style={styles.billTotalValue}>₹{order.totalAmount}</Text>
        </View>
      </View>

      {/* Delivery Address */}
      <View style={styles.addressCard}>
        <Text style={styles.sectionTitle}>Delivery Address</Text>
        <Text style={styles.addressText}>
          {order.deliveryAddress.street}
        </Text>
        <Text style={styles.addressText}>
          {order.deliveryAddress.city}, {order.deliveryAddress.state}
        </Text>
        <Text style={styles.addressText}>
          Pincode: {order.deliveryAddress.pincode}
        </Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.backgroundSecondary,
  },
  scrollContent: {
    padding: spacing[4],
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
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
  orderIdCard: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    padding: spacing[4],
    marginBottom: spacing[4],
    alignItems: 'center',
  },
  orderIdLabel: {
    fontSize: typography.fontSize.sm,
    color: colors.white,
    opacity: 0.9,
  },
  orderId: {
    fontSize: typography.fontSize['3xl'],
    fontWeight: typography.fontWeight.bold,
    color: colors.white,
    marginVertical: spacing[2],
  },
  orderDate: {
    fontSize: typography.fontSize.sm,
    color: colors.white,
    opacity: 0.9,
  },
  timelineCard: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: spacing[4],
    marginBottom: spacing[4],
  },
  sectionTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text.primary,
    marginBottom: spacing[4],
  },
  timelineItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing[4],
    position: 'relative',
  },
  connector: {
    position: 'absolute',
    left: 15,
    top: -spacing[4],
    width: 2,
    height: spacing[4],
    backgroundColor: colors.gray[300],
  },
  connectorCompleted: {
    backgroundColor: colors.primary,
  },
  statusPoint: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.gray[200],
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing[3],
  },
  statusPointCompleted: {
    backgroundColor: colors.primary,
  },
  statusPointCurrent: {
    backgroundColor: colors.primary,
    borderWidth: 3,
    borderColor: colors.primary + '40',
  },
  statusEmoji: {
    fontSize: 16,
  },
  statusTextContainer: {
    flex: 1,
  },
  statusLabel: {
    fontSize: typography.fontSize.base,
    color: colors.text.tertiary,
  },
  statusLabelCompleted: {
    color: colors.text.primary,
    fontWeight: typography.fontWeight.medium,
  },
  currentStatusText: {
    fontSize: typography.fontSize.xs,
    color: colors.primary,
    marginTop: 2,
  },
  cancelledCard: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: spacing[6],
    marginBottom: spacing[4],
    alignItems: 'center',
  },
  cancelledEmoji: {
    fontSize: 64,
    marginBottom: spacing[3],
  },
  cancelledTitle: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    color: colors.error,
    marginBottom: spacing[2],
  },
  cancelledText: {
    fontSize: typography.fontSize.base,
    color: colors.text.secondary,
    textAlign: 'center',
  },
  itemsCard: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: spacing[4],
    marginBottom: spacing[4],
  },
  orderItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing[2],
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  itemInfo: {
    flex: 1,
  },
  itemName: {
    fontSize: typography.fontSize.base,
    color: colors.text.primary,
    marginBottom: spacing[1],
  },
  itemQuantity: {
    fontSize: typography.fontSize.sm,
    color: colors.text.tertiary,
  },
  itemPrice: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text.primary,
  },
  billCard: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: spacing[4],
    marginBottom: spacing[4],
  },
  billRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing[2],
  },
  billLabel: {
    fontSize: typography.fontSize.base,
    color: colors.text.secondary,
  },
  billValue: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.medium,
    color: colors.text.primary,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: spacing[3],
  },
  billTotalLabel: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
  },
  billTotalValue: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    color: colors.primary,
  },
  addressCard: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: spacing[4],
  },
  addressText: {
    fontSize: typography.fontSize.base,
    color: colors.text.secondary,
    marginBottom: spacing[1],
  },
});



