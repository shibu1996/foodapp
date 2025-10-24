/**
 * Product Detail Screen
 * Shows detailed product information
 */

import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';
import { MainStackParamList } from '../navigation/types';
import { Button } from '../components';
import { colors, typography, spacing } from '../theme';
import { apiClient } from '../services/apiClient';
import { Product } from '../types';
import { useCart } from '../context/CartContext';

type ProductDetailScreenNavigationProp = StackNavigationProp<
  MainStackParamList,
  'ProductDetail'
>;
type ProductDetailScreenRouteProp = RouteProp<
  MainStackParamList,
  'ProductDetail'
>;

interface Props {
  navigation: ProductDetailScreenNavigationProp;
  route: ProductDetailScreenRouteProp;
}

export const ProductDetailScreen: React.FC<Props> = ({ navigation, route }) => {
  const { productId, product: initialProduct } = route.params;
  const [product, setProduct] = useState<Product | null>(initialProduct || null);
  const [loading, setLoading] = useState(!initialProduct);
  const [quantity, setQuantity] = useState(1);
  const { addToCart } = useCart();

  useEffect(() => {
    if (!initialProduct) {
      loadProduct();
    }
  }, [productId]);

  const loadProduct = async () => {
    try {
      setLoading(true);
      const response = await apiClient.getProductById(productId);
      if (response.success && response.data) {
        setProduct(response.data);
      }
    } catch (error) {
      console.error('Error loading product:', error);
      Alert.alert('Error', 'Failed to load product details');
      navigation.goBack();
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = () => {
    if (product) {
      addToCart(product, quantity);
      Alert.alert(
        'Added to Cart',
        `${quantity} x ${product.name} added to cart!`,
        [
          { text: 'View Cart', onPress: () => navigation.navigate('Cart') },
          { text: 'Continue Shopping', style: 'cancel' },
        ]
      );
      setQuantity(1); // Reset quantity
    }
  };

  const handleSubscribe = () => {
    if (product) {
      // Navigate to subscription flow
      navigation.navigate('SubscribeDuration', { product });
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (!product) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Product not found</Text>
      </View>
    );
  }

  const hasDiscount =
    product.discountPrice && product.discountPrice < product.price;
  const displayPrice = hasDiscount ? product.discountPrice : product.price;
  const discount = hasDiscount
    ? Math.round(
        ((product.price - product.discountPrice!) / product.price) * 100
      )
    : 0;

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
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

          {/* Veg/Non-veg badge */}
          <View
            style={[
              styles.vegBadge,
              product.isVeg ? styles.vegBadgeGreen : styles.vegBadgeRed,
            ]}>
            <View
              style={[
                styles.vegDot,
                product.isVeg ? styles.vegDotGreen : styles.vegDotRed,
              ]}
            />
          </View>

          {/* Discount badge */}
          {hasDiscount && (
            <View style={styles.discountBadge}>
              <Text style={styles.discountText}>{discount}% OFF</Text>
            </View>
          )}
        </View>

        {/* Content */}
        <View style={styles.content}>
          {/* Name and type */}
          <View style={styles.header}>
            <View style={styles.nameContainer}>
              <Text style={styles.name}>{product.name}</Text>
              <Text style={styles.type}>
                {product.type === 'subscription'
                  ? '📅 Subscription'
                  : '🛒 One-time Purchase'}
              </Text>
            </View>
          </View>

          {/* Price */}
          <View style={styles.priceContainer}>
            <Text style={styles.price}>₹{displayPrice}</Text>
            {hasDiscount && (
              <Text style={styles.originalPrice}>₹{product.price}</Text>
            )}
            {product.unit && (
              <Text style={styles.unit}>/ {product.unit}</Text>
            )}
          </View>

          {/* Description */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Description</Text>
            <Text style={styles.description}>{product.description}</Text>
          </View>

          {/* Tags */}
          {product.tags && product.tags.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Tags</Text>
              <View style={styles.tags}>
                {product.tags.map((tag, index) => (
                  <View key={index} style={styles.tag}>
                    <Text style={styles.tagText}>{tag}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* Preparation time */}
          {product.preparationTime && (
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>⏱️ Preparation Time:</Text>
              <Text style={styles.infoValue}>
                {product.preparationTime} mins
              </Text>
            </View>
          )}

          {/* Availability */}
          {!product.isAvailable && (
            <View style={styles.unavailableContainer}>
              <Text style={styles.unavailableText}>
                ⚠️ Currently Out of Stock
              </Text>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Bottom Actions */}
      {product.isAvailable && (
        <View style={styles.bottomContainer}>
          {/* Quantity selector */}
          <View style={styles.quantityContainer}>
            <TouchableOpacity
              style={styles.quantityButton}
              onPress={() => setQuantity(Math.max(1, quantity - 1))}
              disabled={quantity <= 1}>
              <Text style={styles.quantityButtonText}>−</Text>
            </TouchableOpacity>
            <Text style={styles.quantityText}>{quantity}</Text>
            <TouchableOpacity
              style={styles.quantityButton}
              onPress={() => setQuantity(quantity + 1)}>
              <Text style={styles.quantityButtonText}>+</Text>
            </TouchableOpacity>
          </View>

          {/* Action buttons */}
          <View style={styles.actions}>
            {product.type === 'one-time' ? (
              <Button
                title="Add to Cart"
                onPress={handleAddToCart}
                fullWidth
                size="lg"
              />
            ) : (
              <Button
                title="Subscribe Now"
                onPress={handleSubscribe}
                fullWidth
                size="lg"
              />
            )}
          </View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
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
  scrollView: {
    flex: 1,
  },
  imageContainer: {
    width: '100%',
    height: 300,
    position: 'relative',
    backgroundColor: colors.gray[100],
  },
  image: {
    width: '100%',
    height: '100%',
  },
  imagePlaceholder: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  imagePlaceholderText: {
    fontSize: 80,
  },
  vegBadge: {
    position: 'absolute',
    top: spacing[4],
    left: spacing[4],
    width: 24,
    height: 24,
    borderRadius: 4,
    backgroundColor: colors.white,
    justifyContent: 'center',
    alignItems: 'center',
  },
  vegBadgeGreen: {
    borderWidth: 2,
    borderColor: '#16a34a',
  },
  vegBadgeRed: {
    borderWidth: 2,
    borderColor: '#dc2626',
  },
  vegDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  vegDotGreen: {
    backgroundColor: '#16a34a',
  },
  vegDotRed: {
    backgroundColor: '#dc2626',
  },
  discountBadge: {
    position: 'absolute',
    top: spacing[4],
    right: spacing[4],
    backgroundColor: colors.error,
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[2],
    borderRadius: 8,
  },
  discountText: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.bold,
    color: colors.white,
  },
  content: {
    padding: spacing[4],
  },
  header: {
    marginBottom: spacing[3],
  },
  nameContainer: {
    flex: 1,
  },
  name: {
    fontSize: typography.fontSize['2xl'],
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
    marginBottom: spacing[2],
  },
  type: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing[4],
  },
  price: {
    fontSize: typography.fontSize['3xl'],
    fontWeight: typography.fontWeight.bold,
    color: colors.primary,
    marginRight: spacing[2],
  },
  originalPrice: {
    fontSize: typography.fontSize.lg,
    color: colors.text.tertiary,
    textDecorationLine: 'line-through',
    marginRight: spacing[2],
  },
  unit: {
    fontSize: typography.fontSize.base,
    color: colors.text.secondary,
  },
  section: {
    marginBottom: spacing[4],
  },
  sectionTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text.primary,
    marginBottom: spacing[2],
  },
  description: {
    fontSize: typography.fontSize.base,
    color: colors.text.secondary,
    lineHeight: 24,
  },
  tags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  tag: {
    backgroundColor: colors.gray[100],
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[1],
    borderRadius: 16,
    marginRight: spacing[2],
    marginBottom: spacing[2],
  },
  tagText: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing[2],
  },
  infoLabel: {
    fontSize: typography.fontSize.base,
    color: colors.text.secondary,
    marginRight: spacing[2],
  },
  infoValue: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.medium,
    color: colors.text.primary,
  },
  unavailableContainer: {
    backgroundColor: colors.errorLight,
    padding: spacing[3],
    borderRadius: 8,
    marginTop: spacing[4],
  },
  unavailableText: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.medium,
    color: colors.error,
    textAlign: 'center',
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
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing[3],
  },
  quantityButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.gray[100],
    justifyContent: 'center',
    alignItems: 'center',
  },
  quantityButtonText: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
  },
  quantityText: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text.primary,
    marginHorizontal: spacing[6],
  },
  actions: {
    flexDirection: 'row',
  },
});

