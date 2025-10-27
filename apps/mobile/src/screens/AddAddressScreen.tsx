/**
 * Add Address Screen
 * Simple form to add new delivery address
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';
import { MainStackParamList } from '../navigation/types';
import { Button, Input } from '../components';
import { colors, typography, spacing } from '../theme';
import { storage } from '../utils/storage';
import { Address, User } from '../types';

type AddAddressScreenNavigationProp = StackNavigationProp<
  MainStackParamList,
  'AddAddress'
>;
type AddAddressScreenRouteProp = RouteProp<MainStackParamList, 'AddAddress'>;

interface Props {
  navigation: AddAddressScreenNavigationProp;
  route: AddAddressScreenRouteProp;
}

export const AddAddressScreen: React.FC<Props> = ({ navigation }) => {
  const [formData, setFormData] = useState({
    street: '',
    city: '',
    state: '',
    pincode: '',
    landmark: '',
    type: 'home' as 'home' | 'work' | 'other',
  });
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    // Validate
    if (!formData.street || !formData.city || !formData.state || !formData.pincode) {
      Alert.alert('Missing Information', 'Please fill all required fields');
      return;
    }

    setLoading(true);
    try {
      const user = await storage.getUser();
      if (user) {
        const newAddress: Address = {
          ...formData,
          isDefault: !user.addresses || user.addresses.length === 0,
        };

        const updatedUser: User = {
          ...user,
          addresses: [...(user.addresses || []), newAddress],
        };

        await storage.setUser(updatedUser);
        Alert.alert('Success', 'Address added successfully', [
          { text: 'OK', onPress: () => navigation.goBack() },
        ]);
      }
    } catch (error) {
      console.error('Error saving address:', error);
      Alert.alert('Error', 'Failed to save address');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled">
        <Text style={styles.title}>Add New Address</Text>

        <Input
          label="Street Address *"
          placeholder="House No, Building Name, Street"
          value={formData.street}
          onChangeText={value => setFormData({ ...formData, street: value })}
          multiline
          numberOfLines={2}
        />

        <Input
          label="City *"
          placeholder="Enter city"
          value={formData.city}
          onChangeText={value => setFormData({ ...formData, city: value })}
        />

        <Input
          label="State *"
          placeholder="Enter state"
          value={formData.state}
          onChangeText={value => setFormData({ ...formData, state: value })}
        />

        <Input
          label="Pincode *"
          placeholder="Enter pincode"
          value={formData.pincode}
          onChangeText={value => setFormData({ ...formData, pincode: value })}
          keyboardType="number-pad"
          maxLength={6}
        />

        <Input
          label="Landmark (Optional)"
          placeholder="Nearby landmark"
          value={formData.landmark}
          onChangeText={value => setFormData({ ...formData, landmark: value })}
        />

        <Text style={styles.label}>Address Type *</Text>
        <View style={styles.typeContainer}>
          {(['home', 'work', 'other'] as const).map(type => (
            <TouchableOpacity
              key={type}
              style={[
                styles.typeButton,
                formData.type === type && styles.typeButtonSelected,
              ]}
              onPress={() => setFormData({ ...formData, type })}
              activeOpacity={0.7}>
              <Text
                style={[
                  styles.typeText,
                  formData.type === type && styles.typeTextSelected,
                ]}>
                {type === 'home' ? '🏠 Home' : type === 'work' ? '💼 Work' : '📍 Other'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <Button
          title="Save Address"
          onPress={handleSave}
          loading={loading}
          fullWidth
          size="lg"
          style={styles.saveButton}
        />
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

// Import TouchableOpacity
import { TouchableOpacity } from 'react-native';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
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
  label: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    color: colors.text.primary,
    marginBottom: spacing[2],
  },
  typeContainer: {
    flexDirection: 'row',
    marginBottom: spacing[4],
  },
  typeButton: {
    flex: 1,
    paddingVertical: spacing[3],
    paddingHorizontal: spacing[2],
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    marginRight: spacing[2],
    alignItems: 'center',
  },
  typeButtonSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primary + '10',
  },
  typeText: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
  },
  typeTextSelected: {
    color: colors.primary,
    fontWeight: typography.fontWeight.semibold,
  },
  saveButton: {
    marginTop: spacing[4],
  },
});






