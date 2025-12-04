import { usePostHog } from 'posthog-react-native';
import { Platform } from 'react-native';

export const useAnalytics = () => {
  // Safely get PostHog - it may not be available if PostHogProvider is not rendered
  let posthog: ReturnType<typeof usePostHog> | null = null;
  
  try {
    posthog = usePostHog();
  } catch {
    // PostHogProvider is not available - this is expected when credentials are missing
    posthog = null;
  }

  const capture = (event: string, properties?: Record<string, any>) => {
    try {
      if (Platform.OS === 'web') {
        console.log(`Analytics (web): ${event}`, properties);
        return;
      }

      if (!posthog) {
        return;
      }

      // PostHog is safe to call even before ready - it queues events internally
      posthog.capture(event, properties);
    } catch {
      // Analytics errors are non-critical and should not interrupt user experience
      // Fail silently to maintain smooth UX
    }
  };

  const identify = (userId: string, properties?: Record<string, any>) => {
    try {
      if (Platform.OS === 'web') {
        console.log(`Analytics identify (web): ${userId}`, properties);
        return;
      }

      if (!posthog) {
        return;
      }

      // PostHog is safe to call even before ready - it queues events internally
      posthog.identify(userId, properties);
    } catch {
      // Analytics errors are non-critical and should not interrupt user experience
      // Fail silently to maintain smooth UX
    }
  };

  return { capture, identify };
};