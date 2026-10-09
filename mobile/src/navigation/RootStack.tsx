import {
  createStaticNavigation,
  DefaultTheme,
  type Theme,
} from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { HomeScreen } from '../screens/HomeScreen';
import { colors } from '../theme/tokens';

// Static configuration: route names and their params are inferred from this
// object, so there is no separate ParamList type to keep in sync.
const RootStack = createNativeStackNavigator({
  screens: {
    Home: {
      screen: HomeScreen,
      options: { title: 'Liftlyst' },
    },
  },
});

type RootStackType = typeof RootStack;

// Registers RootStack as the app's root navigator, so useNavigation() and
// navigate() are typed everywhere without passing generics.
declare module '@react-navigation/native' {
  interface RootNavigator extends RootStackType {}
}

// React Navigation paints screens light grey by default; use the app's tokens.
export const navigationTheme: Theme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: colors.primary,
    background: colors.background,
  },
};

// A NavigationContainer with RootStack inside it.
export const Navigation = createStaticNavigation(RootStack);
