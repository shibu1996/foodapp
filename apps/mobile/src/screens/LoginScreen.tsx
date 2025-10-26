/**
 * Login Screen
 * Phone number + OTP verification
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
  TouchableOpacity,
} from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';
import { AuthStackParamList } from '../navigation/types';
import { Button, Input } from '../components';
import { colors, typography, spacing } from '../theme';
import { apiClient } from '../services/apiClient';
import { storage } from '../utils/storage';

type LoginScreenNavigationProp = StackNavigationProp<AuthStackParamList, 'Login'>;
type LoginScreenRouteProp = RouteProp<AuthStackParamList, 'Login'>;

interface Props {
  navigation: LoginScreenNavigationProp;
  route: LoginScreenRouteProp;
}

export const LoginScreen: React.FC<Props> = ({ navigation }) => {
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [showOTP, setShowOTP] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [resendTimer, setResendTimer] = useState(0);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (resendTimer > 0) {
      interval = setInterval(() => {
        setResendTimer(prev => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [resendTimer]);

  const handleSendOTP = async () => {
    setError('');

    // Validate phone number
    if (phone.length !== 10) {
      setError('Please enter a valid 10-digit phone number');
      return;
    }

    setLoading(true);
    try {
      const response = await apiClient.sendOTP(phone);
      if (response.success) {
        setShowOTP(true);
        setResendTimer(30);
        Alert.alert('Success', 'OTP sent successfully!');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to send OTP');
      Alert.alert('Error', err.response?.data?.message || 'Failed to send OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async () => {
    setError('');

    // Validate OTP
    if (otp.length !== 6) {
      setError('Please enter a valid 6-digit OTP');
      return;
    }

    setLoading(true);
    try {
      const response = await apiClient.verifyOTP(phone, otp);

      if (response.success) {
        if (response.needsRegistration) {
          // Navigate to registration
          navigation.navigate('Register', {
            phone,
            token: response.token!,
          });
        } else {
          // Save token and user
          await storage.setToken(response.token!);
          await storage.setUser(response.user!);
          // Navigation will be handled automatically by AppNavigator
        }
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Invalid OTP');
      Alert.alert('Error', err.response?.data?.message || 'Invalid OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = () => {
    setOtp('');
    handleSendOTP();
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled">
        <View style={styles.header}>
          <Text style={styles.emoji}>🍔</Text>
          <Text style={styles.title}>Restaurant App</Text>
          <Text style={styles.subtitle}>
            {showOTP ? 'Enter OTP' : 'Welcome back!'}
          </Text>
          <Text style={styles.description}>
            {showOTP
              ? `We've sent a 6-digit code to +91 ${phone}`
              : 'Enter your phone number to get started'}
          </Text>
        </View>

        <View style={styles.form}>
          {!showOTP ? (
            <>
              <Input
                label="Phone Number"
                placeholder="Enter 10-digit phone number"
                keyboardType="phone-pad"
                maxLength={10}
                value={phone}
                onChangeText={setPhone}
                error={error}
              />
              <Button
                title="Send OTP"
                onPress={handleSendOTP}
                loading={loading}
                fullWidth
                size="lg"
              />
            </>
          ) : (
            <>
              <Input
                label="OTP"
                placeholder="Enter 6-digit OTP"
                keyboardType="number-pad"
                maxLength={6}
                value={otp}
                onChangeText={setOtp}
                error={error}
              />
              <Button
                title="Verify OTP"
                onPress={handleVerifyOTP}
                loading={loading}
                fullWidth
                size="lg"
              />

              <View style={styles.resendContainer}>
                {resendTimer > 0 ? (
                  <Text style={styles.resendText}>
                    Resend OTP in {resendTimer}s
                  </Text>
                ) : (
                  <TouchableOpacity onPress={handleResendOTP}>
                    <Text style={styles.resendLink}>Resend OTP</Text>
                  </TouchableOpacity>
                )}
              </View>

              <TouchableOpacity
                onPress={() => {
                  setShowOTP(false);
                  setOtp('');
                  setError('');
                }}
                style={styles.changeNumberButton}>
                <Text style={styles.changeNumberText}>Change Phone Number</Text>
              </TouchableOpacity>
            </>
          )}
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            By continuing, you agree to our{' '}
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
    marginTop: spacing[12],
    marginBottom: spacing[8],
  },
  emoji: {
    fontSize: 64,
    marginBottom: spacing[4],
  },
  title: {
    fontSize: typography.fontSize['3xl'],
    fontWeight: typography.fontWeight.bold,
    color: colors.primary,
    marginBottom: spacing[2],
  },
  subtitle: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text.primary,
    marginBottom: spacing[2],
  },
  description: {
    fontSize: typography.fontSize.base,
    color: colors.text.secondary,
    textAlign: 'center',
    paddingHorizontal: spacing[4],
  },
  form: {
    flex: 1,
  },
  resendContainer: {
    alignItems: 'center',
    marginTop: spacing[4],
  },
  resendText: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
  },
  resendLink: {
    fontSize: typography.fontSize.sm,
    color: colors.primary,
    fontWeight: typography.fontWeight.semibold,
  },
  changeNumberButton: {
    alignItems: 'center',
    marginTop: spacing[6],
  },
  changeNumberText: {
    fontSize: typography.fontSize.base,
    color: colors.text.secondary,
    textDecorationLine: 'underline',
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





