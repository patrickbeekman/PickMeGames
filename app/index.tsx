import { Text } from '@tamagui/core';
import { Image } from '@tamagui/image';
import { XStack, YStack } from '@tamagui/stacks';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { Link, useNavigation } from 'expo-router';
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { Animated, Linking, Modal, Pressable, ScrollView, StatusBar, StyleSheet, TouchableOpacity, View } from 'react-native';
import DraggableFlatList, { RenderItemParams, ScaleDecorator } from 'react-native-draggable-flatlist';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Design } from '../constants/Design';
import { useAnalytics } from '../hooks/useAnalytics';
import { GameModeOption, useGameModeOrder } from '../hooks/useGameModeOrder';

export default function HomeScreen() {
  const navigation = useNavigation();
  const [isEditMode, setIsEditMode] = useState(false);
  const [showHelpTip, setShowHelpTip] = useState(false);

  useLayoutEffect(() => {
    navigation.setOptions({
      title: '',
    });
  }, [navigation]);

  const { capture } = useAnalytics();

  const openFeedback = () => {
    Linking.openURL('https://airtable.com/appPI2noUjKkmeNWM/pagrjCubfIJqODIOQ/form');
  };
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;
  
  // Memoize options array to prevent recreation on every render
  const defaultOptions = useMemo<GameModeOption[]>(() => [
    { title: 'Multifinger Tap', route: '/finger-tap', icon: require('../icons/finger-tap.png'), gradient: ['#4CAF50', '#66BB6A'] as [string, string] },
    { title: 'Color Matcher', route: '/color-matcher', icon: require('../icons/color-matcher.png'), gradient: ['#FF6B6B', '#FF8E8E'] as [string, string] },
    { title: 'Timer Countdown', route: '/timer-countdown', icon: require('../icons/timer-countdown.png'), gradient: ['#4ECDC4', '#45B7D1'] as [string, string] },
    { title: 'Numbered Spinner', route: '/numbered-spinner', icon: require('../icons/numbered-spinner.png'), gradient: ['#7B1FA2', '#BA68C8'] as [string, string] },
    { title: 'Spinner', route: '/spinner', icon: require('../icons/spinner.png'), gradient: ['#1976D2', '#42A5F5'] as [string, string] },
    { title: 'Random Number', route: '/random-number', icon: require('../icons/random-number.png'), gradient: ['#F57C00', '#FFB74D'] as [string, string] },
    { title: 'Prompt to pick', route: '/prompted', icon: require('../icons/prompt.png'), gradient: ['#C2185B', '#F06292'] as [string, string] },
    { title: 'Coin Flip', route: '/coin-flip', icon: require('../icons/coin-flip.png'), gradient: ['#FFD700', '#FFA500'] as [string, string] },
  ], []);

  const { orderedOptions, loading, hasSeenTip, saveOrder, markTipAsSeen } = useGameModeOrder(defaultOptions);

  // Show help tip on first load if not seen
  useEffect(() => {
    if (!loading && !hasSeenTip && !isEditMode) {
      // Small delay to let screen render first
      const timer = setTimeout(() => {
        setShowHelpTip(true);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [loading, hasSeenTip, isEditMode]);

  // Create animation values for each button
  const buttonAnims = useRef(
    defaultOptions.map(() => ({
      fade: new Animated.Value(0),
      slide: new Animated.Value(30),
    }))
  ).current;

  const handleLongPress = () => {
    if (isEditMode) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setIsEditMode(true);
    if (showHelpTip) {
      setShowHelpTip(false);
      markTipAsSeen();
    }
    capture('entered_edit_mode');
  };

  const handleDone = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setIsEditMode(false);
    capture('exited_edit_mode');
  };

  const handleDragEnd = ({ data }: { data: GameModeOption[] }) => {
    saveOrder(data);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    capture('reordered_game_modes', { newOrder: data.map(opt => opt.route) });
  };

  useEffect(() => {
    capture('entered_home_screen');
  }, [capture]);

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
            contentContainerStyle={{
              paddingTop: Design.spacing.md,
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
                marginBottom={Design.spacing.sm} 
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
                  width={210}
                  height={210}
                  objectFit='contain'
                  alt='PickMe Games Logo'
                  accessibilityRole="image"
                  accessibilityLabel="PickMe Games Logo"
                />
              </YStack>
              
              {/* Title Section */}
              <YStack alignItems="center" marginBottom={Design.spacing.md} paddingHorizontal={Design.spacing.md}>
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
              <View style={{ width: '100%', maxWidth: 360 }}>
                {isEditMode ? (
                  <DraggableFlatList
                    data={orderedOptions}
                    onDragEnd={handleDragEnd}
                    keyExtractor={(item) => item.route}
                    renderItem={({ item, drag, isActive }: RenderItemParams<GameModeOption>) => (
                      <ScaleDecorator>
                        <Pressable
                          onLongPress={drag}
                          disabled={isActive}
                          style={({ pressed }) => [
                            {
                              opacity: isActive ? 0.8 : pressed ? 0.95 : 1,
                              transform: [{ scale: isActive ? 1.02 : 1 }],
                            },
                          ]}
                        >
                          <View
                            style={{
                              borderRadius: Design.borderRadius.lg,
                              overflow: 'hidden',
                              backgroundColor: '#FFFFFF',
                              ...Design.shadows.md,
                              marginBottom: Design.spacing.sm,
                            }}
                          >
                            <LinearGradient
                              colors={item.gradient as [string, string]}
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
                                {/* Hamburger icon */}
                                <View
                                  style={{
                                    width: 24,
                                    height: 24,
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                  }}
                                >
                                  <Text 
                                    color={Design.colors.text.white} 
                                    fontSize={Design.typography.sizes.lg}
                                    fontWeight={Design.typography.weights.bold}
                                    style={{ opacity: 0.9 }}
                                  >
                                    ☰
                                  </Text>
                                </View>
                                <Image
                                  source={item.icon}
                                  width={44}
                                  height={44}
                                  objectFit="contain"
                                  resizeMode="contain"
                                  accessibilityLabel={`${item.title} icon`}
                                />
                                <Text 
                                  color={Design.colors.text.white} 
                                  fontSize={Design.typography.sizes.md} 
                                  fontWeight={Design.typography.weights.bold} 
                                  flex={1} 
                                  textAlign="left"
                                  letterSpacing={Design.typography.letterSpacing.normal}
                                >
                                  {item.title}
                                </Text>
                                <View style={{ width: 24 }} />
                              </XStack>
                            </LinearGradient>
                          </View>
                        </Pressable>
                      </ScaleDecorator>
                    )}
                    scrollEnabled={false}
                  />
                ) : (
                  <YStack width="100%" alignItems="center" gap={Design.spacing.sm}>
                    {orderedOptions.map((opt, index) => (
                      <Animated.View
                        key={opt.route}
                        style={{
                          width: '100%',
                          opacity: buttonAnims[index]?.fade || 1,
                          transform: [{ translateY: buttonAnims[index]?.slide || 0 }],
                        }}
                      >
                        <Link href={opt.route as any} asChild>
                          <Pressable
                            onLongPress={handleLongPress}
                            accessibilityRole="button"
                            accessibilityLabel={`Open ${opt.title} game mode`}
                            accessibilityHint={`Long press to reorder. Starts the ${opt.title} game mode to help decide who goes first`}
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
                                <Image
                                  source={opt.icon}
                                  width={44}
                                  height={44}
                                  objectFit="contain"
                                  resizeMode="contain"
                                  accessibilityLabel={`${opt.title} icon`}
                                />
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
                )}
              </View>

              {/* Edit Mode Done Button */}
              {isEditMode && (
                <Animated.View
                  style={{
                    opacity: fadeAnim,
                    width: '100%',
                    marginTop: Design.spacing.md,
                  }}
                >
                  <Pressable
                    onPress={handleDone}
                    accessibilityRole="button"
                    accessibilityLabel="Done editing"
                    style={({ pressed }) => [
                      {
                        borderRadius: Design.borderRadius.lg,
                        overflow: 'hidden',
                        backgroundColor: '#FFFFFF',
                        ...Design.shadows.lg,
                        transform: [{ scale: pressed ? Design.pressScale.sm : 1 }],
                        opacity: pressed ? 0.95 : 1,
                        alignSelf: 'center',
                        minWidth: 120,
                      },
                    ]}
                  >
                    <LinearGradient
                      colors={[Design.colors.primary, Design.colors.primaryDark]}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                      style={{
                        paddingVertical: Design.spacing.md,
                        paddingHorizontal: Design.spacing.xl,
                        borderRadius: Design.borderRadius.lg,
                        minHeight: 48,
                        justifyContent: 'center',
                        alignItems: 'center',
                      }}
                    >
                      <Text 
                        color={Design.colors.text.white} 
                        fontWeight={Design.typography.weights.bold} 
                        fontSize={Design.typography.sizes.md}
                        style={{ 
                          textShadowColor: 'rgba(0, 0, 0, 0.4)', 
                          textShadowOffset: { width: 0, height: 1 }, 
                          textShadowRadius: 3 
                        }}
                      >
                        Done
                      </Text>
                    </LinearGradient>
                  </Pressable>
                </Animated.View>
              )}

              {/* About / Feedback Row */}
              <Animated.View
                style={{
                  opacity: fadeAnim,
                  width: '100%',
                  marginTop: Design.spacing.lg,
                  paddingBottom: Design.spacing.lg,
                }}
              >
                <XStack gap={Design.spacing.md} width="100%" maxWidth={380} alignSelf="center">
                  <Link href="/about" asChild>
                    <Pressable
                      accessibilityRole="button"
                      accessibilityLabel="About"
                      accessibilityHint="Opens the about page with app information"
                      style={({ pressed }) => [
                        {
                          flex: 1,
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

                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel="Feedback"
                    accessibilityHint="Opens the feedback form"
                    onPress={openFeedback}
                    style={({ pressed }) => [
                      {
                        flex: 1,
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
                      colors={['#9AA3AD', '#7F8A95']}
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
                        <Text fontSize={Design.typography.sizes.lg + 2}>💬</Text>
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
                          Feedback
                        </Text>
                      </XStack>
                    </LinearGradient>
                  </Pressable>
                </XStack>
              </Animated.View>
            </Animated.View>
          </ScrollView>
        </YStack>
      </SafeAreaView>

      {/* Help Tip Modal */}
      <Modal
        visible={showHelpTip}
        transparent
        animationType="fade"
        onRequestClose={() => {
          setShowHelpTip(false);
          markTipAsSeen();
        }}
      >
        <Pressable
          style={{
            flex: 1,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            justifyContent: 'center',
            alignItems: 'center',
            paddingHorizontal: Design.spacing.lg,
          }}
          onPress={() => {
            setShowHelpTip(false);
            markTipAsSeen();
          }}
        >
          <Pressable
            onPress={(e) => e.stopPropagation()}
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: Design.borderRadius.lg,
              padding: Design.spacing.lg,
              maxWidth: 320,
              ...Design.shadows.xl,
            }}
          >
            <YStack gap={Design.spacing.md} alignItems="center">
              <Text
                fontSize={Design.typography.sizes.lg}
                fontWeight={Design.typography.weights.bold}
                color={Design.colors.text.primary}
                textAlign="center"
              >
                Reorder Game Modes
              </Text>
              <Text
                fontSize={Design.typography.sizes.sm}
                color={Design.colors.text.secondary}
                textAlign="center"
                lineHeight={Design.typography.sizes.sm * 1.5}
              >
                Long press any game mode button to enter edit mode, then drag and drop to reorder them to your preference.
              </Text>
              <TouchableOpacity
                onPress={() => {
                  setShowHelpTip(false);
                  markTipAsSeen();
                }}
                style={{
                  marginTop: Design.spacing.sm,
                  paddingVertical: Design.spacing.sm,
                  paddingHorizontal: Design.spacing.lg,
                  borderRadius: Design.borderRadius.md,
                  backgroundColor: Design.colors.primary,
                }}
              >
                <Text
                  color={Design.colors.text.white}
                  fontWeight={Design.typography.weights.bold}
                  fontSize={Design.typography.sizes.md}
                >
                  Got it!
                </Text>
              </TouchableOpacity>
            </YStack>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}
