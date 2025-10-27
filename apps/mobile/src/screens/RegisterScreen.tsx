/**
 * Registration Screen
 * User registration after OTP verification
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
import { AuthStackParamList } from '../navigation/types';
import { Button, Input } from '../components';
import { colors, typography, spacing } from '../theme';
import { apiClient } from '../services/apiClient';
import { storage } from '../utils/storage';

type RegisterScreenNavigationProp = StackNavigationProp<
  AuthStackParamList,
  'Register'
>;
type RegisterScreenRouteProp = RouteProp<AuthStackParamList, 'Register'>;

interface Props {
  navigation: RegisterScreenNavigationProp;
  route: RegisterScreenRouteProp;
}

export const RegisterScreen: React.FC<Props> = ({ route }) => {
  const { phone, token } = route.params;

  const [formData, setFormData] = useState({
    name: '',
    email: '',
  });
  const [errors, setErrors] = useState({
    name: '',
    email: '',
  });
  const [loading, setLoading] = useState(false);

  const validateForm = (): boolean => {
    const newErrors = { name: '', email: '' };
    let isValid = true;

    // Validate name
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
      isValid = false;
    } else if (formData.name.trim().length < 2) {
      newErrors.name = 'Name must be at least 2 characters';
      isValid = false;
    }

    // Validate email (optional but must be valid if provided)
    if (formData.email.trim()) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        newErrors.email = 'Please enter a valid email address';
        isValid = false;
      }
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleRegister = async () => {
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      const response = await apiClient.register({
        name: formData.name.trim(),
        phone,
        email: formData.email.trim() || undefined,
      });

      if (response.success && response.data) {
        // Save token and user data
        await storage.setToken(token);
        await storage.setUser(response.data);

        Alert.alert(
          'Success',
          'Registration successful! Welcome to Restaurant App.',
          [{ text: 'OK' }]
        );

        // Navigation will be handled automatically by AppNavigator
      }
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.message || 'Registration failed. Please try again.';
      Alert.alert('Error', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field as keyof typeof errors]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled">
        <View style={styles.header}>
          <Text style={styles.emoji}>👤</Text>
          <Text style={styles.title}>Complete Your Profile</Text>
          <Text style={styles.subtitle}>
            Let's get to know you better
          </Text>
          <Text style={styles.description}>
            Phone: +91 {phone}
          </Text>
        </View>

        <View style={styles.form}>
          <Input
            label="Full Name *"
            placeholder="Enter your full name"
            value={formData.name}
            onChangeText={value => handleInputChange('name', value)}
            error={errors.name}
            autoCapitalize="words"
            returnKeyType="next"
          />

          <Input
            label="Email Address (Optional)"
            placeholder="Enter your email"
            value={formData.email}
            onChangeText={value => handleInputChange('email', value)}
            error={errors.email}
            keyboardType="email-address"
            autoCapitalize="none"
            returnKeyType="done"
          />

          <Text style={styles.note}>
            * Required fields
          </Text>

          <Button
            title="Complete Registration"
            onPress={handleRegister}
            loading={loading}
            fullWidth
            size="lg"
            style={styles.submitButton}
          />
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            By registering, you agree to our{' '}
            <Text style={styles.footerLink}>Terms of Service</Text> and{' '}
            <Text style={styles.footerLink}>Privacy Policy</Text>
          </Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    flexGrow: 1,
    padding: spacing[6],
  },
  header: {
    alignItems: 'center',
    marginTop: spacing[8],
    marginBottom: spacing[8],
  },
  emoji: {
    fontSize: 64,
    marginBottom: spacing[4],
  },
  title: {
    fontSize: typography.fontSize['2xl'],
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
    marginBottom: spacing[2],
  },
  subtitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.medium,
    color: colors.text.secondary,
    marginBottom: spacing[2],
  },
  description: {
    fontSize: typography.fontSize.sm,
    color: colors.text.tertiary,
    textAlign: 'center',
  },
  form: {
    flex: 1,
  },
  note: {
    fontSize: typography.fontSize.xs,
    color: colors.text.tertiary,
    marginBottom: spacing[6],
  },
  submitButton: {
    marginTop: spacing[4],
  },
  footer: {
    marginTop: spacing[8],
    alignItems: 'center',
  },
  footerText: {
    fontSize: typography.fontSize.xs,
    color: colors.text.tertiary,
    textAlign: 'center',
    lineHeight: 18,
  },
  footerLink: {
    color: colors.primary,
    fontWeight: typography.fontWeight.medium,
  },
});






