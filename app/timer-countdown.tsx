import { Text } from '@tamagui/core';
import { XStack, YStack } from '@tamagui/stacks';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import {
  AccessibilityInfo,
  Animated,
  Dimensions,
  Easing,
  GestureResponderEvent,
  NativeTouchEvent,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import ConfettiCannon from 'react-native-confetti-cannon';
import { Ripple } from '../components/Ripple';
import { Design } from '../constants/Design';
import { useAnalytics } from '../hooks/useAnalytics';

const { width, height } = Dimensions.get('window');
const MIN_DELAY = 2000; // 2 seconds
const MAX_DELAY = 10000; // 10 seconds
const WINNER_BG_COLOR = '#CBF578'; // Light bright green for winner screen

type Phase = 'waiting' | 'ready' | 'flashing' | 'winner';

export default function TimerCountdownScreen() {
  const navigation = useNavigation();
  const { capture, isReady } = useAnalytics();
  const [phase, setPhase] = useState<Phase>('waiting');
  const [touches, setTouches] = useState<{ identifier: number; x: number; y: number; timestamp: number }[]>([]);
  const [winner, setWinner] = useState<{ x: number; y: number; identifier: number } | null>(null);
  const [particles, setParticles] = useState<Animated.ValueXY[]>([]);
  const [flashTime, setFlashTime] = useState<number | null>(null);
  const [reactionTimes, setReactionTimes] = useState<number[]>([]);

  const backgroundColor = useRef(new Animated.Value(0)).current;
  const flashAnim = useRef(new Animated.Value(0)).current;
  const headerFadeAnim = useRef(new Animated.Value(0)).current;
  const headerSlideAnim = useRef(new Animated.Value(20)).current;
  const buttonFadeAnim = useRef(new Animated.Value(0)).current;
  const buttonSlideAnim = useRef(new Animated.Value(30)).current;
  const readyTimerRef = useRef<NodeJS.Timeout | null>(null);
  const flashTimerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    navigation.setOptions({
      headerTitle: 'Timer Countdown',
      headerStyle: {
        backgroundColor: Design.colors.background.light,
        borderBottomWidth: 0,
        shadowOpacity: 0,
        elevation: 0,
      },
      headerTintColor: Design.colors.text.primary,
      headerTitleStyle: {
        fontWeight: Design.typography.weights.bold,
        fontSize: Design.typography.sizes.xl,
      },
    });
  }, [navigation]);

  useEffect(() => {
    if (isReady) {
      capture('entered_timer_countdown');
    }
  }, [capture, isReady]);

  // Entrance animations
  useEffect(() => {
    Animated.parallel([
      Animated.timing(headerFadeAnim, {
        toValue: 1,
        duration: Design.animation.normal,
        useNativeDriver: true,
      }),
      Animated.timing(headerSlideAnim, {
        toValue: 0,
        duration: Design.animation.normal,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }),
      Animated.timing(buttonFadeAnim, {
        toValue: 1,
        duration: Design.animation.normal,
        delay: 200,
        useNativeDriver: true,
      }),
      Animated.timing(buttonSlideAnim, {
        toValue: 0,
        duration: Design.animation.normal,
        delay: 200,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  // Background color animation based on phase
  useEffect(() => {
    let toValue = 0;
    switch (phase) {
      case 'waiting':
        toValue = 0;
        break;
      case 'ready':
        toValue = 1;
        break;
      case 'flashing':
        toValue = 2;
        break;
      case 'winner':
        toValue = 3; // Keep green on winner screen
        break;
    }

    Animated.timing(backgroundColor, {
      toValue,
      duration: 500,
      easing: Easing.inOut(Easing.ease),
      useNativeDriver: false,
    }).start();
  }, [phase]);

  // Reset background when leaving page
  useEffect(() => {
    return () => {
      backgroundColor.setValue(0);
      flashAnim.setValue(0);
    };
  }, []);

  const startGame = () => {
    if (phase !== 'waiting') return;
    
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setPhase('ready');
    setTouches([]);
    setWinner(null);
    setFlashTime(null);
    setReactionTimes([]);
    
    // Random delay between 2-10 seconds
    const delay = MIN_DELAY + Math.random() * (MAX_DELAY - MIN_DELAY);
    
    readyTimerRef.current = setTimeout(() => {
      flash();
    }, delay);
  };

  const flash = () => {
    setPhase('flashing');
    const flashTimestamp = Date.now();
    setFlashTime(flashTimestamp);
    
    // Flash animation - keep the color (don't fade out)
    Animated.timing(flashAnim, {
      toValue: 1,
      duration: 200,
      useNativeDriver: false,
    }).start();
    
    // Haptic feedback for flash
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    
    // Sound would go here (using expo-av if needed)
    // For now, we rely on visual and haptic feedback
    
    // Auto-end game after 5 seconds if no one taps
    flashTimerRef.current = setTimeout(() => {
      if (phase === 'flashing' && touches.length === 0) {
        reset();
      }
    }, 5000);
  };

  const onTouchStart = (e: GestureResponderEvent) => {
    if (phase !== 'flashing') return;
    
    const touchTimestamp = Date.now();
    const newTouches = e.nativeEvent.touches.map((t: NativeTouchEvent) => ({
      identifier: Number(t.identifier),
      x: t.locationX,
      y: t.locationY,
      timestamp: touchTimestamp,
    }));
    
    // Accept all touches (we'll just take the first one that taps)
    const validTouches = newTouches.slice(0, 1);
    
    if (validTouches.length > 0 && flashTime) {
      const reactionTime = touchTimestamp - flashTime;
      setReactionTimes(prev => [...prev, reactionTime]);
      
      // Find fastest reaction
      if (touches.length === 0 || reactionTime < Math.min(...reactionTimes, reactionTime)) {
        const fastestTouch = validTouches[0];
        setWinner({
          x: fastestTouch.x,
          y: fastestTouch.y,
          identifier: fastestTouch.identifier,
        });
        triggerParticles(fastestTouch.x, fastestTouch.y);
        setPhase('winner');
        
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        AccessibilityInfo.announceForAccessibility(`Winner! Reaction time: ${reactionTime}ms`);
        
        capture('timer_countdown_winner', {
          reactionTime,
          totalTouches: validTouches.length,
        });
      }
    }
    
    setTouches(prev => [...prev, ...validTouches]);
  };

  const triggerParticles = (x: number, y: number) => {
    const PARTICLE_COUNT = 24;
    const newParticles = Array.from({ length: PARTICLE_COUNT }).map((_, i) => {
      const angle = (2 * Math.PI * i) / PARTICLE_COUNT;
      const dx = Math.cos(angle) * 100;
      const dy = Math.sin(angle) * 100;
      const animated = new Animated.ValueXY({ x, y });
      const particleAnimation = Animated.timing(animated, {
        toValue: { x: x + dx, y: y + dy },
        duration: 600,
        useNativeDriver: false,
      });
      particleAnimation.start();
      return animated;
    });
    setParticles(newParticles);
  };

  const reset = () => {
    if (readyTimerRef.current) clearTimeout(readyTimerRef.current);
    if (flashTimerRef.current) clearTimeout(flashTimerRef.current);
    setPhase('waiting');
    setTouches([]);
    setWinner(null);
    setParticles([]);
    setFlashTime(null);
    setReactionTimes([]);
    // Reset flash animation
    Animated.timing(flashAnim, {
      toValue: 0,
      duration: 300,
      useNativeDriver: false,
    }).start();
  };

  // Cleanup
  useEffect(() => {
    return () => {
      if (readyTimerRef.current) clearTimeout(readyTimerRef.current);
      if (flashTimerRef.current) clearTimeout(flashTimerRef.current);
      backgroundColor.stopAnimation();
      flashAnim.stopAnimation();
      particles.forEach(p => p.stopAnimation());
    };
  }, []);

  const bgColor = backgroundColor.interpolate({
    inputRange: [0, 1, 2, 3],
    outputRange: ['#F3E889', '#E8F5E9', WINNER_BG_COLOR, WINNER_BG_COLOR], // Keep green on winner screen
  });

  // Light bright green that matches app theme - keep it solid, not transparent
  const flashColor = flashAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['rgba(203, 245, 120, 0)', WINNER_BG_COLOR], // #CBF578
  });

  return (
    <Animated.View style={[styles.container, { backgroundColor: bgColor }]}>
      <LinearGradient
        colors={[Design.colors.background.light, Design.colors.background.medium, Design.colors.background.lightest]}
        locations={[0, 0.5, 1]}
        style={StyleSheet.absoluteFillObject}
      />
      
      <ScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View
          style={[styles.container, { backgroundColor: 'transparent' }]}
          onTouchStart={onTouchStart}
          accessibilityRole="none"
          accessibilityLabel={
            phase === 'waiting' ? 'Tap start to begin game' :
            phase === 'ready' ? 'Waiting for flash...' :
            phase === 'flashing' ? 'Flash! Tap now!' :
            'Winner selected'
          }
        >
          {/* Flash overlay - solid light bright green background */}
          {phase === 'flashing' && (
            <Animated.View
              style={[
                StyleSheet.absoluteFillObject,
                {
                  backgroundColor: flashColor,
                  zIndex: 1, // Behind text but covers background
                },
              ]}
            />
          )}

          {/* Instructions */}
          {phase === 'waiting' && (
            <Animated.View
              style={{
                position: 'absolute',
                top: height * 0.2,
                left: Design.spacing.md,
                right: Design.spacing.md,
                opacity: headerFadeAnim,
                transform: [{ translateY: headerSlideAnim }],
                zIndex: 10,
              }}
            >
              <YStack alignItems="center">
                <Text fontSize={Design.typography.sizes.xxxl} marginBottom={Design.spacing.md}>⏱️</Text>
                <Text 
                  fontSize={Design.typography.sizes.xl} 
                  fontWeight={Design.typography.weights.bold} 
                  color={Design.colors.text.primary} 
                  textAlign="center" 
                  marginBottom={Design.spacing.sm}
                  letterSpacing={Design.typography.letterSpacing.tight}
                  accessibilityRole="header"
                >
                  Timer Countdown!
                </Text>
                <YStack
                  backgroundColor="rgba(255, 255, 255, 0.95)"
                  borderRadius={Design.borderRadius.lg}
                  padding={Design.spacing.lg}
                  alignItems="center"
                  {...Design.shadows.md}
                  marginBottom={Design.spacing.md}
                >
                  <Text
                    fontSize={Design.typography.sizes.md}
                    fontWeight={Design.typography.weights.semibold}
                    color={Design.colors.text.primary}
                    textAlign="center"
                    lineHeight={Design.typography.sizes.md * 1.4}
                    marginBottom={Design.spacing.sm}
                  >
                    Tap the screen when it flashes green!
                  </Text>
                  <Text
                    fontSize={Design.typography.sizes.sm}
                    color={Design.colors.text.secondary}
                    textAlign="center"
                    lineHeight={Design.typography.sizes.sm * 1.4}
                  >
                    The screen will flash and change color between 2-10 seconds. Fastest reaction wins!
                  </Text>
                </YStack>
              </YStack>
            </Animated.View>
          )}

          {/* Ready state */}
          {phase === 'ready' && (
            <YStack
              position="absolute"
              top={height * 0.3}
              alignSelf="center"
              alignItems="center"
              zIndex={10}
            >
              <Text 
                fontSize={Design.typography.sizes.xxxl + 8} 
                fontWeight={Design.typography.weights.bold} 
                color={Design.colors.text.primary}
                marginBottom={Design.spacing.md}
              >
                GET READY!
              </Text>
              <Text 
                fontSize={Design.typography.sizes.lg} 
                color={Design.colors.text.secondary}
                textAlign="center"
              >
                Watch for the flash...
              </Text>
            </YStack>
          )}

          {/* Flashing state */}
          {phase === 'flashing' && (
            <YStack
              position="absolute"
              top={height * 0.3}
              alignSelf="center"
              alignItems="center"
              zIndex={10}
            >
              <Text 
                fontSize={Design.typography.sizes.xxxl + 8} 
                fontWeight={Design.typography.weights.bold} 
                color={Design.colors.text.primary}
                marginBottom={Design.spacing.md}
                style={{
                  textShadowColor: 'rgba(255, 255, 255, 0.8)',
                  textShadowOffset: { width: 0, height: 2 },
                  textShadowRadius: 4,
                }}
              >
                TAP NOW!
              </Text>
            </YStack>
          )}

          {/* Ripples for touches */}
          {touches.map((touch) => (
            <Ripple
              key={touch.identifier}
              x={touch.x}
              y={touch.y}
              speed={1500}
            />
          ))}

          {/* Winner Display */}
          {winner && (
            <YStack
              position="absolute"
              left={winner.x - 55}
              top={winner.y - 55}
              width={120}
              height={120}
              borderRadius={60}
              justifyContent="center"
              alignItems="center"
              borderWidth={4}
              borderColor="white"
              shadowColor="#000"
              shadowOffset={{ width: 0, height: 8 }}
              shadowOpacity={0.3}
              shadowRadius={12}
              zIndex={10}
            >
              <LinearGradient
                colors={['#FFD700', '#FFC107', '#FF8F00']}
                style={{
                  width: 120,
                  height: 120,
                  borderRadius: 60,
                  position: 'absolute',
                }}
              />
              <Text fontSize={40}>👑</Text>
              <Text fontSize={12} color="white" fontWeight="bold" marginTop={4}>
                WINNER!
              </Text>
            </YStack>
          )}

          {/* Particles */}
          {particles.map((p, i) => (
            <Animated.View
              key={i}
              style={{
                position: 'absolute',
                width: 12,
                height: 12,
                borderRadius: 6,
                backgroundColor: '#FFD700',
                shadowColor: '#FFD700',
                shadowOpacity: 0.8,
                shadowRadius: 4,
                transform: [
                  { translateX: p.x },
                  { translateY: p.y },
                ],
              }}
            />
          ))}

          {/* Confetti */}
          {phase === 'winner' && (
            <ConfettiCannon
              count={120}
              origin={{ x: width / 2, y: 0 }}
              fadeOut={true}
              explosionSpeed={350}
              fallSpeed={2800}
              colors={['#FFD700', '#4CAF50', '#FF6B6B', '#4ECDC4', '#9B59B6']}
            />
          )}


          {/* Start/Reset Button */}
          <Animated.View
            style={{
              position: 'absolute',
              bottom: 80,
              alignSelf: 'center',
              opacity: buttonFadeAnim,
              transform: [{ translateY: buttonSlideAnim }],
              zIndex: 10,
            }}
          >
            <Pressable
              onPress={phase === 'waiting' ? startGame : reset}
              onTouchStart={(e) => e.stopPropagation()}
              accessibilityRole="button"
              accessibilityLabel={phase === 'waiting' ? 'Start game' : 'Reset game'}
              style={({ pressed }) => [
                {
                  borderRadius: Design.borderRadius.full,
                  overflow: 'hidden',
                  backgroundColor: '#FFFFFF',
                  ...Design.shadows.lg,
                  transform: [{ scale: pressed ? Design.pressScale.md : 1 }],
                },
              ]}
            >
              <LinearGradient
                colors={phase === 'waiting' 
                  ? [Design.colors.primary, Design.colors.primaryDark] 
                  : ['#FF5722', '#E64A19']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={{
                  paddingVertical: Design.spacing.md + 2,
                  paddingHorizontal: Design.spacing.xl,
                  borderRadius: Design.borderRadius.full,
                  alignItems: 'center',
                  justifyContent: 'center',
                  minHeight: 48,
                }}
              >
                <XStack alignItems="center" gap={Design.spacing.sm}>
                  <Text fontSize={Design.typography.sizes.lg}>
                    {phase === 'waiting' ? '▶️' : '🔄'}
                  </Text>
                  <Text 
                    color={Design.colors.text.white} 
                    fontSize={Design.typography.sizes.lg} 
                    fontWeight={Design.typography.weights.bold}
                  >
                    {phase === 'waiting' ? 'Start' : 'Reset'}
                  </Text>
                </XStack>
              </LinearGradient>
            </Pressable>
          </Animated.View>

          {/* Reaction Time Display */}
          {reactionTimes.length > 0 && phase === 'winner' && (
            <YStack
              position="absolute"
              bottom={160}
              alignSelf="center"
              backgroundColor="rgba(76, 175, 80, 0.9)"
              borderRadius={Design.borderRadius.lg}
              paddingVertical={Design.spacing.sm}
              paddingHorizontal={Design.spacing.md}
              {...Design.shadows.sm}
              zIndex={10}
            >
              <Text 
                color={Design.colors.text.white} 
                fontSize={Design.typography.sizes.sm} 
                fontWeight={Design.typography.weights.semibold}
                textAlign="center"
              >
                Fastest: {Math.min(...reactionTimes)}ms
              </Text>
            </YStack>
          )}
        </Animated.View>
      </ScrollView>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

