import { Text, View } from '@tamagui/core';
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
  Pressable,
  ScrollView,
  StyleSheet,
} from 'react-native';
import ConfettiCannon from 'react-native-confetti-cannon';
import { Design } from '../constants/Design';
import { useAnalytics } from '../hooks/useAnalytics';
import { useAppRating } from '../hooks/useAppRating';

const { width, height } = Dimensions.get('window');
const SPINNER_SIZE = width * 0.8;
const SPINS_PER_TURN = 4; // Number of full spins before stopping
const ARROW_LENGTH = SPINNER_SIZE / 2 - 10;
const SPINNER_CENTER_X = width / 2;
const SPINNER_CENTER_Y = height / 2;

const TwisterSpinner = () => {
  const navigation = useNavigation();
  const { capture } = useAnalytics();
  const { trackGameCompletion } = useAppRating();
  const rotation = useRef(new Animated.Value(0)).current;
  const [spinning, setSpinning] = useState(false);
  const [baseRotation, setBaseRotation] = useState(0);
  const [showConfetti, setShowConfetti] = useState(false);
  const isMounted = useRef(true);
  const animationRef = useRef<Animated.CompositeAnimation | null>(null);
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const glowAnim = useRef(new Animated.Value(0)).current;
  const headerFadeAnim = useRef(new Animated.Value(0)).current;
  const headerSlideAnim = useRef(new Animated.Value(20)).current;
  const successBounceAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    navigation.setOptions({
      headerTitle: 'Spinner',
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
    capture('entered_spinner');
  }, [capture]);

  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
      // Stop any running animation on unmount
      if (animationRef.current) {
        animationRef.current.stop();
      }
    };
  }, []);

  // Header entrance animation
  useEffect(() => {
    Animated.parallel([
      Animated.timing(headerFadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.timing(headerSlideAnim, {
        toValue: 0,
        duration: 500,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const spin = () => {
    if (spinning) return;
    
    // Haptic feedback on press
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    
    setShowConfetti(false);
  
    const randomOffset = Math.random() * 360;
    const fullSpins = SPINS_PER_TURN * 360;
    const targetRotation = baseRotation + fullSpins + randomOffset;
  
    setSpinning(true);

    // Button scale animation
    Animated.timing(scaleAnim, {
      toValue: 0.9,
      duration: 100,
      useNativeDriver: true,
    }).start();

    // Pulse animation during spin
    const pulseAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.06,
          duration: 180,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 180,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    );

    // Glow animation during spin
    const glowAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(glowAnim, {
          toValue: 1,
          duration: 600,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(glowAnim, {
          toValue: 0.3,
          duration: 600,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    );

    pulseAnimation.start();
    glowAnimation.start();
  
    // Save animation ref so we can stop it on unmount
    animationRef.current = Animated.timing(rotation, {
      toValue: targetRotation,
      duration: 3500,
      easing: Easing.out(Easing.quad),
      useNativeDriver: true,
    });

    animationRef.current.start(() => {
      if (isMounted.current) {
        setSpinning(false);
        
        // Track game completion for rating prompt
        trackGameCompletion();
        
        setBaseRotation(targetRotation);
        setShowConfetti(true);

        // Haptic feedback on completion
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

        // Screen reader announcement
        AccessibilityInfo.announceForAccessibility('Spinner has stopped. Check the arrow position to see who goes first.');

        // Stop animations
        pulseAnimation.stop();
        glowAnimation.stop();

        // Success bounce animation
        Animated.sequence([
          Animated.timing(successBounceAnim, {
            toValue: 1.15,
            duration: 200,
            easing: Easing.out(Easing.quad),
            useNativeDriver: true,
          }),
          Animated.timing(successBounceAnim, {
            toValue: 1,
            duration: 300,
            easing: Easing.out(Easing.back(1.5)),
            useNativeDriver: true,
          }),
        ]).start();

        // Reset animations
        Animated.parallel([
          Animated.timing(scaleAnim, {
            toValue: 1,
            duration: 200,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 200,
            useNativeDriver: true,
          }),
          Animated.timing(glowAnim, {
            toValue: 0,
            duration: 200,
            useNativeDriver: true,
          }),
        ]).start();

        // Hide confetti after 3 seconds
        setTimeout(() => setShowConfetti(false), 3000);
      }
    });

    // capture the spin event
    capture('spun_empty_spinner', {
      finalAngle: randomOffset,
      totalRotation: targetRotation,
    });
  };
  
  const rotate = rotation.interpolate({
    inputRange: [0, 360],
    outputRange: ['0deg', '360deg'],
    extrapolate: 'extend',
  });


  return (
    <YStack flex={1} backgroundColor={Design.colors.background.light}>
      <LinearGradient
        colors={[Design.colors.background.light, Design.colors.background.medium, Design.colors.background.lightest]}
        locations={[0, 0.5, 1]}
        style={StyleSheet.absoluteFillObject}
      />

      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: Design.spacing.lg,
          paddingTop: Design.spacing.lg,
          paddingBottom: Design.spacing.xxl + 20,
          alignItems: 'center',
          minHeight: height,
          justifyContent: 'center',
        }}
        showsVerticalScrollIndicator={false}
      >
        {/* Header Section with Animation */}
        <Animated.View
          style={{
            opacity: headerFadeAnim,
            transform: [{ translateY: headerSlideAnim }],
            width: '100%',
            alignItems: 'center',
            marginBottom: Design.spacing.xl,
          }}
        >
          <YStack alignItems="center">
            <Text 
              fontSize={Design.typography.sizes.xxl + 4} 
              marginBottom={Design.spacing.sm}
            >
              🎯
            </Text>
            <Text 
              fontSize={Design.typography.sizes.xl} 
              fontWeight={Design.typography.weights.bold} 
              color={Design.colors.text.primary} 
              textAlign="center"
              marginBottom={Design.spacing.xs}
              letterSpacing={Design.typography.letterSpacing.tight}
              accessibilityRole="header"
            >
              Classic Spinner!
            </Text>
            <Text 
              fontSize={Design.typography.sizes.sm} 
              color={Design.colors.text.secondary} 
              textAlign="center" 
              maxWidth={320}
              lineHeight={Design.typography.sizes.sm * 1.4}
              accessibilityRole="text"
            >
              Place your phone in the center of your group so everyone is equidistant from the spinner!
            </Text>
          </YStack>
        </Animated.View>

        {/* Spinner Container with Animations */}
        <View 
          accessibilityRole="none"
          accessibilityLabel={spinning ? 'Spinner is rotating' : 'Spinner ready to spin'}
          style={{ 
            width: SPINNER_SIZE + 20, 
            height: SPINNER_SIZE + 20, 
            marginBottom: Design.spacing.xl,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Animated.View
            style={{
              transform: [
                { scale: Animated.multiply(pulseAnim, successBounceAnim) },
              ],
              opacity: glowAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [1, 0.85],
              }),
              width: SPINNER_SIZE,
              height: SPINNER_SIZE,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <View style={styles.circleContainer}>
              {/* Outer glow ring */}
              <Animated.View 
                style={[
                  styles.outerGlow,
                  {
                    opacity: glowAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0.2, 0.4],
                    }),
                  },
                ]} 
              />
              
              {/* Main gradient circle */}
              <LinearGradient
                colors={['#FFE082', '#FFD54F', '#FFC107', '#FFB300']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.gradientCircle}
              />
              
              {/* Inner circle with enhanced styling */}
              <View style={styles.innerCircle}>
                <LinearGradient
                  colors={['rgba(255,255,255,0.98)', 'rgba(255,248,225,0.95)', 'rgba(255,255,255,0.98)']}
                  start={{ x: 0.5, y: 0 }}
                  end={{ x: 0.5, y: 1 }}
                  style={StyleSheet.absoluteFillObject}
                />
              </View>
              
              {/* Decorative rings */}
              <View style={styles.decorativeRing1} />
              <View style={styles.decorativeRing2} />
              
              {/* Center dot with enhanced styling */}
              <View style={styles.centerDot}>
                <View style={styles.centerDotInner} />
              </View>
            </View>

            {/* Rotating arrow with enhanced styling */}
            <Animated.View style={[styles.arrowContainer, { transform: [{ rotate }] }]}>
              <View style={styles.arrowShadow} />
              <View style={styles.arrow} />
            </Animated.View>
          </Animated.View>
        </View>

        {/* Modern Gradient Spin Button */}
        <Animated.View 
          style={{ 
            transform: [{ scale: scaleAnim }],
            width: '100%',
            maxWidth: 360,
            marginBottom: Design.spacing.md,
          }}
        >
          <Pressable
            onPress={spin}
            disabled={spinning}
            accessibilityRole="button"
            accessibilityLabel={spinning ? 'Spinner is spinning' : 'Spin the spinner'}
            accessibilityHint="Spins the spinner to randomly select who goes first"
            accessibilityState={{ disabled: spinning }}
            style={({ pressed }) => [
              {
                borderRadius: Design.borderRadius.lg,
                overflow: 'hidden',
                backgroundColor: '#FFFFFF',
                ...Design.shadows.lg,
                transform: [{ scale: pressed ? Design.pressScale.md : 1 }],
                opacity: spinning ? 0.8 : 1,
              },
            ]}
          >
            <LinearGradient
              colors={spinning ? ['#F57C00', '#E65100', '#D84315'] : [Design.colors.primary, Design.colors.primaryDark, '#388E3C']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={{
                paddingVertical: Design.spacing.md + 4,
                paddingHorizontal: Design.spacing.xl + 8,
                borderRadius: Design.borderRadius.lg,
                alignItems: 'center',
                justifyContent: 'center',
                minHeight: 56,
              }}
            >
              <XStack alignItems="center" gap={Design.spacing.md}>
                <Animated.View
                  style={{
                    transform: spinning ? [{
                      rotate: rotation.interpolate({
                        inputRange: [0, 360],
                        outputRange: ['0deg', '360deg'],
                      }),
                    }] : [],
                  }}
                >
                  <Text fontSize={Design.typography.sizes.xl}>
                    {spinning ? '🌀' : '🎯'}
                  </Text>
                </Animated.View>
                <Text 
                  fontSize={Design.typography.sizes.lg + 2} 
                  color={Design.colors.text.white} 
                  fontWeight={Design.typography.weights.bold}
                  letterSpacing={Design.typography.letterSpacing.wide}
                >
                  {spinning ? 'Spinning...' : 'SPIN!'}
                </Text>
              </XStack>
            </LinearGradient>
          </Pressable>
        </Animated.View>
      </ScrollView>

      {/* Confetti celebration */}
      {showConfetti && (
        <ConfettiCannon
          count={60}
          origin={{ x: width / 2, y: height / 2 }}
          fadeOut={true}
          explosionSpeed={300}
          fallSpeed={2500}
          colors={['#4CAF50', '#FFD700', '#FF6B6B', '#4ECDC4', '#9B59B6']}
        />
      )}
    </YStack>
  );
};

const styles = StyleSheet.create({
  circleContainer: {
    width: SPINNER_SIZE,
    height: SPINNER_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    ...Design.shadows.xl,
  },
  outerGlow: {
    width: SPINNER_SIZE + 12,
    height: SPINNER_SIZE + 12,
    borderRadius: (SPINNER_SIZE + 12) / 2,
    backgroundColor: 'rgba(255, 193, 7, 0.25)',
    position: 'absolute',
    top: -6,
    left: -6,
  },
  gradientCircle: {
    width: SPINNER_SIZE,
    height: SPINNER_SIZE,
    borderRadius: SPINNER_SIZE / 2,
    position: 'absolute',
    borderWidth: 3,
    borderColor: 'rgba(255, 255, 255, 0.4)',
    shadowColor: '#FFB300',
    shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 12,
    elevation: 8,
  },
  innerCircle: {
    width: SPINNER_SIZE - 24,
    height: SPINNER_SIZE - 24,
    borderRadius: (SPINNER_SIZE - 24) / 2,
    borderWidth: 4,
    borderColor: '#FFB300',
    position: 'absolute',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 8,
    elevation: 4,
  },
  decorativeRing1: {
    width: SPINNER_SIZE - 40,
    height: SPINNER_SIZE - 40,
    borderRadius: (SPINNER_SIZE - 40) / 2,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 179, 0, 0.4)',
    position: 'absolute',
    shadowColor: '#FFB300',
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 4,
  },
  decorativeRing2: {
    width: SPINNER_SIZE - 60,
    height: SPINNER_SIZE - 60,
    borderRadius: (SPINNER_SIZE - 60) / 2,
    borderWidth: 1,
    borderColor: 'rgba(255, 193, 7, 0.25)',
    position: 'absolute',
  },
  centerDot: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: Design.colors.primary,
    borderWidth: 4,
    borderColor: 'white',
    shadowColor: '#000',
    shadowOpacity: 0.5,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 8,
    elevation: 8,
    zIndex: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  centerDotInner: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
  },
  arrowContainer: {
    position: 'absolute',
    width: SPINNER_SIZE,
    height: SPINNER_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
    top: 0,
    left: 0,
  },
  arrowShadow: {
    width: 0,
    height: 0,
    borderLeftWidth: 12,
    borderRightWidth: 12,
    borderBottomWidth: ARROW_LENGTH + 2,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderBottomColor: 'rgba(0,0,0,0.2)',
    position: 'absolute',
    top: SPINNER_SIZE / 2 - ARROW_LENGTH - 2,
    left: SPINNER_SIZE / 2 - 12,
  },
  arrow: {
    width: 0,
    height: 0,
    borderLeftWidth: 14,
    borderRightWidth: 14,
    borderBottomWidth: ARROW_LENGTH + 5,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderBottomColor: Design.colors.primary,
    position: 'absolute',
    top: SPINNER_SIZE / 2 - ARROW_LENGTH - 5,
    left: SPINNER_SIZE / 2 - 14,
    shadowColor: '#000',
    shadowOpacity: 0.5,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 8,
    elevation: 8,
  },
});

export default TwisterSpinner;
