import { Text } from '@tamagui/core';
import { Image } from '@tamagui/image';
import { XStack, YStack } from '@tamagui/stacks';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from 'expo-router';
import { useEffect, useMemo, useRef, useState } from 'react';
import { AccessibilityInfo, Animated, Dimensions, Easing, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import ConfettiCannon from 'react-native-confetti-cannon';
import Svg, { Circle, Defs, Path, Stop, LinearGradient as SvgLinearGradient } from 'react-native-svg';
import { Design } from '../constants/Design';
import { useAnalytics } from '../hooks/useAnalytics';

const { width } = Dimensions.get('window');
const COLOR_WHEEL_SIZE = Math.min(width - 48, 300);
const CENTER_X = COLOR_WHEEL_SIZE / 2;
const CENTER_Y = COLOR_WHEEL_SIZE / 2;
const RADIUS = COLOR_WHEEL_SIZE / 2 - 10;

// Helper function to convert HSL to RGB
const hslToRgb = (h: number, s: number, l: number): [number, number, number] => {
  s /= 100;
  l /= 100;
  const c = (1 - Math.abs(2 * l - 1)) * s;
  const x = c * (1 - Math.abs((h / 60) % 2 - 1));
  const m = l - c / 2;
  let r = 0, g = 0, b = 0;

  if (0 <= h && h < 60) {
    r = c; g = x; b = 0;
  } else if (60 <= h && h < 120) {
    r = x; g = c; b = 0;
  } else if (120 <= h && h < 180) {
    r = 0; g = c; b = x;
  } else if (180 <= h && h < 240) {
    r = 0; g = x; b = c;
  } else if (240 <= h && h < 300) {
    r = x; g = 0; b = c;
  } else if (300 <= h && h < 360) {
    r = c; g = 0; b = x;
  }
  r = Math.round((r + m) * 255);
  g = Math.round((g + m) * 255);
  b = Math.round((b + m) * 255);

  return [r, g, b];
};

// Helper function to convert RGB to hex
const rgbToHex = (r: number, g: number, b: number): string => {
  return '#' + [r, g, b].map(x => {
    const hex = x.toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  }).join('');
};

// Calculate color distance using Euclidean distance in RGB space
// Treating RGB values as 3D coordinates: d = sqrt((r2-r1)² + (g2-g1)² + (b2-b1)²)
// This gives us the straight-line distance between two colors in RGB color space
// Lower distance = closer match = better
const colorDistance = (r1: number, g1: number, b1: number, r2: number, g2: number, b2: number): number => {
  return Math.sqrt(
    Math.pow(r1 - r2, 2) + Math.pow(g1 - g2, 2) + Math.pow(b1 - b2, 2)
  );
};

// Parse hex color to RGB
const hexToRgb = (hex: string): [number, number, number] => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? [
        parseInt(result[1], 16),
        parseInt(result[2], 16),
        parseInt(result[3], 16),
      ]
    : [0, 0, 0];
};

// Convert cartesian to polar
const cartesianToPolar = (x: number, y: number): { angle: number; distance: number } => {
  const dx = x - CENTER_X;
  const dy = y - CENTER_Y;
  const angle = (Math.atan2(dy, dx) * 180 / Math.PI + 360) % 360;
  const distance = Math.sqrt(dx * dx + dy * dy);
  return { angle, distance };
};

type GamePhase = 'setup' | 'playing' | 'results';

interface PlayerGuess {
  playerIndex: number;
  color: string;
  distance: number;
  x: number;
  y: number;
}

