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
