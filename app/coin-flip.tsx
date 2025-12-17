import { Text } from '@tamagui/core';
import { Image } from '@tamagui/image';
import { XStack, YStack } from '@tamagui/stacks';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { AccessibilityInfo, Animated, Easing, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import ConfettiCannon from 'react-native-confetti-cannon';
import { Design } from '../constants/Design';
import { useAnalytics } from '../hooks/useAnalytics';

type CoinSide = 'heads' | 'tails' | null;

export default function CoinFlipScreen() {
  const navigation = useNavigation();
  const { capture } = useAnalytics();
  const [result, setResult] = useState<CoinSide>(null);
  const [isFlipping, setIsFlipping] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [flipCount, setFlipCount] = useState(0);
  
  // Animation values
  const flipAnim = useRef(new Animated.Value(0)).current;
  const scaleX = useRef(new Animated.Value(1)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const bounceAnim = useRef(new Animated.Value(0)).current;
  const headsOpacity = useRef(new Animated.Value(1)).current;
  const tailsOpacity = useRef(new Animated.Value(0)).current;
  const headerFadeAnim = useRef(new Animated.Value(0)).current;
  const headerSlideAnim = useRef(new Animated.Value(20)).current;
  const buttonFadeAnim = useRef(new Animated.Value(0)).current;
  const buttonSlideAnim = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    navigation.setOptions({
      headerTitle: 'Coin Flip',
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
    capture('entered_coin_flip');
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

  const flipCoin = () => {
    if (isFlipping) return;
    
    // Haptic feedback
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    
    setIsFlipping(true);
    setShowConfetti(false);
    setResult(null);
    
    // Random result
    const newResult: CoinSide = Math.random() < 0.5 ? 'heads' : 'tails';
    
    // Reset animations
    flipAnim.setValue(0);
    scaleX.setValue(1);
    scaleAnim.setValue(1);
    bounceAnim.setValue(0);
    headsOpacity.setValue(newResult === 'heads' ? 1 : 0);
    tailsOpacity.setValue(newResult === 'tails' ? 1 : 0);
    
    // Flip animation - multiple flips using scaleX to simulate flip
    const numFlips = 8 + Math.floor(Math.random() * 4); // 8-11 flips
    
    // Scale bounce at start
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 1.2,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();
    
    // Create flip animation using scaleX to simulate 3D flip
    const flipSequence = Animated.sequence([
      ...Array(numFlips).fill(null).map((_, i) => 
        Animated.parallel([
          // Scale X to 0 (edge-on view) then back to 1
          Animated.sequence([
            Animated.timing(scaleX, {
              toValue: 0,
              duration: 2000 / (numFlips * 2),
              easing: Easing.inOut(Easing.ease),
              useNativeDriver: true,
            }),
            Animated.timing(scaleX, {
              toValue: 1,
              duration: 2000 / (numFlips * 2),
              easing: Easing.inOut(Easing.ease),
              useNativeDriver: true,
            }),
          ]),
          // Switch opacity at the midpoint (when scaleX is 0)
          Animated.sequence([
            Animated.delay(2000 / (numFlips * 2)),
            Animated.parallel([
              Animated.timing(headsOpacity, {
                toValue: i % 2 === 0 ? 0 : 1,
                duration: 50,
                useNativeDriver: true,
              }),
              Animated.timing(tailsOpacity, {
                toValue: i % 2 === 0 ? 1 : 0,
                duration: 50,
                useNativeDriver: true,
              }),
            ]),
          ]),
        ])
      ),
      // Final state
      Animated.parallel([
        Animated.timing(headsOpacity, {
          toValue: newResult === 'heads' ? 1 : 0,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(tailsOpacity, {
          toValue: newResult === 'tails' ? 1 : 0,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(scaleX, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]),
    ]);

    // Main flip animation
    Animated.parallel([
      Animated.timing(flipAnim, {
        toValue: 1,
        duration: 2000,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }),
      flipSequence,
    ]).start(() => {
      setResult(newResult);
      setIsFlipping(false);
      setShowConfetti(true);
      setFlipCount(prev => prev + 1);
      
      // Haptic feedback on completion
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      
      // Screen reader announcement
      AccessibilityInfo.announceForAccessibility(`Coin flip result: ${newResult}`);
      
      // Victory bounce
      Animated.sequence([
        Animated.timing(bounceAnim, {
          toValue: 1,
          duration: 300,
          easing: Easing.bounce,
          useNativeDriver: true,
        }),
        Animated.timing(bounceAnim, {
          toValue: 0,
          duration: 300,
          easing: Easing.bounce,
          useNativeDriver: true,
        }),
      ]).start();
      
      // Hide confetti after 3 seconds
      setTimeout(() => setShowConfetti(false), 3000);
      
      capture('coin_flipped', {
        result: newResult,
        flipCount: flipCount + 1,
      });
    });
  };

  // No interpolation needed - using scaleX directly

  const bounce = bounceAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -15],
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
          flexGrow: 1,
          alignItems: 'center',
          justifyContent: 'center',
          padding: Design.spacing.lg,
          paddingBottom: Design.spacing.xxl,
        }}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <Animated.View
          style={{
            opacity: headerFadeAnim,
            transform: [{ translateY: headerSlideAnim }],
            alignItems: 'center',
            marginBottom: Design.spacing.xl,
          }}
        >
          <YStack alignItems="center">
            <Image
              source={require('../icons/coin-flip.png')}
              width={88}
              height={88}
              objectFit="contain"
              resizeMode="contain"
              marginBottom={Design.spacing.md}
              accessibilityLabel="Coin flip icon"
            />
            <Text 
              fontSize={Design.typography.sizes.xl} 
              fontWeight={Design.typography.weights.bold} 
              color={Design.colors.text.primary} 
              textAlign="center" 
              marginBottom={Design.spacing.sm}
              letterSpacing={Design.typography.letterSpacing.tight}
              accessibilityRole="header"
            >
              Flip to decide
            </Text>
          </YStack>
        </Animated.View>

        {/* Coin Display */}
        <Animated.View
          style={{
            transform: [
              { scale: scaleAnim },
              { scaleX: scaleX },
              { translateY: bounce },
            ],
            width: 200,
            height: 200,
            marginBottom: Design.spacing.xl,
          }}
        >
          <View style={styles.coinContainer}>
            {/* Heads Side */}
            <Animated.View
              style={[
                styles.coinSide,
                styles.coinHeads,
                {
                  opacity: headsOpacity,
                },
              ]}
            >
              <LinearGradient
                colors={['#FFD700', '#FFA500', '#FF8C00']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={StyleSheet.absoluteFillObject}
              />
              <View style={styles.coinInner}>
                <Text fontSize={80}>👑</Text>
                <Text 
                  fontSize={Design.typography.sizes.lg} 
                  fontWeight={Design.typography.weights.bold}
                  color={Design.colors.text.primary}
                  marginTop={Design.spacing.xs}
                >
                  HEADS
                </Text>
              </View>
            </Animated.View>

            {/* Tails Side */}
            <Animated.View
              style={[
                styles.coinSide,
                styles.coinTails,
                {
                  opacity: tailsOpacity,
                },
              ]}
            >
              <LinearGradient
                colors={['#C0C0C0', '#A0A0A0', '#808080']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={StyleSheet.absoluteFillObject}
              />
              <View style={styles.coinInner}>
                <Text fontSize={80}>🦅</Text>
                <Text 
                  fontSize={Design.typography.sizes.lg} 
                  fontWeight={Design.typography.weights.bold}
                  color={Design.colors.text.white}
                  marginTop={Design.spacing.xs}
                >
                  TAILS
                </Text>
              </View>
            </Animated.View>
          </View>
        </Animated.View>

        {/* Result Display */}
        {result && !isFlipping && (
          <Animated.View
            style={{
              opacity: 1,
              marginBottom: Design.spacing.lg,
            }}
          >
            <YStack
              backgroundColor="rgba(255,255,255,0.95)"
              borderRadius={Design.borderRadius.lg}
              padding={Design.spacing.md}
              alignItems="center"
              {...Design.shadows.md}
            >
              <Text 
                fontSize={Design.typography.sizes.xl} 
                fontWeight={Design.typography.weights.bold} 
                color={Design.colors.text.primary}
                textTransform="uppercase"
              >
                {result === 'heads' ? '👑 Heads!' : '🦅 Tails!'}
              </Text>
            </YStack>
          </Animated.View>
        )}

        {/* Flip Button */}
        <Animated.View
          style={{
            opacity: buttonFadeAnim,
            transform: [{ translateY: buttonSlideAnim }],
            width: '100%',
            maxWidth: 360,
          }}
        >
          <Pressable
            onPress={flipCoin}
            disabled={isFlipping}
            accessibilityRole="button"
            accessibilityLabel={isFlipping ? 'Coin is flipping' : 'Flip the coin'}
            accessibilityHint="Flips the coin to randomly select heads or tails"
            accessibilityState={{ disabled: isFlipping }}
            style={({ pressed }) => [
              {
                borderRadius: Design.borderRadius.lg,
                overflow: 'hidden',
                backgroundColor: '#FFFFFF',
                ...Design.shadows.lg,
                transform: [{ scale: pressed ? Design.pressScale.md : 1 }],
                opacity: isFlipping ? 0.8 : 1,
              },
            ]}
          >
            <LinearGradient
              colors={isFlipping 
                ? ['#F57C00', '#E65100', '#D84315'] 
                : [Design.colors.primary, Design.colors.primaryDark, '#3d8b40']}
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
                <Text fontSize={Design.typography.sizes.xl}>
                  {isFlipping ? '🪙' : '🔄'}
                </Text>
                <Text 
                  fontSize={Design.typography.sizes.lg + 2} 
                  color={Design.colors.text.white} 
                  fontWeight={Design.typography.weights.bold}
                  letterSpacing={Design.typography.letterSpacing.wide}
                >
                  {isFlipping ? 'Flipping...' : 'Flip Coin'}
                </Text>
              </XStack>
            </LinearGradient>
          </Pressable>
        </Animated.View>

        {/* Flip Count */}
        {flipCount > 0 && (
          <Text 
            fontSize={Design.typography.sizes.sm} 
            color={Design.colors.text.secondary} 
            textAlign="center"
            marginTop={Design.spacing.md}
          >
            Flips: {flipCount}
          </Text>
        )}
      </ScrollView>

      {/* Confetti */}
      {showConfetti && (
        <ConfettiCannon
          count={60}
          origin={{ x: 200, y: 300 }}
          fadeOut={true}
          explosionSpeed={350}
          fallSpeed={3000}
          colors={['#FFD700', Design.colors.primary, '#FF6B6B', '#4ECDC4', '#45B7D1']}
        />
      )}
    </YStack>
  );
}

const styles = StyleSheet.create({
  coinContainer: {
    width: 200,
    height: 200,
    position: 'relative',
    borderRadius: 100,
    overflow: 'hidden',
  },
  coinSide: {
    position: 'absolute',
    width: 200,
    height: 200,
    borderRadius: 100,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    ...Design.shadows.xl,
  },
  coinHeads: {
    backgroundColor: '#FFD700',
  },
  coinTails: {
    backgroundColor: '#C0C0C0',
  },
  coinInner: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});

