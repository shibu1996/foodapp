/**
 * ProductCard Component
 * Displays product in grid layout
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Dimensions,
} from 'react-native';
import { colors, typography, spacing } from '../theme';
import { Product } from '../types';

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - spacing[4] * 3) / 2; // 2 columns with padding

interface ProductCardProps {
  product: Product;
  onPress: () => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  onPress,
}) => {
  const hasDiscount = product.discountPrice && product.discountPrice < product.price;
  const displayPrice = hasDiscount ? product.discountPrice : product.price;
  const discount = hasDiscount
    ? Math.round(((product.price - product.discountPrice!) / product.price) * 100)
    : 0;

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={onPress}
      activeOpacity={0.7}>
      {/* Image */}
      <View style={styles.imageContainer}>
        {product.image ? (
          <Image
            source={{ uri: product.image }}
            style={styles.image}
            resizeMode="cover"
          />
        ) : (
          <View style={styles.imagePlaceholder}>
            <Text style={styles.imagePlaceholderText}>🍽️</Text>
          </View>
        )}
        
        {/* Veg/Non-veg indicator */}
        <View style={[styles.vegBadge, product.isVeg ? styles.vegBadgeGreen : styles.vegBadgeRed]}>
          <View style={[styles.vegDot, product.isVeg ? styles.vegDotGreen : styles.vegDotRed]} />
        </View>

        {/* Discount badge */}
        {hasDiscount && (
          <View style={styles.discountBadge}>
            <Text style={styles.discountText}>{discount}% OFF</Text>
          </View>
        )}
      </View>

      {/* Product Info */}
      <View style={styles.info}>
        <Text style={styles.name} numberOfLines={2}>
          {product.name}
        </Text>
        
        <Text style={styles.description} numberOfLines={1}>
          {product.description}
        </Text>

        {/* Price */}
        <View style={styles.priceContainer}>
          <Text style={styles.price}>₹{displayPrice}</Text>
          {hasDiscount && (
            <Text style={styles.originalPrice}>₹{product.price}</Text>
          )}
        </View>

        {/* Type badge */}
        <View style={styles.typeBadge}>
          <Text style={styles.typeText}>
            {product.type === 'subscription' ? '📅 Subscription' : '🛒 One-time'}
          </Text>
        </View>

        {/* Availability */}
        {!product.isAvailable && (
          <View style={styles.unavailableBadge}>
            <Text style={styles.unavailableText}>Out of Stock</Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    width: CARD_WIDTH,
    backgroundColor: colors.white,
    borderRadius: 12,
    marginBottom: spacing[4],
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  imageContainer: {
    width: '100%',
    height: CARD_WIDTH * 0.8,
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  imagePlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: colors.gray[100],
    justifyContent: 'center',
    alignItems: 'center',
  },
  imagePlaceholderText: {
    fontSize: 48,
  },
  vegBadge: {
    position: 'absolute',
    top: spacing[2],
    left: spacing[2],
    width: 20,
    height: 20,
    borderRadius: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  vegBadgeGreen: {
    borderWidth: 1.5,
    borderColor: '#16a34a',
  },
  vegBadgeRed: {
    borderWidth: 1.5,
    borderColor: '#dc2626',
  },
  vegDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  vegDotGreen: {
    backgroundColor: '#16a34a',
  },
  vegDotRed: {
    backgroundColor: '#dc2626',
  },
  discountBadge: {
    position: 'absolute',
    top: spacing[2],
    right: spacing[2],
    backgroundColor: colors.error,
    paddingHorizontal: spacing[2],
    paddingVertical: spacing[1],
    borderRadius: 4,
  },
  discountText: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.bold,
    color: colors.white,
  },
  info: {
    padding: spacing[3],
  },
  name: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text.primary,
    marginBottom: spacing[1],
    lineHeight: 20,
  },
  description: {
    fontSize: typography.fontSize.xs,
    color: colors.text.tertiary,
    marginBottom: spacing[2],
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing[2],
  },
  price: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.primary,
    marginRight: spacing[2],
  },
  originalPrice: {
    fontSize: typography.fontSize.sm,
    color: colors.text.tertiary,
    textDecorationLine: 'line-through',
  },
  typeBadge: {
    alignSelf: 'flex-start',
  },
  typeText: {
    fontSize: typography.fontSize.xs,
    color: colors.text.secondary,
  },
  unavailableBadge: {
    backgroundColor: colors.gray[100],
    paddingVertical: spacing[1],
    paddingHorizontal: spacing[2],
    borderRadius: 4,
    marginTop: spacing[2],
  },
  unavailableText: {
    fontSize: typography.fontSize.xs,
    color: colors.error,
    fontWeight: typography.fontWeight.medium,
  },
});


