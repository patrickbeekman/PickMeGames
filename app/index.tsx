import { Text } from '@tamagui/core';
import { Image } from '@tamagui/image';
import { XStack, YStack } from '@tamagui/stacks';
import { LinearGradient } from 'expo-linear-gradient';
import { Link, useNavigation } from 'expo-router';
import { useEffect, useLayoutEffect, useRef } from 'react';
import { Animated, Pressable, ScrollView, StatusBar, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Design } from '../constants/Design';
import { useAnalytics } from '../hooks/useAnalytics';

export default function HomeScreen() {
  const navigation = useNavigation();

  useLayoutEffect(() => {
    navigation.setOptions({
      title: '',
    });
  }, [navigation]);

  const { capture, isReady } = useAnalytics();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;
  
  const options = [
    { title: 'Multifinger Tap', route: '/finger-tap', emoji: '👆', gradient: ['#4CAF50', '#66BB6A'] },
    { title: 'Spinner', route: '/spinner', emoji: '🌀', gradient: ['#2196F3', '#42A5F5'] },
    { title: 'Numbered Spinner', route: '/numbered-spinner', emoji: '🍭', gradient: ['#9C27B0', '#BA68C8'] },
    { title: 'Random Number', route: '/random-number', emoji: '🎲', gradient: ['#FF9800', '#FFB74D'] },
    { title: 'Prompted', route: '/prompted', emoji: '💭', gradient: ['#E91E63', '#F06292'] },
  ];

  // Create animation values for each button
  const buttonAnims = useRef(
    options.map(() => ({
      fade: new Animated.Value(0),
      slide: new Animated.Value(30),
    }))
  ).current;

  useEffect(() => {
    if (isReady) {
      capture('entered_home_screen');
    }
  }, [capture, isReady]);

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
  }, []);

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <YStack flex={1} backgroundColor={Design.colors.background.light}>
        <LinearGradient
          colors={[Design.colors.background.light, Design.colors.background.medium, Design.colors.background.lightest]}
          locations={[0, 0.5, 1]}
          style={StyleSheet.absoluteFillObject}
        />
        <StatusBar barStyle="dark-content" backgroundColor={Design.colors.background.light} />
        
        <YStack flex={1} paddingHorizontal={Design.spacing.lg}>
          {/* Scrollable Content Area */}
          <ScrollView
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
                  width={140}
                  height={140}
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
              </YStack>
            </Animated.View>
          </ScrollView>
          
          {/* Bottom About Button - Fixed Position */}
          <Animated.View
            style={{
              opacity: fadeAnim,
              width: '100%',
              paddingBottom: Design.spacing.md,
              paddingTop: Design.spacing.sm,
            }}
          >
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
                    ...Design.shadows.lg,
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
                    paddingVertical: Design.spacing.md + 6,
                    paddingHorizontal: Design.spacing.lg,
                    borderRadius: Design.borderRadius.lg,
                    minHeight: 56,
                    justifyContent: 'center',
                    alignItems: 'center',
                  }}
                >
                  <XStack alignItems="center" justifyContent="center" gap={Design.spacing.sm}>
                    <Text fontSize={Design.typography.sizes.lg + 2}>👨🏻‍🌾</Text>
                    <Text 
                      color={Design.colors.text.white} 
                      fontWeight={Design.typography.weights.bold} 
                      fontSize={Design.typography.sizes.lg}
                      style={{ 
                        textShadowColor: 'rgba(0, 0, 0, 0.4)', 
                        textShadowOffset: { width: 0, height: 1 }, 
                        textShadowRadius: 3 
                      }}
                    >
                      About
                    </Text>
                  </XStack>
                </LinearGradient>
              </Pressable>
            </Link>
          </Animated.View>
        </YStack>
      </YStack>
    </SafeAreaView>
  );
}
