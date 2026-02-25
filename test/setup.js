// Setup React Native gesture handler
require('react-native-gesture-handler/jestSetup');
jest.mock('react-native-gesture-handler', () => {
  const React = require('react');
  const { View } = require('react-native');
  return {
    GestureHandlerRootView: ({ children }) => <View>{children}</View>,
    Swipeable: View,
    DrawerLayout: View,
    PanGestureHandler: View,
    State: {},
  };
});

// Mock vector icons
jest.mock('@expo/vector-icons', () => {
  const React = require('react');
  return new Proxy(
    {},
    {
      get: () => () => React.createElement('Icon'),
    }
  );
});

// Mock React Navigation
jest.mock('@react-navigation/native', () => {
  const actualNav = jest.requireActual('@react-navigation/native');
  return {
    ...actualNav,
    useNavigation: () => ({
      navigate: jest.fn(),
      goBack: jest.fn(),
    }),
    useFocusEffect: jest.fn(),
  };
});

// Mock SecureStore
jest.mock('expo-secure-store', () => ({
  getItemAsync: jest.fn(),
  setItemAsync: jest.fn(),
}));

// Mock React Native Platform API for tests
jest.mock('react-native', () => {
  const RN = jest.requireActual('react-native');
  RN.Platform = { OS: 'web', select: (obj) => obj.web };
  return RN;
});

// Add custom matchers
expect.extend({
  toBeMastered(received) {
    return {
      pass: received.status === 'mastered',
      message: () => `expected card to be mastered`,
    };
  },
});

// Import testing-library extensions after Jest is ready
require('@testing-library/jest-native/extend-expect');
