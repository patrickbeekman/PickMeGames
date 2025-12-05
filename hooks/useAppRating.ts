import AsyncStorage from '@react-native-async-storage/async-storage';
import * as StoreReview from 'expo-store-review';
import Constants from 'expo-constants';
import { useCallback, useEffect, useState } from 'react';
import { Linking, Platform } from 'react-native';

const RATING_STORAGE_KEY = 'app_rating_data';
const RATING_DISMISSED_KEY = 'app_rating_dismissed';
const RATING_COMPLETED_KEY = 'app_rating_completed';

interface RatingData {
  appOpens: number;
  gameCompletions: number;
  lastShownDate: string | null;
  firstOpenDate: string;
}

// Show rating prompt after:
// - At least 3 app opens AND
// - At least 3 game completions AND
// - At least 2 days since first open AND
// - Not shown in last 7 days

// For testing: Set to true to use lower thresholds (1 open, 1 completion, 0 days)
const IS_DEV_MODE = __DEV__; // Automatically true in development

const MIN_APP_OPENS = IS_DEV_MODE ? 1 : 3;
const MIN_GAME_COMPLETIONS = IS_DEV_MODE ? 1 : 3;
const MIN_DAYS_SINCE_FIRST_OPEN = IS_DEV_MODE ? 0 : 2;
const DAYS_BETWEEN_PROMPTS = IS_DEV_MODE ? 0 : 7;

