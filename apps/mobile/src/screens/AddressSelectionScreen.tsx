/**
 * Address Selection Screen
 * Choose or add delivery address for checkout
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';
import { MainStackParamList } from '../navigation/types';
import { Button } from '../components';
import { colors, typography, spacing } from '../theme';
import { storage } from '../utils/storage';
import { Address, User } from '../types';

type AddressSelectionScreenNavigationProp = StackNavigationProp<
  MainStackParamList,
  'AddressSelection'
>;
type AddressSelectionScreenRouteProp = RouteProp<
  MainStackParamList,
  'AddressSelection'
>;

interface Props {
  navigation: AddressSelectionScreenNavigationProp;
  route: AddressSelectionScreenRouteProp;
}

export const AddressSelectionScreen: React.FC<Props> = ({ navigation }) => {
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selectedAddress, setSelectedAddress] = useState<Address | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAddresses();
  }, []);

  const loadAddresses = async () => {
    try {
      const user = await storage.getUser();
      if (user && user.addresses) {
        setAddresses(user.addresses);
        // Auto-select default address
        const defaultAddr = user.addresses.find(addr => addr.isDefault);
        if (defaultAddr) {
          setSelectedAddress(defaultAddr);
        }
      }
    } catch (error) {
      console.error('Error loading addresses:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleProceed = () => {
    if (!selectedAddress) {
      Alert.alert('Select Address', 'Please select a delivery address');
      return;
    }

    // Navigate to payment screen
    navigation.navigate('Payment', {
      totalAmount: 0, // Will be passed from cart
      items: [],
    });
  };

  const handleAddAddress = () => {
    navigation.navigate('AddAddress');
  };

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>Select Delivery Address</Text>

        {addresses.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyEmoji}>📍</Text>
            <Text style={styles.emptyText}>No saved addresses</Text>
            <Text style={styles.emptySubtext}>
              Add a delivery address to continue
            </Text>
          </View>
        ) : (
          addresses.map((address, index) => (
            <TouchableOpacity
              key={index}
              style={[
                styles.addressCard,
                selectedAddress === address && styles.addressCardSelected,
              ]}
              onPress={() => setSelectedAddress(address)}
              activeOpacity={0.7}>
              <View style={styles.addressHeader}>
                <View style={styles.addressType}>
                  <Text style={styles.addressTypeText}>
                    {address.type === 'home'
                      ? '🏠 Home'
                      : address.type === 'work'
                      ? '💼 Work'
                      : '📍 Other'}
                  </Text>
                  {address.isDefault && (
                    <View style={styles.defaultBadge}>
                      <Text style={styles.defaultText}>Default</Text>
                    </View>
                  )}
                </View>
                {selectedAddress === address && (
                  <View style={styles.selectedBadge}>
                    <Text style={styles.selectedIcon}>✓</Text>
                  </View>
                )}
              </View>

              <Text style={styles.addressStreet}>{address.street}</Text>
              <Text style={styles.addressCity}>
                {address.city}, {address.state} - {address.pincode}
              </Text>
              {address.landmark && (
                <Text style={styles.addressLandmark}>
                  Near: {address.landmark}
                </Text>
              )}
            </TouchableOpacity>
          ))
        )}

        {/* Add Address Button */}
        <TouchableOpacity
          style={styles.addAddressButton}
          onPress={handleAddAddress}
          activeOpacity={0.7}>
          <Text style={styles.addAddressIcon}>+</Text>
          <Text style={styles.addAddressText}>Add New Address</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Bottom Button */}
      {addresses.length > 0 && (
        <View style={styles.bottomContainer}>
          <Button
            title="Proceed to Payment"
            onPress={handleProceed}
            disabled={!selectedAddress}
            fullWidth
            size="lg"
          />
        </View>
      )}
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
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: spacing[12],
  },
  emptyEmoji: {
    fontSize: 64,
    marginBottom: spacing[4],
  },
  emptyText: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text.secondary,
    marginBottom: spacing[2],
  },
  emptySubtext: {
    fontSize: typography.fontSize.sm,
    color: colors.text.tertiary,
    textAlign: 'center',
  },
  addressCard: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: spacing[4],
    marginBottom: spacing[3],
    borderWidth: 2,
    borderColor: colors.border,
  },
  addressCardSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primaryLight + '10',
  },
  addressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing[2],
  },
  addressType: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  addressTypeText: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text.primary,
    marginRight: spacing[2],
  },
  defaultBadge: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing[2],
    paddingVertical: 2,
    borderRadius: 4,
  },
  defaultText: {
    fontSize: typography.fontSize.xs,
    color: colors.white,
    fontWeight: typography.fontWeight.medium,
  },
  selectedBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  selectedIcon: {
    color: colors.white,
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.bold,
  },
  addressStreet: {
    fontSize: typography.fontSize.base,
    color: colors.text.primary,
    marginBottom: spacing[1],
  },
  addressCity: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
    marginBottom: spacing[1],
  },
  addressLandmark: {
    fontSize: typography.fontSize.sm,
    color: colors.text.tertiary,
  },
  addAddressButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: spacing[4],
    borderWidth: 2,
    borderColor: colors.border,
    borderStyle: 'dashed',
  },
  addAddressIcon: {
    fontSize: 24,
    color: colors.primary,
    marginRight: spacing[2],
  },
  addAddressText: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
    color: colors.primary,
  },
  bottomContainer: {
    backgroundColor: colors.white,
    padding: spacing[4],
    borderTopWidth: 1,
    borderTopColor: colors.border,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
});





