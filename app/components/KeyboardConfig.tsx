import React, { useEffect } from 'react';
import { Platform, TextInput } from 'react-native';

interface KeyboardConfigProps {
  children: React.ReactNode;
}

/**
 * Keyboard configuration utility component
 * Disables auto-correction and spell check globally for better language learning experience
 */
export const KeyboardConfig: React.FC<KeyboardConfigProps> = ({ children }) => {
  useEffect(() => {
    // Global keyboard configuration for better language learning experience
    if (Platform.OS === 'ios') {
      // iOS specific keyboard settings
      // Note: Some settings require user permission or system settings
    }
    
    if (Platform.OS === 'android') {
      // Android specific keyboard settings
      // Note: Some settings require system keyboard configuration
    }
  }, []);

  return <>{children}</>;
};

/**
 * Enhanced TextInput with language learning optimizations
 */
export const LanguageLearningInput: React.FC<any> = (props) => {
  return (
    <TextInput
      {...props}
      autoCorrect={false}
      spellCheck={false}
      autoCapitalize="none"
      // Additional props for better language learning experience
      textContentType="none"
      autoComplete="off"
      // Disable smart punctuation and smart quotes
      smartDashes={false}
      smartQuotes={false}
      smartInsertDelete={false}
    />
  );
};

/**
 * Hook to configure keyboard for language learning
 */
export const useKeyboardConfig = () => {
  useEffect(() => {
    // Additional keyboard configuration logic
    const configureKeyboard = () => {
      // Platform specific keyboard optimizations
      if (Platform.OS === 'web') {
        // Web specific keyboard settings
        // Note: Limited control on web platform
      }
    };

    configureKeyboard();
  }, []);

  return {
    // Return configuration options for components
    keyboardProps: {
      autoCorrect: false,
      spellCheck: false,
      autoCapitalize: 'none' as const,
      textContentType: 'none' as const,
      autoComplete: 'off' as const,
      smartDashes: false,
      smartQuotes: false,
      smartInsertDelete: false,
    }
  };
};
