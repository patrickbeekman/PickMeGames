import { Text } from '@tamagui/core';
import { Image } from '@tamagui/image';
import { XStack, YStack } from '@tamagui/stacks';
import { LinearGradient } from 'expo-linear-gradient';
import { Link, useNavigation } from 'expo-router';
import { useEffect, useLayoutEffect, useMemo, useRef } from 'react';
import { Animated, Linking, Pressable, ScrollView, StatusBar, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Design } from '../constants/Design';
import { useAnalytics } from '../hooks/useAnalytics';
import { useAppRating } from '../hooks/useAppRating';

// Component to handle native rating prompt - triggers directly without custom modal
function RatingPromptHandler({ shouldShow, onOpenStore, onComplete }: { shouldShow: boolean; onOpenStore: () => void; onComplete: () => void }) {
  const hasShownRef = useRef(false);
  
  useEffect(() => {
    if (shouldShow && !hasShownRef.current) {
      hasShownRef.current = true;
      // Small delay to ensure UI is ready
      setTimeout(() => {
        onOpenStore();
        onComplete();
      }, 500);
    }
  }, [shouldShow, onOpenStore, onComplete]);
  
  return null;
}

export default function HomeScreen() {
  const navigation = useNavigation();

  useLayoutEffect(() => {
    navigation.setOptions({
      title: '',
    });
  }, [navigation]);

  const { capture } = useAnalytics();
  const {
    shouldShowRating,
    trackAppOpen,
    markRatingCompleted,
    openStoreRating,
    checkShouldShowRating,
  } = useAppRating();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;
  const scrollViewRef = useRef<ScrollView>(null);
  
  // Memoize options array to prevent recreation on every render
  const options = useMemo(() => [
    { title: 'Multifinger Tap', route: '/finger-tap', emoji: '👆', gradient: ['#4CAF50', '#66BB6A'] },
    { title: 'Spinner', route: '/spinner', emoji: '🌀', gradient: ['#1976D2', '#42A5F5'] }, // Updated for better contrast
    { title: 'Numbered Spinner', route: '/numbered-spinner', emoji: '🍭', gradient: ['#7B1FA2', '#BA68C8'] }, // Updated for better contrast
    { title: 'Random Number', route: '/random-number', emoji: '🎲', gradient: ['#F57C00', '#FFB74D'] }, // Updated for better contrast
    { title: 'Prompted', route: '/prompted', emoji: '💭', gradient: ['#C2185B', '#F06292'] }, // Updated for better contrast
    { title: 'Coin Flip', route: '/coin-flip', emoji: '🪙', gradient: ['#FFD700', '#FFA500'] },
    { title: 'Timer Countdown', route: '/timer-countdown', emoji: '⏱️', gradient: ['#4ECDC4', '#45B7D1'] },
    { title: 'Color Matcher', route: '/color-matcher', emoji: '🎨', gradient: ['#FF6B6B', '#FF8E8E'] },
  ], []);

  // Create animation values for each button
  const buttonAnims = useRef(
    options.map(() => ({
      fade: new Animated.Value(0),
      slide: new Animated.Value(30),
    }))
  ).current;

  useEffect(() => {
    capture('entered_home_screen');
    trackAppOpen();
  }, [capture, trackAppOpen]);
  
  // Re-check rating state when screen comes into focus
  // This ensures the prompt shows if conditions were met while on another screen
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      // Re-check rating state when returning to home screen
      checkShouldShowRating();
    });
    return unsubscribe;
  }, [navigation, checkShouldShowRating]);
  
  // Separate effect to log rating state (for debugging)
  useEffect(() => {
    if (__DEV__) {
      console.log('Home screen - shouldShowRating:', shouldShowRating);
    }
  }, [shouldShowRating]);

  useEffect(() => {
    // Main content entrance animation
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();

    // Staggered button animations
    buttonAnims.forEach((anim, index) => {
      Animated.parallel([
        Animated.timing(anim.fade, {
          toValue: 1,
          duration: 500,
          delay: 200 + index * 100,
          useNativeDriver: true,
        }),
        Animated.timing(anim.slide, {
          toValue: 0,
          duration: 500,
          delay: 200 + index * 100,
          useNativeDriver: true,
        }),
      ]).start();
    });

    // Scroll hint animation - gently scrolls down and back up to indicate more content
    // Wait for all entrance animations to complete first
    const totalAnimationTime = 200 + (options.length - 1) * 100 + 500;
    setTimeout(() => {
      if (scrollViewRef.current) {
        // Scroll down smoothly
        scrollViewRef.current.scrollTo({ y: 120, animated: true });
        // Then scroll back up after a brief pause
        setTimeout(() => {
          if (scrollViewRef.current) {
            scrollViewRef.current.scrollTo({ y: 0, animated: true });
          }
        }, 800);
      }
    }, totalAnimationTime + 300);
  }, []);

  return (
    <View style={{ flex: 1 }}>
      <LinearGradient
        colors={[Design.colors.background.light, Design.colors.background.medium, Design.colors.background.lightest]}
        locations={[0, 0.5, 1]}
        style={StyleSheet.absoluteFillObject}
      />
      <StatusBar barStyle="dark-content" backgroundColor={Design.colors.background.light} />
      <SafeAreaView style={{ flex: 1 }}>
        <YStack flex={1} paddingHorizontal={Design.spacing.lg}>
          {/* Scrollable Content Area */}
          <ScrollView
            ref={scrollViewRef}
            contentContainerStyle={{
              paddingTop: Design.spacing.lg,
              paddingBottom: Design.spacing.xl,
              alignItems: 'center',
            }}
            showsVerticalScrollIndicator={false}
          >
            <Animated.View
              style={{
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }],
                width: '100%',
                alignItems: 'center',
              }}
            >
              {/* Logo */}
              <YStack 
                marginBottom={Design.spacing.md} 
                alignItems="center"
                style={{
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 8 },
                  shadowOpacity: 0.15,
                  shadowRadius: 16,
                  elevation: 8,
                }}
              >
                <Image
                  source={require('../assets/images/pickmelogo_transparent.png')}
                  width={180}
                  height={180}
                  objectFit='contain'
                  alt='PickMe Games Logo'
                  accessibilityRole="image"
                  accessibilityLabel="PickMe Games Logo"
                />
              </YStack>
              
              {/* Title Section */}
              <YStack alignItems="center" marginBottom={Design.spacing.lg} paddingHorizontal={Design.spacing.md}>
                <Text 
                  fontSize={Design.typography.sizes.xxl} 
                  color={Design.colors.text.primary} 
                  fontWeight={Design.typography.weights.bold} 
                  textAlign="center" 
                  marginBottom={Design.spacing.xs}
                  letterSpacing={Design.typography.letterSpacing.tight}
                  accessibilityRole="header"
                >
                  Who goes first?
                </Text>
                <Text
                  fontSize={Design.typography.sizes.sm}
                  color={Design.colors.text.secondary}
                  textAlign="center"
                  maxWidth={320}
                  lineHeight={Design.typography.sizes.sm * 1.4}
                  accessibilityRole="text"
                >
                  Pick a mode below and follow the instructions to let fate decide who goes first.
                </Text>
              </YStack>

              {/* Game Options */}
              <YStack width="100%" maxWidth={360} alignItems="center" gap={Design.spacing.sm}>
                {options.map((opt, index) => (
                  <Animated.View
                    key={opt.route}
                    style={{
                      width: '100%',
                      opacity: buttonAnims[index].fade,
                      transform: [{ translateY: buttonAnims[index].slide }],
                    }}
                  >
                    <Link href={opt.route as any} asChild>
                      <Pressable
                        accessibilityRole="button"
                        accessibilityLabel={`Open ${opt.title} game mode`}
                        accessibilityHint={`Starts the ${opt.title} game mode to help decide who goes first`}
                        style={({ pressed }) => [
                          {
                            borderRadius: Design.borderRadius.lg,
                            overflow: 'hidden',
                            backgroundColor: '#FFFFFF',
                            ...Design.shadows.md,
                            transform: [{ scale: pressed ? Design.pressScale.md : 1 }],
                            opacity: pressed ? 0.95 : 1,
                          },
                        ]}
                      >
                        <LinearGradient
                          colors={opt.gradient as [string, string]}
                          start={{ x: 0, y: 0 }}
                          end={{ x: 1, y: 1 }}
                          style={{
                            paddingVertical: Design.spacing.md,
                            paddingHorizontal: Design.spacing.md,
                            borderRadius: Design.borderRadius.lg,
                            minHeight: 56,
                            justifyContent: 'center',
                            alignItems: 'center',
                          }}
                        >
                          <XStack 
                            alignItems="center" 
                            justifyContent="space-between" 
                            width="100%"
                            gap={Design.spacing.sm}
                          >
                            <View
                              style={{
                                width: 36,
                                height: 36,
                                borderRadius: Design.borderRadius.sm,
                                backgroundColor: 'rgba(255, 255, 255, 0.3)',
                                alignItems: 'center',
                                justifyContent: 'center',
                                shadowColor: '#000',
                                shadowOffset: { width: 0, height: 2 },
                                shadowOpacity: 0.1,
                                shadowRadius: 4,
                                elevation: 2,
                              }}
                            >
                              <Text fontSize={20}>
                                {opt.emoji}
                              </Text>
                            </View>
                            <Text 
                              color={Design.colors.text.white} 
                              fontSize={Design.typography.sizes.md} 
                              fontWeight={Design.typography.weights.bold} 
                              flex={1} 
                              textAlign="left"
                              letterSpacing={Design.typography.letterSpacing.normal}
                            >
                              {opt.title}
                            </Text>
                            <View
                              style={{
                                width: 24,
                                height: 24,
                                borderRadius: Design.borderRadius.full,
                                backgroundColor: 'rgba(255, 255, 255, 0.35)',
                                alignItems: 'center',
                                justifyContent: 'center',
                              }}
                            >
                              <Text 
                                color={Design.colors.text.white} 
                                fontSize={Design.typography.sizes.md}
                                fontWeight={Design.typography.weights.bold}
                              >
                                →
                              </Text>
                            </View>
                          </XStack>
                        </LinearGradient>
                      </Pressable>
                    </Link>
                  </Animated.View>
                ))}
                
                {/* About and Feedback Buttons - Side by Side */}
                <Animated.View
                  style={{
                    width: '100%',
                    opacity: fadeAnim,
                    transform: [{ translateY: slideAnim }],
                    marginTop: Design.spacing.sm,
                  }}
                >
                  <XStack width="100%" gap={Design.spacing.sm}>
                    {/* About Button - Half Width */}
                    <View style={{ flex: 1 }}>
                      <Link href="/about" asChild>
                        <Pressable
                          accessibilityRole="button"
                          accessibilityLabel="About"
                          accessibilityHint="Opens the about page with app information"
                          style={({ pressed }) => [
                            {
                              borderRadius: Design.borderRadius.lg,
                              overflow: 'hidden',
                              backgroundColor: '#FFFFFF',
                              ...Design.shadows.md,
                              transform: [{ scale: pressed ? Design.pressScale.sm : 1 }],
                              opacity: pressed ? 0.95 : 1,
                            },
                          ]}
                        >
                          <LinearGradient
                            colors={[Design.colors.primary, Design.colors.primaryDark]}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 0 }}
                            style={{
                              paddingVertical: Design.spacing.md,
                              paddingHorizontal: Design.spacing.md,
                              borderRadius: Design.borderRadius.lg,
                              minHeight: 56,
                              justifyContent: 'center',
                              alignItems: 'center',
                            }}
                          >
                            <XStack alignItems="center" justifyContent="center" gap={Design.spacing.xs}>
                              <Text fontSize={Design.typography.sizes.md + 2}>👨🏻‍🌾</Text>
                              <Text 
                                color={Design.colors.text.white} 
                                fontWeight={Design.typography.weights.bold} 
                                fontSize={Design.typography.sizes.md}
                              >
                                About
                              </Text>
                            </XStack>
                          </LinearGradient>
                        </Pressable>
                      </Link>
                    </View>
                    
                    {/* Feedback Button - Half Width */}
                    <View style={{ flex: 1 }}>
                      <Pressable
                        accessibilityRole="button"
                        accessibilityLabel="Send Feedback"
                        accessibilityHint="Opens feedback form"
                        onPress={() => {
                          capture('feedback_button_pressed');
                          Linking.openURL('https://airtable.com/appPI2noUjKkmeNWM/pagrjCubfIJqODIOQ/form');
                        }}
                        style={({ pressed }) => [
                          {
                            borderRadius: Design.borderRadius.lg,
                            overflow: 'hidden',
                            backgroundColor: '#FFFFFF',
                            ...Design.shadows.md,
                            transform: [{ scale: pressed ? Design.pressScale.sm : 1 }],
                            opacity: pressed ? 0.95 : 1,
                          },
                        ]}
                      >
                        <LinearGradient
                          colors={['#9E9E9E', '#757575']}
                          start={{ x: 0, y: 0 }}
                          end={{ x: 1, y: 0 }}
                          style={{
                            paddingVertical: Design.spacing.md,
                            paddingHorizontal: Design.spacing.md,
                            borderRadius: Design.borderRadius.lg,
                            minHeight: 56,
                            justifyContent: 'center',
                            alignItems: 'center',
                          }}
                        >
                          <XStack alignItems="center" justifyContent="center" gap={Design.spacing.xs}>
                            <Text fontSize={Design.typography.sizes.md + 2}>💬</Text>
                            <Text 
                              color={Design.colors.text.white} 
                              fontWeight={Design.typography.weights.bold} 
                              fontSize={Design.typography.sizes.md}
                            >
                              Feedback
                            </Text>
                          </XStack>
                        </LinearGradient>
                      </Pressable>
                    </View>
                  </XStack>
                </Animated.View>
              </YStack>
            </Animated.View>
          </ScrollView>
        </YStack>
      </SafeAreaView>
      
      {/* Rating Prompt Handler - Directly trigger native review */}
      {shouldShowRating && (
        <RatingPromptHandler
          shouldShow={shouldShowRating}
          onOpenStore={openStoreRating}
          onComplete={markRatingCompleted}
        />
      )}
    </View>
  );
}
