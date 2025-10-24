/**
 * Main Navigator
 * Handles authenticated user screens (after login)
 */

import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { MainStackParamList } from './types';
import { HomeScreen } from '../screens/HomeScreen';
import { ProductDetailScreen } from '../screens/ProductDetailScreen';
import { CartScreen } from '../screens/CartScreen';
import { AddressSelectionScreen } from '../screens/AddressSelectionScreen';
import { AddAddressScreen } from '../screens/AddAddressScreen';
import { OrdersScreen } from '../screens/OrdersScreen';
import { OrderTrackingScreen } from '../screens/OrderTrackingScreen';
import { SubscribeDurationScreen } from '../screens/SubscribeDurationScreen';
import { SubscribeTimeslotScreen } from '../screens/SubscribeTimeslotScreen';
import { SubscribeStartDateScreen } from '../screens/SubscribeStartDateScreen';
import { SubscribeSummaryScreen } from '../screens/SubscribeSummaryScreen';
import { SubscriptionCartScreen } from '../screens/SubscriptionCartScreen';
import { SubscriptionsScreen } from '../screens/SubscriptionsScreen';
import { ProfileScreen } from '../screens/ProfileScreen';

// Placeholder screens - all implemented!
import { View, Text, StyleSheet } from 'react-native';

const Stack = createStackNavigator<MainStackParamList>();

export const MainNavigator = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: '#f97316',
        },
        headerTintColor: '#fff',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      }}>
      <Stack.Screen 
        name="Home" 
        component={HomeScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen 
        name="ProductDetail" 
        component={ProductDetailScreen}
        options={{ title: 'Product Details' }}
      />
      <Stack.Screen 
        name="Cart" 
        component={CartScreen}
        options={{ title: 'My Cart' }}
      />
      <Stack.Screen 
        name="AddressSelection" 
        component={AddressSelectionScreen}
        options={{ title: 'Select Address' }}
      />
      <Stack.Screen 
        name="AddAddress" 
        component={AddAddressScreen}
        options={{ title: 'Add Address' }}
      />
      <Stack.Screen 
        name="Orders" 
        component={OrdersScreen}
        options={{ title: 'My Orders' }}
      />
      <Stack.Screen 
        name="OrderTracking" 
        component={OrderTrackingScreen}
        options={{ title: 'Track Order' }}
      />
      <Stack.Screen 
        name="SubscribeDuration" 
        component={SubscribeDurationScreen}
        options={{ title: 'Choose Duration' }}
      />
      <Stack.Screen 
        name="SubscribeTimeslot" 
        component={SubscribeTimeslotScreen}
        options={{ title: 'Choose Timeslot' }}
      />
      <Stack.Screen 
        name="SubscribeStartDate" 
        component={SubscribeStartDateScreen}
        options={{ title: 'Start Date' }}
      />
      <Stack.Screen 
        name="SubscribeSummary" 
        component={SubscribeSummaryScreen}
        options={{ title: 'Review Subscription' }}
      />
      <Stack.Screen 
        name="SubscriptionCart" 
        component={SubscriptionCartScreen}
        options={{ title: 'Subscription Cart' }}
      />
      <Stack.Screen 
        name="Subscriptions" 
        component={SubscriptionsScreen}
        options={{ title: 'My Subscriptions' }}
      />
      <Stack.Screen 
        name="Profile" 
        component={ProfileScreen}
        options={{ title: 'Profile' }}
      />
    </Stack.Navigator>
  );
};

const styles = StyleSheet.create({
  placeholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f9fafb',
  },
  text: {
    fontSize: 18,
    color: '#6b7280',
    fontWeight: '600',
  },
});

