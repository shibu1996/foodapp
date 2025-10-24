/**
 * Restaurant App - Mobile
 * Main App Component
 */

import React from 'react';
import 'react-native-gesture-handler';
import { StatusBar } from 'react-native';
import { AppNavigator } from './src/navigation/AppNavigator';
import { CartProvider } from './src/context/CartContext';
import { SubscriptionProvider } from './src/context/SubscriptionContext';

function App(): JSX.Element {
  return (
    <CartProvider>
      <SubscriptionProvider>
        <StatusBar barStyle="dark-content" backgroundColor="#fff" />
        <AppNavigator />
      </SubscriptionProvider>
    </CartProvider>
  );
}

export default App;

