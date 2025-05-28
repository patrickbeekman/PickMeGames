import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import Constants from 'expo-constants';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { PostHogProvider } from 'posthog-react-native';
import 'react-native-reanimated';



import { useColorScheme } from '@/hooks/useColorScheme';

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });
  const { POSTHOG_API_KEY, POSTHOG_HOST } = Constants.expoConfig?.extra || {};


  if (!loaded) {
    // Async font loading only occurs in development.
    return null;
  }

  return (
    <PostHogProvider 
      apiKey={POSTHOG_API_KEY}
      options={{ host: POSTHOG_HOST }}
    >
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <Stack
              screenOptions={{
                headerStyle: {
                  backgroundColor: '#F3E889',
                },
                headerTintColor: '#333', // icon and text color
                headerTitleStyle: {
                  fontWeight: 'bold',
                },
                contentStyle: {
                  backgroundColor: '#F3E889',
                },
              }}>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="+not-found" />
        </Stack>
        <StatusBar style="auto" />
      </ThemeProvider>
    </PostHogProvider>
  );
}
