import { DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { TamaguiProvider } from '@tamagui/core';
import Constants from 'expo-constants';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { PostHogProvider } from 'posthog-react-native';
import { useEffect } from 'react';
import { Platform } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import 'react-native-reanimated';

import { Design } from '../constants/Design';
import config from '../tamagui.config';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

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

  useEffect(() => {
    if (loaded) SplashScreen.hideAsync();
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  // All hooks above this line, no hooks in conditionals below

  const AppContent = (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ThemeProvider value={DefaultTheme}>
        <TamaguiProvider config={config}>
          <Stack
            screenOptions={{
              headerStyle: {
                backgroundColor: Design.colors.background.light,
              },
              headerTintColor: Design.colors.text.primary,
              headerTitleStyle: {
                fontWeight: 'bold',
              },
              contentStyle: {
                backgroundColor: Design.colors.background.light,
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
            <Stack.Screen name="coin-flip" />
            <Stack.Screen name="color-matcher" />
            <Stack.Screen name="timer-countdown" />
            <Stack.Screen name="about" />
            <Stack.Screen name="+not-found" />
          </Stack>
        </TamaguiProvider>
        <StatusBar backgroundColor={Design.colors.background.light} translucent={true} style='dark' />
      </ThemeProvider>
    </GestureHandlerRootView>
  );

  // Only use PostHogProvider if we have valid credentials
  if (hasValidPostHog) {
    return (
      <PostHogProvider
        apiKey={POSTHOG_API_KEY}
        options={{
          host: POSTHOG_HOST,
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