export const useAppRating = () => {
  const [shouldShowRating, setShouldShowRating] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Shared function to check if rating should be shown
  const checkShouldShowRating = useCallback(async () => {
    try {
      // Check if user already rated or dismissed permanently
      const [dismissed, completed, storedData] = await Promise.all([
        AsyncStorage.getItem(RATING_DISMISSED_KEY),
        AsyncStorage.getItem(RATING_COMPLETED_KEY),
        AsyncStorage.getItem(RATING_STORAGE_KEY),
      ]);

      if (dismissed === 'true' || completed === 'true') {
        setShouldShowRating(false);
        setIsLoading(false);
        return;
      }

      const today = new Date().toISOString().split('T')[0];
      let ratingData: RatingData;

      if (storedData) {
        ratingData = JSON.parse(storedData);
      } else {
        // First time opening app
        ratingData = {
          appOpens: 0,
          gameCompletions: 0,
          lastShownDate: null,
          firstOpenDate: today,
        };
      }

      // Check if we should show the prompt
      const daysSinceFirstOpen = Math.floor(
        (new Date(today).getTime() - new Date(ratingData.firstOpenDate).getTime()) / (1000 * 60 * 60 * 24)
      );

      const daysSinceLastShown = ratingData.lastShownDate
        ? Math.floor(
            (new Date(today).getTime() - new Date(ratingData.lastShownDate).getTime()) / (1000 * 60 * 60 * 24)
          )
        : Infinity;

      const shouldShow =
        ratingData.appOpens >= MIN_APP_OPENS &&
        ratingData.gameCompletions >= MIN_GAME_COMPLETIONS &&
        daysSinceFirstOpen >= MIN_DAYS_SINCE_FIRST_OPEN &&
        daysSinceLastShown >= DAYS_BETWEEN_PROMPTS;

      if (__DEV__) {
        console.log('Rating check on mount:', {
          appOpens: ratingData.appOpens,
          gameCompletions: ratingData.gameCompletions,
          daysSinceFirstOpen,
          daysSinceLastShown,
          shouldShow,
          MIN_APP_OPENS,
          MIN_GAME_COMPLETIONS,
          MIN_DAYS_SINCE_FIRST_OPEN,
          DAYS_BETWEEN_PROMPTS,
          dismissed: dismissed === 'true',
          completed: completed === 'true',
        });
      }

      setShouldShowRating(shouldShow);
      return shouldShow;
    } catch (error) {
      console.log('Error checking rating prompt:', error);
      setShouldShowRating(false);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    checkShouldShowRating();
  }, [checkShouldShowRating]);

  const trackAppOpen = useCallback(async () => {
    try {
      const stored = await AsyncStorage.getItem(RATING_STORAGE_KEY);
      const data: RatingData = stored
        ? JSON.parse(stored)
        : {
            appOpens: 0,
            gameCompletions: 0,
            lastShownDate: null,
            firstOpenDate: new Date().toISOString().split('T')[0],
          };

      data.appOpens += 1;
      await AsyncStorage.setItem(RATING_STORAGE_KEY, JSON.stringify(data));
      
      // Re-check if we should show rating after tracking app open
      // This ensures the prompt shows if conditions are met
      setTimeout(() => {
        checkShouldShowRating();
      }, 100);
    } catch (error) {
      console.log('Error tracking app open:', error);
    }
  }, [checkShouldShowRating]);

  const trackGameCompletion = useCallback(async () => {
    try {
      const stored = await AsyncStorage.getItem(RATING_STORAGE_KEY);
      const data: RatingData = stored
        ? JSON.parse(stored)
        : {
            appOpens: 0,
            gameCompletions: 0,
            lastShownDate: null,
            firstOpenDate: new Date().toISOString().split('T')[0],
          };

      data.gameCompletions += 1;
      await AsyncStorage.setItem(RATING_STORAGE_KEY, JSON.stringify(data));

      // Re-check if we should show rating after a game completion
      // Use the shared check function to ensure consistency
      await checkShouldShowRating();
    } catch (error) {
      console.log('Error tracking game completion:', error);
    }
  }, [checkShouldShowRating]);

  const markRatingShown = useCallback(async () => {
    try {
      const stored = await AsyncStorage.getItem(RATING_STORAGE_KEY);
      const data: RatingData = stored ? JSON.parse(stored) : {
        appOpens: 0,
        gameCompletions: 0,
        lastShownDate: null,
        firstOpenDate: new Date().toISOString().split('T')[0],
      };

      data.lastShownDate = new Date().toISOString().split('T')[0];
      await AsyncStorage.setItem(RATING_STORAGE_KEY, JSON.stringify(data));
      setShouldShowRating(false);
    } catch (error) {
      console.log('Error marking rating shown:', error);
    }
  }, []);

  const markRatingDismissed = useCallback(async () => {
    try {
      await AsyncStorage.setItem(RATING_DISMISSED_KEY, 'true');
      setShouldShowRating(false);
    } catch (error) {
      console.log('Error marking rating dismissed:', error);
    }
  }, []);

  const markRatingCompleted = useCallback(async () => {
    try {
      await AsyncStorage.setItem(RATING_COMPLETED_KEY, 'true');
      setShouldShowRating(false);
    } catch (error) {
      console.log('Error marking rating completed:', error);
    }
  }, []);

  const openStoreRating = useCallback(async () => {
    try {
      // Use native in-app review API (much smoother experience)
      // Check if module is available (will be false until app is rebuilt)
      let isAvailable = false;
      try {
        isAvailable = await StoreReview.isAvailableAsync();
      } catch (error) {
        // Native module not linked yet - need to rebuild app
        if (__DEV__) {
          console.log('StoreReview native module not available - app needs to be rebuilt');
        }
      }

      if (isAvailable) {
        await StoreReview.requestReview();
        // Mark as completed since native API handles the flow
        markRatingCompleted();
      } else {
        // Fallback to opening store URL if native API not available
        if (Platform.OS === 'ios') {
          const bundleId = Constants.expoConfig?.ios?.bundleIdentifier || 'com.pattar.readyplayerone';
          Linking.openURL(`https://apps.apple.com/app/id${bundleId}?action=write-review`).catch(() => {
            console.log('Could not open App Store. Bundle ID:', bundleId);
          });
        } else if (Platform.OS === 'android') {
          const packageName = Constants.expoConfig?.android?.package || 'com.pattar.readyplayerone';
          Linking.openURL(`https://play.google.com/store/apps/details?id=${packageName}`).catch(() => {
            console.log('Could not open Play Store. Package:', packageName);
          });
        }
        // Still mark as completed since we opened the store
        markRatingCompleted();
      }
    } catch (error) {
      console.log('Error opening store rating:', error);
      // Fallback to URL
      if (Platform.OS === 'ios') {
        const bundleId = Constants.expoConfig?.ios?.bundleIdentifier || 'com.pattar.readyplayerone';
        Linking.openURL(`https://apps.apple.com/app/id${bundleId}?action=write-review`).catch(() => {});
      } else if (Platform.OS === 'android') {
        const packageName = Constants.expoConfig?.android?.package || 'com.pattar.readyplayerone';
        Linking.openURL(`https://play.google.com/store/apps/details?id=${packageName}`).catch(() => {});
      }
      markRatingCompleted();
    }
  }, [markRatingCompleted]);

  // Debug function to reset rating data (dev mode only)
  const resetRatingData = useCallback(async () => {
    if (!__DEV__) return;
    try {
      await Promise.all([
        AsyncStorage.removeItem(RATING_STORAGE_KEY),
        AsyncStorage.removeItem(RATING_DISMISSED_KEY),
        AsyncStorage.removeItem(RATING_COMPLETED_KEY),
      ]);
      console.log('Rating data reset for testing');
      // Re-check after reset
      const checkRating = async () => {
        const stored = await AsyncStorage.getItem(RATING_STORAGE_KEY);
        if (!stored) {
          // Initialize fresh data
          const today = new Date().toISOString().split('T')[0];
          const freshData: RatingData = {
            appOpens: 0,
            gameCompletions: 0,
            lastShownDate: null,
            firstOpenDate: today,
          };
          await AsyncStorage.setItem(RATING_STORAGE_KEY, JSON.stringify(freshData));
        }
      };
      await checkRating();
    } catch (error) {
      console.log('Error resetting rating data:', error);
    }
  }, []);

  return {
    shouldShowRating,
    isLoading,
    trackAppOpen,
    trackGameCompletion,
    markRatingShown,
    markRatingDismissed,
    markRatingCompleted,
    openStoreRating,
    resetRatingData: __DEV__ ? resetRatingData : undefined,
    checkShouldShowRating, // Expose for manual re-checking
  };
};

