/**
 * Header Component
 * Top bar with profile, location, and navigation
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Pressable,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { MainStackParamList } from '../navigation/types';
import { colors, typography, spacing } from '../theme';
import { User } from '../types';
import { useCart } from '../context/CartContext';

type NavigationProp = StackNavigationProp<MainStackParamList>;

interface HeaderProps {
  user: User | null;
  location: string;
  onLocationPress: () => void;
  onProfilePress: () => void;
  onLogout: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  user,
  location,
  onLocationPress,
  onProfilePress,
  onLogout,
}) => {
  const [showMenu, setShowMenu] = useState(false);
  const navigation = useNavigation<NavigationProp>();
  const { itemCount } = useCart();

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        {/* Location */}
        <TouchableOpacity
          style={styles.locationContainer}
          onPress={onLocationPress}
          activeOpacity={0.7}>
          <Text style={styles.locationLabel}>Deliver to</Text>
          <View style={styles.locationRow}>
            <Text style={styles.locationText} numberOfLines={1}>
              📍 {location}
            </Text>
            <Text style={styles.locationIcon}>▼</Text>
          </View>
        </TouchableOpacity>

        {/* Cart Icon */}
        <TouchableOpacity
          style={styles.cartButton}
          onPress={() => navigation.navigate('Cart')}
          activeOpacity={0.7}>
          <Text style={styles.cartIcon}>🛒</Text>
          {itemCount > 0 && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>
                {itemCount > 99 ? '99+' : itemCount}
              </Text>
            </View>
          )}
        </TouchableOpacity>

        {/* Profile */}
        <TouchableOpacity
          style={styles.profileButton}
          onPress={() => setShowMenu(true)}
          activeOpacity={0.7}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {user?.name?.charAt(0).toUpperCase() || '👤'}
            </Text>
          </View>
        </TouchableOpacity>
      </View>

      {/* Profile Menu Modal */}
      <Modal
        visible={showMenu}
        transparent
        animationType="fade"
        onRequestClose={() => setShowMenu(false)}>
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setShowMenu(false)}>
          <View style={styles.menuContainer}>
            <View style={styles.menuHeader}>
              <Text style={styles.menuName}>{user?.name || 'User'}</Text>
              <Text style={styles.menuPhone}>{user?.phone}</Text>
            </View>

            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => {
                setShowMenu(false);
                navigation.navigate('Orders');
              }}>
              <Text style={styles.menuItemIcon}>📦</Text>
              <Text style={styles.menuItemText}>My Orders</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => {
                setShowMenu(false);
                navigation.navigate('Subscriptions');
              }}>
              <Text style={styles.menuItemIcon}>📅</Text>
              <Text style={styles.menuItemText}>Subscriptions</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => {
                setShowMenu(false);
                onProfilePress();
              }}>
              <Text style={styles.menuItemIcon}>👤</Text>
              <Text style={styles.menuItemText}>Profile</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => {
                setShowMenu(false);
                onLogout();
              }}>
              <Text style={styles.menuItemIcon}>🚪</Text>
              <Text style={styles.menuItemText}>Logout</Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.primary,
    paddingTop: spacing[3],
    paddingBottom: spacing[3],
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  content: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing[4],
  },
  locationContainer: {
    flex: 1,
    marginRight: spacing[4],
  },
  locationLabel: {
    fontSize: typography.fontSize.xs,
    color: colors.white,
    opacity: 0.9,
    marginBottom: 2,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  locationText: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
    color: colors.white,
    flex: 1,
  },
  locationIcon: {
    fontSize: typography.fontSize.xs,
    color: colors.white,
    marginLeft: spacing[1],
  },
  cartButton: {
    position: 'relative',
    padding: spacing[2],
    marginLeft: spacing[2],
  },
  cartIcon: {
    fontSize: 24,
  },
  badge: {
    position: 'absolute',
    top: 0,
    right: 0,
    backgroundColor: colors.error,
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  badgeText: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.bold,
    color: colors.white,
  },
  profileButton: {
    padding: spacing[1],
    marginLeft: spacing[2],
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.white,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.primary,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: colors.overlay,
    justifyContent: 'flex-start',
    paddingTop: 60,
    paddingRight: spacing[4],
  },
  menuContainer: {
    backgroundColor: colors.white,
    borderRadius: 12,
    marginHorizontal: spacing[4],
    overflow: 'hidden',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
  menuHeader: {
    backgroundColor: colors.primary,
    padding: spacing[4],
  },
  menuName: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.white,
    marginBottom: spacing[1],
  },
  menuPhone: {
    fontSize: typography.fontSize.sm,
    color: colors.white,
    opacity: 0.9,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing[4],
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  menuItemIcon: {
    fontSize: 20,
    marginRight: spacing[3],
  },
  menuItemText: {
    fontSize: typography.fontSize.base,
    color: colors.text.primary,
  },
});