export default function ColorMatcherScreen() {
  const navigation = useNavigation();
  const { capture } = useAnalytics();
  const [playerCount, setPlayerCount] = useState(2);
  const [phase, setPhase] = useState<GamePhase>('setup');
  const [targetColor, setTargetColor] = useState<string>('#FF0000');
  const [showTargetColor, setShowTargetColor] = useState(false);
  const [currentPlayer, setCurrentPlayer] = useState(0);
  const [guesses, setGuesses] = useState<PlayerGuess[]>([]);
  const [winner, setWinner] = useState<number | null>(null);
  const [showConfetti, setShowConfetti] = useState(false);
  const [currentPickColor, setCurrentPickColor] = useState<string | null>(null);

  const headerFadeAnim = useRef(new Animated.Value(0)).current;
  const headerSlideAnim = useRef(new Animated.Value(20)).current;
  const buttonFadeAnim = useRef(new Animated.Value(0)).current;
  const buttonSlideAnim = useRef(new Animated.Value(30)).current;
  const targetColorOpacity = useRef(new Animated.Value(0)).current;
  const targetColorTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    navigation.setOptions({
      headerTitle: 'Color Matcher',
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
    capture('entered_color_matcher');
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

  // Generate random target color and calculate position
  const [targetPosition, setTargetPosition] = useState<{ x: number; y: number } | null>(null);

  const generateTargetColor = (): string => {
    const hue = Math.floor(Math.random() * 360);
    const saturation = 70 + Math.floor(Math.random() * 30); // 70-100%
    const lightness = 40 + Math.floor(Math.random() * 30); // 40-70%
    const [r, g, b] = hslToRgb(hue, saturation, lightness);
    
    // Calculate position on wheel for the target color
    const normalizedDistance = saturation / 100; // 0.7-1.0
    const distance = normalizedDistance * RADIUS;
    const angleRad = (hue * Math.PI) / 180;
    const x = CENTER_X + distance * Math.cos(angleRad);
    const y = CENTER_Y + distance * Math.sin(angleRad);
    setTargetPosition({ x, y });
    
    return rgbToHex(r, g, b);
  };

  const flashTargetColor = (displayDuration: number = 2500) => {
    setShowTargetColor(true);
    Animated.timing(targetColorOpacity, {
      toValue: 1,
      duration: 100,
      useNativeDriver: true,
    }).start(() => {
      targetColorTimerRef.current = setTimeout(() => {
        Animated.timing(targetColorOpacity, {
          toValue: 0,
          duration: 100,
          useNativeDriver: true,
        }).start(() => {
          setShowTargetColor(false);
        });
      }, displayDuration);
    });
  };

  const startGame = () => {
    const newTargetColor = generateTargetColor();
    setTargetColor(newTargetColor);
    setPhase('playing');
    setCurrentPlayer(0);
    setGuesses([]);
    setWinner(null);
    setShowConfetti(false);
    setCurrentPickColor(null);
    
    // Flash target color for 0.5s
    setTimeout(() => {
      flashTargetColor();
    }, 300);

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  };

  const handleColorPick = (x: number, y: number) => {
    if (phase !== 'playing') return;

    // Coordinates are relative to the View, which should match SVG size
    const { angle, distance } = cartesianToPolar(x, y);
    
    // Normalize distance to 0-1 (0 = center, 1 = edge)
    const normalizedDistance = Math.min(distance / RADIUS, 1);
    
    // Calculate HSL to match what's displayed on the wheel
    // The wheel shows HSL(hue, 100%, 50%) at the edge with a white gradient overlay in center
    // So we use full saturation at edge, and account for the white overlay effect in center
    const hue = angle;
    // Saturation: full at edge, decreases toward center (matching white gradient overlay effect)
    const saturation = Math.min(normalizedDistance * 100, 100); // 0-100%
    // Lightness: medium at edge (50%), increases toward center due to white overlay
    // The white gradient makes center appear lighter, so we increase lightness as we go inward
    const lightness = 50 + (1 - normalizedDistance) * 30; // 50% at edge, up to 80% at center
    
    const [r, g, b] = hslToRgb(hue, saturation, lightness);
    const pickedColor = rgbToHex(r, g, b);
    
    // Show picked color in center immediately
    setCurrentPickColor(pickedColor);
    
    // Calculate distance from target color (lower = closer = better)
    const [tr, tg, tb] = hexToRgb(targetColor);
    const [pr, pg, pb] = hexToRgb(pickedColor);
    const colorDist = colorDistance(tr, tg, tb, pr, pg, pb);

    // Save guess with position - store the actual picked color
    const newGuess: PlayerGuess = {
      playerIndex: currentPlayer,
      color: pickedColor, // Store the actual color that was picked
      distance: colorDist,
      x,
      y,
    };

    setGuesses(prev => [...prev, newGuess]);

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    // Move to next player or show results
    if (currentPlayer < playerCount - 1) {
      setTimeout(() => {
        setCurrentPlayer(prev => prev + 1);
        setCurrentPickColor(null); // Clear pick for next player
      }, 500);
    } else {
      // All players have guessed, show results after 0.5s
      setTimeout(() => {
        showResults();
      }, 500);
    }
  };

  const showResults = () => {
    // Find winner (lowest distance = closest match = winner)
    // Sort by distance ascending (lowest first)
    const sortedGuesses = [...guesses].sort((a, b) => a.distance - b.distance);
    
    // Winner is the one with the LOWEST distance (closest match)
    const winnerIndex = sortedGuesses[0].playerIndex;
    setWinner(winnerIndex);
    setPhase('results');
    setShowConfetti(true);

    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    AccessibilityInfo.announceForAccessibility(`Player ${winnerIndex + 1} wins with the closest color match!`);

    capture('color_matcher_complete', {
      playerCount,
      winner: winnerIndex,
      closestDistance: sortedGuesses[0].distance,
    });
  };

  const reset = () => {
    if (targetColorTimerRef.current) clearTimeout(targetColorTimerRef.current);
    setPhase('setup');
    setCurrentPlayer(0);
    setGuesses([]);
    setWinner(null);
    setShowConfetti(false);
    setTargetColor('#FF0000');
    setShowTargetColor(false);
    setTargetPosition(null);
    setCurrentPickColor(null);
    targetColorOpacity.setValue(0);
  };

  // Generate circular color wheel segments with varying saturation and lightness
  const colorWheelSegments = useMemo(() => {
    const segments = [];
    const numSegments = 240; // Good balance between smoothness and performance
    const numRings = 15; // Good balance between color accuracy and performance
    
    // Create radial segments that vary in saturation and lightness
    for (let ring = 0; ring < numRings; ring++) {
      const normalizedDistance = ring / numRings; // 0 = center, 1 = edge
      const innerRadius = (ring / numRings) * RADIUS;
      const outerRadius = ((ring + 1) / numRings) * RADIUS;
      
      // Calculate saturation and lightness matching the picker calculation
      const saturation = Math.min(normalizedDistance * 100, 100); // 0-100%
      const lightness = 50 + (1 - normalizedDistance) * 30; // 50% at edge, up to 80% at center
      
      for (let i = 0; i < numSegments; i++) {
        const angle1 = (i * 360) / numSegments;
        const angle2 = ((i + 1) * 360) / numSegments;
        
        // Use the hue from angle, but saturation and lightness from distance
        const [r, g, b] = hslToRgb(angle1, saturation, lightness);
        const color = rgbToHex(r, g, b);
        
        // Calculate inner and outer points for this segment
        const x1Inner = CENTER_X + innerRadius * Math.cos((angle1 * Math.PI) / 180);
        const y1Inner = CENTER_Y + innerRadius * Math.sin((angle1 * Math.PI) / 180);
        const x2Inner = CENTER_X + innerRadius * Math.cos((angle2 * Math.PI) / 180);
        const y2Inner = CENTER_Y + innerRadius * Math.sin((angle2 * Math.PI) / 180);
        
        const x1Outer = CENTER_X + outerRadius * Math.cos((angle1 * Math.PI) / 180);
        const y1Outer = CENTER_Y + outerRadius * Math.sin((angle1 * Math.PI) / 180);
        const x2Outer = CENTER_X + outerRadius * Math.cos((angle2 * Math.PI) / 180);
        const y2Outer = CENTER_Y + outerRadius * Math.sin((angle2 * Math.PI) / 180);
        
        // Create a ring segment (trapezoid shape)
        const path = `M ${x1Inner} ${y1Inner} L ${x1Outer} ${y1Outer} A ${outerRadius} ${outerRadius} 0 0 1 ${x2Outer} ${y2Outer} L ${x2Inner} ${y2Inner} A ${innerRadius} ${innerRadius} 0 0 0 ${x1Inner} ${y1Inner} Z`;
        
        segments.push(
          <Path
            key={`ring-${ring}-seg-${i}`}
            d={path}
            fill={color}
          />
        );
      }
    }
    
    return segments;
  }, []);

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
          padding: Design.spacing.lg,
          paddingBottom: Design.spacing.xxl,
        }}
        showsVerticalScrollIndicator={false}
      >
        {/* Header - Only show when not in results */}
        {phase !== 'results' && (
          <Animated.View
            style={{
              opacity: headerFadeAnim,
              transform: [{ translateY: headerSlideAnim }],
              alignItems: 'center',
              marginBottom: Design.spacing.lg,
            }}
          >
            <YStack alignItems="center">
              <Image
                source={require('../icons/color-matcher.png')}
                width={88}
                height={88}
                objectFit="contain"
                resizeMode="contain"
                marginBottom={Design.spacing.md}
                accessibilityLabel="Color matcher icon"
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
                Match the target color
              </Text>
            </YStack>
          </Animated.View>
        )}

        {/* Target Color Display - Clickable to show again (only during playing phase) */}
        {phase === 'playing' && (
          <Pressable
            onPress={() => {
              if (!showTargetColor) {
                flashTargetColor(1000); // 2x longer when clicked (1000ms = 2 * 500ms)
              }
            }}
            style={{ marginBottom: Design.spacing.lg }}
          >
            <YStack alignItems="center">
              <Text 
                fontSize={Design.typography.sizes.md} 
                fontWeight={Design.typography.weights.semibold}
                color={Design.colors.text.primary}
                marginBottom={Design.spacing.xs}
              >
                Target Color {!showTargetColor && '(Tap to reveal)'}
              </Text>
              <Animated.View
                style={{
                  opacity: targetColorOpacity,
                }}
              >
                <View
                  style={{
                    width: 120,
                    height: 120,
                    borderRadius: 60,
                    backgroundColor: targetColor,
                    ...Design.shadows.lg,
                    borderWidth: 4,
                    borderColor: 'white',
                  }}
                />
              </Animated.View>
              {showTargetColor && (
                <Text 
                  fontSize={Design.typography.sizes.xs} 
                  color={Design.colors.text.secondary}
                  marginTop={Design.spacing.xs}
                >
                  {targetColor}
                </Text>
              )}
            </YStack>
          </Pressable>
        )}

        {/* Color Wheel Picker */}
        {phase === 'playing' && (
          <YStack alignItems="center" marginBottom={Design.spacing.lg}>
            <Text 
              fontSize={Design.typography.sizes.md} 
              fontWeight={Design.typography.weights.semibold}
              color={Design.colors.text.primary}
              marginBottom={Design.spacing.sm}
            >
              Your Pick
            </Text>
            <View
              onTouchStart={(e) => {
                const { locationX, locationY } = e.nativeEvent.touches[0];
                handleColorPick(locationX, locationY);
              }}
              style={{
                borderRadius: COLOR_WHEEL_SIZE / 2,
                overflow: 'hidden',
                ...Design.shadows.lg,
              }}
            >
              <Svg width={COLOR_WHEEL_SIZE} height={COLOR_WHEEL_SIZE}>
                <Defs>
                  <SvgLinearGradient id="centerGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <Stop offset="0%" stopColor="rgba(255,255,255,0.8)" />
                    <Stop offset="100%" stopColor="rgba(255,255,255,0)" />
                  </SvgLinearGradient>
                </Defs>
                {colorWheelSegments}
                {/* Center white gradient overlay for saturation effect - behind picked color */}
                {!currentPickColor && (
                  <Circle
                    cx={CENTER_X}
                    cy={CENTER_Y}
                    r={RADIUS * 0.3}
                    fill="url(#centerGradient)"
                  />
                )}
                {/* Current picked color in center - shows the actual picked color */}
                {currentPickColor && (
                  <Circle
                    cx={CENTER_X}
                    cy={CENTER_Y}
                    r={RADIUS * 0.35}
                    fill={currentPickColor}
                    stroke="white"
                    strokeWidth={4}
                  />
                )}
                {/* Target color dot - only show after all players have picked */}
                {targetPosition && guesses.length === playerCount && (
                  <Circle
                    cx={targetPosition.x}
                    cy={targetPosition.y}
                    r={8}
                    fill={targetColor}
                    stroke="white"
                    strokeWidth={2}
                  />
                )}
              </Svg>
            </View>
          </YStack>
        )}

        {/* Results with Color Wheel and Dots */}
        {phase === 'results' && (
          <YStack
            width="100%"
            maxWidth={360}
            alignItems="center"
            marginBottom={Design.spacing.md}
          >
            <YStack
              width="100%"
              backgroundColor="rgba(255,255,255,0.95)"
              borderRadius={Design.borderRadius.lg}
              padding={Design.spacing.lg}
              alignItems="center"
              {...Design.shadows.lg}
            >
              {/* Color wheel with dots */}
              <View
                style={{
                  position: 'relative',
                  marginBottom: Design.spacing.md,
                }}
              >
                <Svg width={COLOR_WHEEL_SIZE} height={COLOR_WHEEL_SIZE}>
                  <Defs>
                    <SvgLinearGradient id="centerGradientResults" x1="0%" y1="0%" x2="100%" y2="100%">
                      <Stop offset="0%" stopColor="rgba(255,255,255,0.8)" />
                      <Stop offset="100%" stopColor="rgba(255,255,255,0)" />
                    </SvgLinearGradient>
                  </Defs>
                  {colorWheelSegments}
                  <Circle
                    cx={CENTER_X}
                    cy={CENTER_Y}
                    r={RADIUS * 0.3}
                    fill="url(#centerGradientResults)"
                  />
                  
                  {/* Target color dot */}
                  {targetPosition && (
                    <Circle
                      cx={targetPosition.x}
                      cy={targetPosition.y}
                      r={8}
                      fill={targetColor}
                      stroke="white"
                      strokeWidth={2}
                    />
                  )}
                  
                  {/* Player guess dots */}
                  {guesses.map((guess) => {
                    const isWinner = guess.playerIndex === winner;
                    return (
                      <Circle
                        key={guess.playerIndex}
                        cx={guess.x}
                        cy={guess.y}
                        r={isWinner ? 12 : 10}
                        fill={isWinner ? '#FFD700' : guess.color}
                        stroke={isWinner ? '#FFD700' : 'white'}
                        strokeWidth={isWinner ? 3 : 2}
                      />
                    );
                  })}
                </Svg>
                
                {/* Player number labels */}
                {guesses.map((guess) => (
                  <View
                    key={`label-${guess.playerIndex}`}
                    style={{
                      position: 'absolute',
                      left: guess.x - 12,
                      top: guess.y - 12,
                      width: 24,
                      height: 24,
                      borderRadius: 12,
                      backgroundColor: guess.playerIndex === winner ? '#FFD700' : 'white',
                      borderWidth: 2,
                      borderColor: guess.playerIndex === winner ? '#FFD700' : '#E0E0E0',
                      alignItems: 'center',
                      justifyContent: 'center',
                      ...Design.shadows.sm,
                    }}
                  >
                    <Text
                      fontSize={Design.typography.sizes.xs}
                      fontWeight={Design.typography.weights.bold}
                      color={Design.colors.text.primary}
                    >
                      {guess.playerIndex + 1}
                    </Text>
                  </View>
                ))}
              </View>
              
              {/* Target Color to Match */}
              <YStack alignItems="center" marginBottom={Design.spacing.md} width="100%">
                <Text 
                  fontSize={Design.typography.sizes.md}
                  fontWeight={Design.typography.weights.semibold}
                  color={Design.colors.text.primary}
                  marginBottom={Design.spacing.xs}
                >
                  Color to Match
                </Text>
                <View
                  style={{
                    width: 60,
                    height: 60,
                    borderRadius: 30,
                    backgroundColor: targetColor,
                    borderWidth: 3,
                    borderColor: '#FFD700',
                    ...Design.shadows.md,
                  }}
                />
              </YStack>

              {/* Results list */}
              {(() => {
                const sortedGuesses = [...guesses].sort((a, b) => a.distance - b.distance);
                return sortedGuesses.map((guess, index) => {
                  // Winner is the first one in sorted list (index 0)
                  const isWinner = index === 0;
                  return (
                    <XStack
                      key={guess.playerIndex}
                      width="100%"
                      alignItems="center"
                      justifyContent="space-between"
                      paddingVertical={Design.spacing.sm}
                      borderBottomWidth={index < sortedGuesses.length - 1 ? 1 : 0}
                      borderBottomColor="#E0E0E0"
                    >
                      <XStack alignItems="center" gap={Design.spacing.sm}>
                        <Text 
                          fontSize={Design.typography.sizes.lg}
                          fontWeight={Design.typography.weights.bold}
                          color={isWinner ? '#FFD700' : Design.colors.text.secondary}
                          minWidth={24}
                        >
                          {index + 1}.
                        </Text>
                        <View
                          style={{
                            width: 40,
                            height: 40,
                            borderRadius: 20,
                            backgroundColor: guess.color || '#CCCCCC', // Ensure color is set
                            borderWidth: 2,
                            borderColor: isWinner ? '#FFD700' : '#E0E0E0',
                          }}
                        />
                        <Text 
                          fontSize={Design.typography.sizes.md}
                          fontWeight={isWinner ? Design.typography.weights.bold : Design.typography.weights.regular}
                          color={Design.colors.text.primary}
                        >
                          Player {guess.playerIndex + 1}
                          {isWinner && ' 👑'}
                        </Text>
                      </XStack>
                      <Text 
                        fontSize={Design.typography.sizes.sm}
                        color={Design.colors.text.secondary}
                      >
                        {Math.round(guess.distance)} pts
                      </Text>
                    </XStack>
                  );
                });
              })()}
            </YStack>
          </YStack>
        )}

        {/* Player Count Selector */}
        {phase === 'setup' && (
          <Animated.View
            style={{
              opacity: buttonFadeAnim,
              transform: [{ translateY: buttonSlideAnim }],
              width: '100%',
              maxWidth: 360,
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
                fontSize={Design.typography.sizes.md}
                fontWeight={Design.typography.weights.semibold}
                color={Design.colors.text.primary}
                marginBottom={Design.spacing.sm}
              >
                Players: {playerCount}
              </Text>
              <XStack gap={Design.spacing.xs} alignItems="center">
                {[2, 3, 4, 5, 6].map((count) => (
                  <Pressable
                    key={count}
                    onPress={() => setPlayerCount(count)}
                    style={({ pressed }) => [
                      {
                        flex: 1,
                        paddingVertical: Design.spacing.xs,
                        paddingHorizontal: Design.spacing.sm,
                        borderRadius: Design.borderRadius.md,
                        backgroundColor: playerCount === count ? Design.colors.primary : '#E0E0E0',
                        transform: [{ scale: pressed ? 0.95 : 1 }],
                      },
                    ]}
                  >
                    <Text
                      fontSize={Design.typography.sizes.sm}
                      fontWeight={Design.typography.weights.bold}
                      color={playerCount === count ? Design.colors.text.white : Design.colors.text.primary}
                      textAlign="center"
                    >
                      {count}
                    </Text>
                  </Pressable>
                ))}
              </XStack>
            </YStack>
          </Animated.View>
        )}

        {/* Action Button */}
        <Animated.View
          style={{
            opacity: phase === 'results' ? 1 : buttonFadeAnim,
            transform: [{ translateY: phase === 'results' ? 0 : buttonSlideAnim }],
            width: '100%',
            maxWidth: 360,
            marginTop: phase === 'results' ? Design.spacing.md : 0,
          }}
        >
          <Pressable
            onPress={phase === 'setup' ? startGame : reset}
            accessibilityRole="button"
            accessibilityLabel={phase === 'setup' ? 'Start game' : 'Reset game'}
            style={({ pressed }) => [
              {
                borderRadius: Design.borderRadius.lg,
                overflow: 'hidden',
                backgroundColor: '#FFFFFF',
                ...Design.shadows.lg,
                transform: [{ scale: pressed ? Design.pressScale.md : 1 }],
              },
            ]}
          >
            <LinearGradient
              colors={phase === 'setup'
                ? [Design.colors.primary, Design.colors.primaryDark]
                : ['#FF5722', '#E64A19']}
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
                  {phase === 'setup' ? '🎨' : '🔄'}
                </Text>
                <Text 
                  fontSize={Design.typography.sizes.lg + 2} 
                  color={Design.colors.text.white} 
                  fontWeight={Design.typography.weights.bold}
                  letterSpacing={Design.typography.letterSpacing.wide}
                >
                  {phase === 'setup' ? 'Start Game' : 'Play Again'}
                </Text>
              </XStack>
            </LinearGradient>
          </Pressable>
        </Animated.View>
      </ScrollView>

      {/* Confetti */}
      {showConfetti && (
        <ConfettiCannon
          count={80}
          origin={{ x: width / 2, y: 300 }}
          fadeOut={true}
          explosionSpeed={350}
          fallSpeed={3000}
          colors={['#FFD700', Design.colors.primary, '#FF6B6B', '#4ECDC4', '#45B7D1']}
        />
      )}
    </YStack>
  );
}
