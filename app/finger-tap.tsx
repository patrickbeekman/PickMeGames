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
} from 'react-native';
import ConfettiCannon from 'react-native-confetti-cannon';
import { Ripple } from '../components/Ripple';
import { Design } from '../constants/Design';
import { useAnalytics } from '../hooks/useAnalytics';

// TypeScript interfaces for touch events
interface TouchData {
  identifier: number;
  locationX: number;
  locationY: number;
}

interface TouchEventData {
  nativeEvent: {
    touches: NativeTouchEvent[];
  };
}

const COUNTDOWN_SECONDS = 4;
const PARTICLE_COUNT = 24;
const { width, height } = Dimensions.get('window');

export default function FingerTapScreen() {
  const navigation = useNavigation();
  const { capture } = useAnalytics();
  const [touches, setTouches] = useState<{ identifier: number; x: number; y: number }[]>([]);
  const [winner, setWinner] = useState<{ x: number; y: number } | null>(null);
  const [particles, setParticles] = useState<Animated.ValueXY[]>([]);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [phase, setPhase] = useState<'waiting' | 'countdown' | 'flickering' | 'winner'>('waiting');

  const backgroundColor = useRef(new Animated.Value(0)).current;
  const headerFadeAnim = useRef(new Animated.Value(0)).current;
  const headerSlideAnim = useRef(new Animated.Value(20)).current;
  const buttonFadeAnim = useRef(new Animated.Value(0)).current;
  const buttonSlideAnim = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    navigation.setOptions({
      headerTitle: 'Multifinger Tap',
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
    capture('entered_finger_tap');
  }, [capture]);

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

  useEffect(() => {
    if (countdown !== null && countdown > 0) {
      const timer = setTimeout(() => {
        setCountdown((prev) => (prev !== null ? prev - 1 : null));
      }, 1000);
      return () => clearTimeout(timer);
    } else if (countdown === 0) {
      setCountdown(null);
      setPhase('flickering');
      chooseWinner()
    }
  }, [countdown]);

  useEffect(() => {
    let toValue = 0;
    switch (phase) {
      case 'waiting':
        toValue = 0;
        break;
      case 'countdown':
        toValue = 1;
        break;
      case 'flickering':
        toValue = 2;
        break;
      case 'winner':
        toValue = 3;
        break;
    }
  
    const animation = Animated.timing(backgroundColor, {
      toValue,
      duration: 750,
      easing: Easing.inOut(Easing.ease),
      useNativeDriver: false,
    });
    
    animation.start();
    
    return () => {
      animation.stop();
    };
  }, [phase]);

  const onTouchStart = (e: GestureResponderEvent) => {
    if (phase === 'winner' || phase === 'flickering') return;

    const newTouches = e.nativeEvent.touches.map((t: NativeTouchEvent) => ({
      identifier: Number(t.identifier),
      x: t.locationX,
      y: t.locationY,
    }));
    setTouches(newTouches);

    if (phase === 'waiting' && newTouches.length > 0) {
      // Haptic feedback when game starts
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      setPhase('countdown');
      setCountdown(COUNTDOWN_SECONDS);
    }
  };

  const onTouchMove = (e: GestureResponderEvent) => {
    if (phase === 'winner' || phase === 'flickering') return;

    // Update touch positions when fingers move
    const updatedTouches = e.nativeEvent.touches.map((t: NativeTouchEvent) => ({
      identifier: Number(t.identifier),
      x: t.locationX,
      y: t.locationY,
    }));
    setTouches(updatedTouches);
  };

  const onTouchEnd = (e: GestureResponderEvent) => {
    const remainingTouches = e.nativeEvent.touches.map((t: NativeTouchEvent) => ({
      identifier: Number(t.identifier),
      x: t.locationX,
      y: t.locationY,
    }));
  
    setTouches(remainingTouches);
  
    if (phase === 'countdown' && remainingTouches.length === 0) {
      reset();
    }
  };

  const chooseWinner = () => {
    if (touches.length < 1) {
      setPhase('waiting');
      return;
    }
    const chosen = touches[Math.floor(Math.random() * touches.length)];
    setWinner({ x: chosen.x, y: chosen.y });
    triggerParticles(chosen.x, chosen.y);
    setPhase('winner');
    
    // Haptic feedback on winner selection
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    
    // Screen reader announcement
    AccessibilityInfo.announceForAccessibility(`Winner selected! ${touches.length} player${touches.length !== 1 ? 's' : ''} participated.`);
    
    capture('finger_tap_winner_picked', {
      winner_x: chosen.x,
      winner_y: chosen.y,
      total_touches: touches.length,
    });
  };

  const triggerParticles = (x: number, y: number) => {
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

  // Cleanup particles and animations on unmount
  useEffect(() => {
    return () => {
      // Stop all particle animations
      if (particles.length > 0) {
        particles.forEach((particle) => {
          particle.stopAnimation();
        });
      }
      // Stop background color animation
      backgroundColor.stopAnimation();
    };
  }, [particles]);

  const reset = () => {
    setTouches([]);
    setWinner(null);
    setParticles([]);
    setCountdown(null);
    setPhase('waiting');
  };

  const bgColor = backgroundColor.interpolate({
    inputRange: [0, 1, 2, 3],
    outputRange: ['#F3E889', '#FBF272', '#E0FF4F', '#C4EF5F'],
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
          onTouchMove={onTouchMove}
          onTouchEnd={onTouchEnd}
          accessibilityRole="none"
          accessibilityLabel={phase === 'waiting' ? 'Touch screen to start game' : phase === 'countdown' ? `Countdown: ${countdown} seconds` : phase === 'winner' ? 'Winner selected' : 'Game in progress'}
        >

        {/* Enhanced Instructions for waiting phase */}
        {phase === 'waiting' && (
          <Animated.View
            style={{
              position: 'absolute',
              top: height * 0.25,
              left: Design.spacing.md,
              right: Design.spacing.md,
              opacity: headerFadeAnim,
              transform: [{ translateY: headerSlideAnim }],
              zIndex: 10,
            }}
          >
            <YStack alignItems="center">
              <Text fontSize={Design.typography.sizes.xxxl} marginBottom={Design.spacing.md}>✨👆✨</Text>
              <Text 
                fontSize={Design.typography.sizes.xl} 
                fontWeight={Design.typography.weights.bold} 
                color={Design.colors.text.primary} 
                textAlign="center" 
                marginBottom={Design.spacing.sm}
                letterSpacing={Design.typography.letterSpacing.tight}
                accessibilityRole="header"
              >
                Multifinger Challenge!
              </Text>
              <YStack
                backgroundColor="rgba(255, 255, 255, 0.95)"
                borderRadius={Design.borderRadius.lg}
                padding={Design.spacing.lg}
                alignItems="center"
                {...Design.shadows.md}
              >
                <Text
                  fontSize={Design.typography.sizes.md}
                  fontWeight={Design.typography.weights.semibold}
                  color={Design.colors.text.primary}
                  textAlign="center"
                  lineHeight={Design.typography.sizes.md * 1.4}
                  marginBottom={Design.spacing.sm}
                >
                  Every player touch and hold one finger to the screen. 
                  You can move your finger around!
                </Text>
                <Text
                  fontSize={Design.typography.sizes.sm}
                  fontWeight={Design.typography.weights.regular}
                  color={Design.colors.text.secondary}
                  textAlign="center"
                  lineHeight={Design.typography.sizes.sm * 1.4}
                  fontStyle="italic"
                >
                  Note: iPhone has a limit of 5 simultaneous touches
                </Text>
              </YStack>
            </YStack>
          </Animated.View>
        )}

        {/* Enhanced Ripples */}
        {touches.map((touch) => (
          <Ripple
            key={touch.identifier}
            x={touch.x}
            y={touch.y}
            speed={
              phase === 'countdown' && countdown !== null
                ? Math.max(1000, countdown * 150)
                : 1500
            }
          />
        ))}

        {/* Enhanced Countdown */}
        {countdown !== null && (
          <YStack
            position="absolute"
            top={height * 0.15}
            left={width / 2 - 80}
            width={160}
            height={160}
            borderRadius={80}
            justifyContent="center"
            alignItems="center"
            shadowColor="#000"
            shadowOpacity={0.2}
            shadowOffset={{ width: 0, height: 8 }}
            shadowRadius={12}
            zIndex={5}
          >
            <LinearGradient
              colors={[Design.colors.primary, Design.colors.primaryLight, '#81C784']}
              style={{
                width: 160,
                height: 160,
                borderRadius: 80,
                position: 'absolute',
              }}
            />
            <Text 
              fontSize={Design.typography.sizes.xxxl + 8} 
              fontWeight={Design.typography.weights.bold} 
              color={Design.colors.text.white}
            >
              {countdown}
            </Text>
            <Text 
              fontSize={Design.typography.sizes.sm} 
              color={Design.colors.text.white} 
              fontWeight={Design.typography.weights.semibold} 
              marginTop={Design.spacing.xs}
            >
              GET READY!
            </Text>
          </YStack>
        )}

        {/* Enhanced Winner Display */}
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

        {/* Enhanced Particles */}
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

        {/* Enhanced Confetti */}
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

        {/* Enhanced Reset Button */}
        <Animated.View
          style={{
            position: 'absolute',
            bottom: 80,
            alignSelf: 'center',
            opacity: buttonFadeAnim,
            transform: [{ translateY: buttonSlideAnim }],
          }}
        >
          <Pressable
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
              reset();
            }}
            onTouchStart={(e) => e.stopPropagation()}
            onTouchMove={(e) => e.stopPropagation()}
            onTouchEnd={(e) => e.stopPropagation()}
            accessibilityRole="button"
            accessibilityLabel="Reset game"
            accessibilityHint="Resets the game to start a new round"
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
              colors={['#FF5722', '#E64A19', '#D84315']}
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
                <Text fontSize={Design.typography.sizes.lg}>🔄</Text>
                <Text 
                  color={Design.colors.text.white} 
                  fontSize={Design.typography.sizes.lg} 
                  fontWeight={Design.typography.weights.bold}
                >
                  Reset Game
                </Text>
              </XStack>
            </LinearGradient>
          </Pressable>
        </Animated.View>

        {/* Players indicator */}
        {phase === 'countdown' && touches.length > 0 && (
          <YStack
            position="absolute"
            bottom={160}
            alignSelf="center"
            backgroundColor="rgba(76, 175, 80, 0.9)"
            borderRadius={Design.borderRadius.lg}
            paddingVertical={Design.spacing.sm}
            paddingHorizontal={Design.spacing.md}
            {...Design.shadows.sm}
          >
            <Text 
              color={Design.colors.text.white} 
              fontSize={Design.typography.sizes.sm} 
              fontWeight={Design.typography.weights.semibold}
            >
              👥 {touches.length} Player{touches.length !== 1 ? 's' : ''} Ready!
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
