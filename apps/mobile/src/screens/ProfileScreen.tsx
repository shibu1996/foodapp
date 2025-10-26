/**
 * Profile Screen
 * User profile with edit capabilities
 */

import React, { useEffect, useState } from 'react';
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
import { Button, Input } from '../components';
import { colors, typography, spacing } from '../theme';
import { storage } from '../utils/storage';
import { User } from '../types';

type ProfileScreenNavigationProp = StackNavigationProp<MainStackParamList, 'Profile'>;
type ProfileScreenRouteProp = RouteProp<MainStackParamList, 'Profile'>;

interface Props {
  navigation: ProfileScreenNavigationProp;
  route: ProfileScreenRouteProp;
}

export const ProfileScreen: React.FC<Props> = ({ navigation }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
  });

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      const userData = await storage.getUser();
      if (userData) {
        setUser(userData);
        setFormData({
          name: userData.name || '',
          email: userData.email || '',
          phone: userData.phone || '',
        });
      }
    } catch (error) {
      console.error('Error loading user:', error);
    }
  };

  const handleSave = async () => {
    if (!formData.name.trim()) {
      Alert.alert('Error', 'Name is required');
      return;
    }

    try {
      const updatedUser: User = {
        ...user!,
        name: formData.name.trim(),
        email: formData.email.trim() || undefined,
      };

      await storage.setUser(updatedUser);
      setUser(updatedUser);
      setIsEditing(false);
      Alert.alert('Success', 'Profile updated successfully');
    } catch (error) {
      Alert.alert('Error', 'Failed to update profile');
    }
  };

  const handleLogout = async () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            await storage.clearAll();
            // Navigation will be handled by AppNavigator
          },
        },
      ]
    );
  };

  if (!user) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading profile...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}>
        {/* Profile Header */}
        <View style={styles.header}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {user.name?.charAt(0).toUpperCase() || '👤'}
            </Text>
          </View>
          <Text style={styles.userName}>{user.name}</Text>
          <Text style={styles.userPhone}>{user.phone}</Text>
        </View>

        {/* Profile Form */}
        <View style={styles.formCard}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>Personal Information</Text>
            {!isEditing && (
              <TouchableOpacity onPress={() => setIsEditing(true)}>
                <Text style={styles.editButton}>✏️ Edit</Text>
              </TouchableOpacity>
            )}
          </View>

          <Input
            label="Full Name *"
            placeholder="Enter your name"
            value={formData.name}
            onChangeText={value => setFormData({ ...formData, name: value })}
            editable={isEditing}
          />

          <Input
            label="Email (Optional)"
            placeholder="Enter your email"
            value={formData.email}
            onChangeText={value => setFormData({ ...formData, email: value })}
            keyboardType="email-address"
            autoCapitalize="none"
            editable={isEditing}
          />

          <Input
            label="Phone Number"
            placeholder="Phone number"
            value={formData.phone}
            editable={false}
            containerStyle={styles.disabledInput}
          />

          {isEditing && (
            <View style={styles.actions}>
              <Button
                title="Cancel"
                onPress={() => {
                  setIsEditing(false);
                  setFormData({
                    name: user.name || '',
                    email: user.email || '',
                    phone: user.phone || '',
                  });
                }}
                variant="outline"
                style={styles.actionButton}
              />
              <Button
                title="Save Changes"
                onPress={handleSave}
                style={styles.actionButton}
              />
            </View>
          )}
        </View>

        {/* Addresses */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>📍 Saved Addresses</Text>
            <TouchableOpacity onPress={() => navigation.navigate('AddAddress')}>
              <Text style={styles.addButton}>+ Add</Text>
            </TouchableOpacity>
          </View>

          {user.addresses && user.addresses.length > 0 ? (
            user.addresses.map((address, index) => (
              <View key={index} style={styles.addressItem}>
                <Text style={styles.addressType}>
                  {address.type === 'home'
                    ? '🏠 Home'
                    : address.type === 'work'
                    ? '💼 Work'
                    : '📍 Other'}
                  {address.isDefault && (
                    <Text style={styles.defaultBadge}> • Default</Text>
                  )}
                </Text>
                <Text style={styles.addressText}>{address.street}</Text>
                <Text style={styles.addressText}>
                  {address.city}, {address.state} - {address.pincode}
                </Text>
              </View>
            ))
          ) : (
            <Text style={styles.emptyText}>No saved addresses</Text>
          )}
        </View>

        {/* Quick Actions */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Quick Actions</Text>

          <TouchableOpacity
            style={styles.actionItem}
            onPress={() => navigation.navigate('Orders')}>
            <Text style={styles.actionIcon}>📦</Text>
            <Text style={styles.actionText}>My Orders</Text>
            <Text style={styles.actionArrow}>→</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionItem}
            onPress={() => navigation.navigate('Subscriptions')}>
            <Text style={styles.actionIcon}>📅</Text>
            <Text style={styles.actionText}>My Subscriptions</Text>
            <Text style={styles.actionArrow}>→</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionItem}
            onPress={() => navigation.navigate('Cart')}>
            <Text style={styles.actionIcon}>🛒</Text>
            <Text style={styles.actionText}>My Cart</Text>
            <Text style={styles.actionArrow}>→</Text>
          </TouchableOpacity>
        </View>

        {/* App Info */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>About</Text>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>App Version</Text>
            <Text style={styles.infoValue}>1.0.0</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Build</Text>
            <Text style={styles.infoValue}>React Native 0.72.6</Text>
          </View>
        </View>

        {/* Logout Button */}
        <TouchableOpacity
          style={styles.logoutButton}
          onPress={handleLogout}
          activeOpacity={0.7}>
          <Text style={styles.logoutText}>🚪 Logout</Text>
        </TouchableOpacity>

        <View style={styles.bottomPadding} />
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
  },
  loadingText: {
    fontSize: typography.fontSize.base,
    color: colors.text.secondary,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing[4],
  },
  header: {
    alignItems: 'center',
    marginBottom: spacing[6],
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing[3],
  },
  avatarText: {
    fontSize: 36,
    fontWeight: typography.fontWeight.bold,
    color: colors.white,
  },
  userName: {
    fontSize: typography.fontSize['2xl'],
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
    marginBottom: spacing[1],
  },
  userPhone: {
    fontSize: typography.fontSize.base,
    color: colors.text.secondary,
  },
  formCard: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: spacing[4],
    marginBottom: spacing[3],
  },
  card: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: spacing[4],
    marginBottom: spacing[3],
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing[3],
  },
  cardTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text.primary,
  },
  editButton: {
    fontSize: typography.fontSize.sm,
    color: colors.primary,
    fontWeight: typography.fontWeight.medium,
  },
  addButton: {
    fontSize: typography.fontSize.sm,
    color: colors.primary,
    fontWeight: typography.fontWeight.semibold,
  },
  disabledInput: {
    opacity: 0.6,
  },
  actions: {
    flexDirection: 'row',
    gap: spacing[2],
    marginTop: spacing[4],
  },
  actionButton: {
    flex: 1,
  },
  addressItem: {
    paddingVertical: spacing[3],
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  addressType: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text.primary,
    marginBottom: spacing[1],
  },
  defaultBadge: {
    color: colors.primary,
    fontSize: typography.fontSize.xs,
  },
  addressText: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
    marginBottom: spacing[1],
  },
  emptyText: {
    fontSize: typography.fontSize.sm,
    color: colors.text.tertiary,
    textAlign: 'center',
    paddingVertical: spacing[4],
  },
  actionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing[3],
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  actionIcon: {
    fontSize: 20,
    marginRight: spacing[3],
  },
  actionText: {
    flex: 1,
    fontSize: typography.fontSize.base,
    color: colors.text.primary,
  },
  actionArrow: {
    fontSize: typography.fontSize.lg,
    color: colors.text.tertiary,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing[2],
  },
  infoLabel: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
  },
  infoValue: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    color: colors.text.primary,
  },
  logoutButton: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: spacing[4],
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.error,
  },
  logoutText: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
    color: colors.error,
  },
  bottomPadding: {
    height: spacing[4],
  },
});



