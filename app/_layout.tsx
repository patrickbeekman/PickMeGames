import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { TamaguiProvider } from '@tamagui/core';
import Constants from 'expo-constants';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { PostHogProvider } from 'posthog-react-native';
import { useEffect, useState } from 'react';
import { Platform } from 'react-native';
import 'react-native-reanimated';

import { useColorScheme } from '@/hooks/useColorScheme';
import config from '../tamagui.config';

// Suppress deprecation warnings from posthog-react-native using deprecated expo-file-system API
// These are just warnings from a third-party package that hasn't updated to SDK 54's new API yet
if (typeof console !== 'undefined') {
  const originalWarn = console.warn;
  const originalError = console.error;
  
  console.warn = (...args: any[]) => {
    const message = args[0];
    if (typeof message === 'string' && 
        (message.includes('writeAsStringAsync') || 
         message.includes('readAsStringAsync') ||
         message.includes('expo-file-system') && message.includes('deprecated'))) {
      // Suppress these specific warnings from dependencies
      return;
    }
    originalWarn.apply(console, args);
  };
  
  // Also suppress uncaught promise rejections for the same deprecation errors
  console.error = (...args: any[]) => {
    const message = args[0]?.message || args[0];
    if (typeof message === 'string' && 
        (message.includes('writeAsStringAsync') || 
         message.includes('readAsStringAsync') ||
         message.includes('expo-file-system') && message.includes('deprecated'))) {
      // Suppress these specific errors from dependencies
      return;
    }
    originalError.apply(console, args);
  };
}

// Suppress uncaught promise rejections for PostHog deprecation warnings (React Native)
if (typeof global !== 'undefined') {
  // Handle unhandled promise rejections
  const ErrorUtils = (global as any).ErrorUtils;
  if (ErrorUtils) {
    const originalRejectionHandler = ErrorUtils.getGlobalHandler?.();
    ErrorUtils.setGlobalHandler((error: Error, isFatal?: boolean) => {
      const errorMessage = error?.message || '';
      if (typeof errorMessage === 'string' && 
          (errorMessage.includes('writeAsStringAsync') || 
           errorMessage.includes('readAsStringAsync') ||
           (errorMessage.includes('expo-file-system') && errorMessage.includes('deprecated')))) {
        // Suppress these specific errors - they're just deprecation warnings
        return;
      }
      // Call original handler for other errors
      if (originalRejectionHandler) {
        originalRejectionHandler(error, isFatal);
      }
    });
  }
}

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });
  const [postHogReady, setPostHogReady] = useState(false);

  const { POSTHOG_API_KEY, POSTHOG_HOST } = Constants.expoConfig?.extra || {};

  // Stricter validation for PostHog - ensure both values exist and are valid strings
  const hasValidPostHog =
    Platform.OS !== 'web' &&
    POSTHOG_API_KEY &&
    POSTHOG_HOST &&
    typeof POSTHOG_API_KEY === 'string' &&
    typeof POSTHOG_HOST === 'string' &&
    POSTHOG_API_KEY.trim().length > 0 &&
    POSTHOG_HOST.trim().length > 0;

  // Give PostHog time to initialize (safe, only runs on mount or when hasValidPostHog changes)
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout> | undefined;
    if (hasValidPostHog) {
      timer = setTimeout(() => setPostHogReady(true), 1000);
    } else {
      setPostHogReady(true);
    }
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [hasValidPostHog]);

  if (!loaded || (hasValidPostHog && !postHogReady)) {
    return null;
  }

  // All hooks above this line, no hooks in conditionals below

  const AppContent = (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <TamaguiProvider config={config}>
        <Stack
          screenOptions={{
            headerStyle: {
              backgroundColor: '#F3E889',
            },
            headerTintColor: '#333',
            headerTitleStyle: {
              fontWeight: 'bold',
            },
            contentStyle: {
              backgroundColor: '#F3E889',
            },
            headerShadowVisible: false, // <-- Add this line to remove the bottom border/shadow
          }}>
          <Stack.Screen name="index" options={{ headerShown: false }} />
          <Stack.Screen name="prompted" />
          <Stack.Screen name="prompt-settings" />
          <Stack.Screen name="finger-tap" />
          <Stack.Screen name="spinner" />
          <Stack.Screen name="numbered-spinner" />
          <Stack.Screen name="random-number" />
          <Stack.Screen name="about" />
          <Stack.Screen name="+not-found" />
        </Stack>
      </TamaguiProvider>
      <StatusBar backgroundColor="#F3E889" translucent={true} style='dark' />
    </ThemeProvider>
  );

  // Only use PostHogProvider if we have valid credentials
  if (hasValidPostHog) {
    return (
      <PostHogProvider 
        apiKey={POSTHOG_API_KEY}
        options={{ 
          host: POSTHOG_HOST,
          captureMode: 'form',
          flushAt: 20,
          flushInterval: 30000,
        }}
      >
        {AppContent}
      </PostHogProvider>
    );
  }

  // Render app without PostHog if credentials are missing/invalid
  return AppContent;
}
