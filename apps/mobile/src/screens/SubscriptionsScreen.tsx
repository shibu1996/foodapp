/**
 * Subscriptions Screen
 * List of user's subscriptions
 */

import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';
import { MainStackParamList } from '../navigation/types';
import { colors, typography, spacing } from '../theme';
import { apiClient } from '../services/apiClient';
import { Subscription } from '../types';

type SubscriptionsScreenNavigationProp = StackNavigationProp<
  MainStackParamList,
  'Subscriptions'
>;
type SubscriptionsScreenRouteProp = RouteProp<MainStackParamList, 'Subscriptions'>;

interface Props {
  navigation: SubscriptionsScreenNavigationProp;
  route: SubscriptionsScreenRouteProp;
}

export const SubscriptionsScreen: React.FC<Props> = ({ navigation }) => {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadSubscriptions();
  }, []);

  const loadSubscriptions = async () => {
    try {
      setLoading(true);
      const response = await apiClient.getMySubscriptions();
      if (response.success && response.data) {
        setSubscriptions(response.data);
      }
    } catch (error) {
      console.error('Error loading subscriptions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadSubscriptions();
    setRefreshing(false);
  };

  const handlePause = async (id: string) => {
    try {
      await apiClient.pauseSubscription(id);
      Alert.alert('Success', 'Subscription paused');
      loadSubscriptions();
    } catch (error) {
      Alert.alert('Error', 'Failed to pause subscription');
    }
  };

  const handleResume = async (id: string) => {
    try {
      await apiClient.resumeSubscription(id);
      Alert.alert('Success', 'Subscription resumed');
      loadSubscriptions();
    } catch (error) {
      Alert.alert('Error', 'Failed to resume subscription');
    }
  };

  const handleCancel = async (id: string) => {
    Alert.alert(
      'Cancel Subscription',
      'Are you sure you want to cancel this subscription?',
      [
        { text: 'No', style: 'cancel' },
        {
          text: 'Yes, Cancel',
          style: 'destructive',
          onPress: async () => {
            try {
              await apiClient.cancelSubscription(id);
              Alert.alert('Success', 'Subscription cancelled');
              loadSubscriptions();
            } catch (error) {
              Alert.alert('Error', 'Failed to cancel subscription');
            }
          },
        },
      ]
    );
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return colors.success;
      case 'paused':
        return colors.warning;
      case 'cancelled':
      case 'completed':
        return colors.error;
      default:
        return colors.text.tertiary;
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Loading subscriptions...</Text>
      </View>
    );
  }

  if (subscriptions.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyEmoji}>📅</Text>
        <Text style={styles.emptyTitle}>No Subscriptions Yet</Text>
        <Text style={styles.emptySubtitle}>
          Subscribe to your favorite products for daily delivery
        </Text>
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
        {subscriptions.map(subscription => {
          const productName =
            typeof subscription.product === 'string'
              ? 'Product'
              : subscription.product.name;

          return (
            <View key={subscription._id} style={styles.subscriptionCard}>
              <View style={styles.cardHeader}>
                <Text style={styles.productName}>{productName}</Text>
                <View
                  style={[
                    styles.statusBadge,
                    { backgroundColor: getStatusColor(subscription.status) + '20' },
                  ]}>
                  <Text
                    style={[
                      styles.statusText,
                      { color: getStatusColor(subscription.status) },
                    ]}>
                    {subscription.status}
                  </Text>
                </View>
              </View>

              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Duration:</Text>
                <Text style={styles.detailValue}>{subscription.duration} days</Text>
              </View>

              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Time:</Text>
                <Text style={styles.detailValue}>
                  {subscription.deliverySlot === 'morning' ? '🌅 Morning' : '🌆 Evening'}
                </Text>
              </View>

              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Start Date:</Text>
                <Text style={styles.detailValue}>
                  {new Date(subscription.startDate).toLocaleDateString()}
                </Text>
              </View>

              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Total:</Text>
                <Text style={styles.priceValue}>₹{subscription.totalAmount}</Text>
              </View>

              {/* Action Buttons */}
              {subscription.status === 'active' && (
                <View style={styles.actions}>
                  <TouchableOpacity
                    style={[styles.actionButton, styles.pauseButton]}
                    onPress={() => handlePause(subscription._id)}>
                    <Text style={styles.actionButtonText}>⏸️ Pause</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.actionButton, styles.cancelButton]}
                    onPress={() => handleCancel(subscription._id)}>
                    <Text style={styles.actionButtonText}>❌ Cancel</Text>
                  </TouchableOpacity>
                </View>
              )}

              {subscription.status === 'paused' && (
                <View style={styles.actions}>
                  <TouchableOpacity
                    style={[styles.actionButton, styles.resumeButton]}
                    onPress={() => handleResume(subscription._id)}>
                    <Text style={styles.actionButtonText}>▶️ Resume</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.actionButton, styles.cancelButton]}
                    onPress={() => handleCancel(subscription._id)}>
                    <Text style={styles.actionButtonText}>❌ Cancel</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          );
        })}
      </ScrollView>
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
  subscriptionCard: {
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
  cardHeader: {
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
  statusBadge: {
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[1],
    borderRadius: 16,
    marginLeft: spacing[2],
  },
  statusText: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.semibold,
    textTransform: 'capitalize',
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
  priceValue: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.primary,
  },
  actions: {
    flexDirection: 'row',
    marginTop: spacing[3],
    gap: spacing[2],
  },
  actionButton: {
    flex: 1,
    paddingVertical: spacing[2],
    borderRadius: 8,
    alignItems: 'center',
  },
  pauseButton: {
    backgroundColor: colors.warning + '20',
  },
  resumeButton: {
    backgroundColor: colors.success + '20',
  },
  cancelButton: {
    backgroundColor: colors.error + '20',
  },
  actionButtonText: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semibold,
  },
});


