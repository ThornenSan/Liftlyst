/**
 * Liftlyst
 *
 * @format
 */

import { useEffect } from 'react';
import { StatusBar, StyleSheet, useColorScheme } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { startAutoSync } from './src/sync/autoSync';

import './global.css';
import { Navigation, navigationTheme } from './src/navigation/RootStack';

function App() {
  const isDarkMode = useColorScheme() === 'dark';

  useEffect(() => startAutoSync(), []);

  return (
    <GestureHandlerRootView style={styles.root}>
      <SafeAreaProvider>
        <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
        <Navigation theme={navigationTheme} />
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({ root: { flex: 1 } });

export default App;
