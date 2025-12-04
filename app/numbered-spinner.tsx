import Slider from '@react-native-community/slider';
import { Text } from '@tamagui/core';
import { XStack, YStack } from '@tamagui/stacks';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from 'expo-router';
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { AccessibilityInfo, Animated, Dimensions, Easing, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import ConfettiCannon from 'react-native-confetti-cannon';
import Svg, { G, Path, Text as SvgText } from 'react-native-svg';
import { Design } from '../constants/Design';
import { useAnalytics } from '../hooks/useAnalytics';

// Modern color palette with gradients
const SEGMENT_COLORS = [
  ['#FF6B6B', '#FF8E8E'], // Red
  ['#4ECDC4', '#6EDDD6'], // Teal
  ['#45B7D1', '#6BC5D8'], // Blue
  ['#FFA07A', '#FFB896'], // Peach
  ['#98D8C8', '#B4E4D4'], // Mint
  ['#F7DC6F', '#F9E79F'], // Yellow
  ['#BB8FCE', '#D4A5E0'], // Purple
  ['#85C1E2', '#A8D4F0'], // Sky Blue
  ['#F1948A', '#F5B7B1'], // Pink
  ['#82E0AA', '#A9DFBF'], // Green
  ['#F8C471', '#FAD7A0'], // Orange
  ['#85C1E9', '#AED6F1'], // Light Blue
  ['#EC7063', '#F1948A'], // Coral
  ['#52BE80', '#7DCEA0'], // Emerald
  ['#F39C12', '#F7DC6F'], // Gold
  ['#AF7AC5', '#C39BD3'], // Lavender
  ['#5DADE2', '#85C1E9'], // Light Blue
  ['#E67E22', '#F39C12'], // Dark Orange
  ['#1ABC9C', '#52BE80'], // Turquoise
  ['#E74C3C', '#EC7063'], // Red Orange
];

// Calculate responsive spinner size
const getSpinnerSize = () => {
  const { width, height } = Dimensions.get('window');
  return Math.min(
    width * 0.7,
    height * 0.35,
    320 // Max size
  );
};

const { width, height } = Dimensions.get('window');

export default function SpinnerSelector() {
  const navigation = useNavigation();
  const { capture } = useAnalytics();
  const [playerCount, setPlayerCount] = useState(6);
  const [spinning, setSpinning] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const rotation = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const glowAnim = useRef(new Animated.Value(0)).current;
  const headerFadeAnim = useRef(new Animated.Value(0)).current;
  const headerSlideAnim = useRef(new Animated.Value(20)).current;
  const [spinnerSize, setSpinnerSize] = useState(getSpinnerSize());

  useLayoutEffect(() => {
    navigation.setOptions({
      headerTitle: 'Numbered Spinner',
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
    capture('entered_numbered_spinner');
  }, [capture]);

  // Update spinner size on dimension changes
  useEffect(() => {
    const subscription = Dimensions.addEventListener('change', () => {
      setSpinnerSize(getSpinnerSize());
    });
    return () => subscription?.remove();
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

    setShowConfetti(false);

    const fullRotation = 4 * 360;
    const randomOffset = Math.floor(Math.random() * 360);
    const targetRotation = fullRotation + randomOffset;

    // Calculate which segment the arrow points to
    const segmentAngle = 360 / playerCount;
    const finalAngle = randomOffset % 360;

    rotation.setValue(0);
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
          toValue: 1.05,
          duration: 400,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 400,
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

    // Enhanced spin animation with better easing
    Animated.timing(rotation, {
      toValue: targetRotation,
      duration: 3000,
      easing: Easing.out(Easing.quad),
      useNativeDriver: true,
    }).start(() => {
      setSpinning(false);
      setShowConfetti(true);

      // Screen reader announcement
      const selectedSegment = Math.floor((360 - (targetRotation % 360)) / (360 / playerCount)) % playerCount + 1;
      AccessibilityInfo.announceForAccessibility(`Spinner stopped on segment ${selectedSegment} of ${playerCount}. Player ${selectedSegment} goes first.`);

      // Stop animations
      pulseAnimation.stop();
      glowAnimation.stop();

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
    });

    capture('spun_numbered_spinner', {
      playerCount,
      finalAngle: randomOffset,
    });
  };

  // Memoize wheel rendering to avoid recalculating SVG paths on every render
  const wheelPaths = useMemo(() => {
    const angleStep = 360 / playerCount;
    const radius = spinnerSize / 2;
    const paths = [];

    for (let i = 0; i < playerCount; i++) {
      const startAngle = (i * angleStep * Math.PI) / 180;
      const endAngle = ((i + 1) * angleStep * Math.PI) / 180;

      const x1 = radius + radius * Math.cos(startAngle);
      const y1 = radius + radius * Math.sin(startAngle);
      const x2 = radius + radius * Math.cos(endAngle);
      const y2 = radius + radius * Math.sin(endAngle);

      const largeArc = angleStep > 180 ? 1 : 0;

      const pathData = `
        M ${radius} ${radius}
        L ${x1} ${y1}
        A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2}
        Z
      `;

      const midAngle = (startAngle + endAngle) / 2;
      const labelX = radius + (radius * 0.6) * Math.cos(midAngle);
      const labelY = radius + (radius * 0.6) * Math.sin(midAngle);

      // Use modern color palette
      const colorIndex = i % SEGMENT_COLORS.length;
      const colors = SEGMENT_COLORS[colorIndex];

      paths.push(
        <G key={i}>
          {/* Segment with subtle border */}
          <Path 
            d={pathData} 
            fill={colors[0]}
            stroke="rgba(255,255,255,0.2)"
            strokeWidth={1}
          />
          {/* Text shadow effect using duplicate text */}
          <SvgText
            x={labelX}
            y={labelY + 1.5}
            fontSize={spinnerSize > 250 ? 22 : 18}
            fontWeight="bold"
            fill="rgba(0,0,0,0.4)"
            textAnchor="middle"
            alignmentBaseline="middle"
          >
            {i + 1}
          </SvgText>
          <SvgText
            x={labelX}
            y={labelY}
            fontSize={spinnerSize > 250 ? 22 : 18}
            fontWeight="bold"
            fill="#fff"
            textAnchor="middle"
            alignmentBaseline="middle"
          >
            {i + 1}
          </SvgText>
        </G>
      );
    }

    return paths;
  }, [playerCount, spinnerSize]);

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
          paddingBottom: Design.spacing.xxl + 20, // Extra padding to avoid home indicator
          alignItems: 'center',
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
          }}
        >
          <YStack alignItems="center" marginBottom={Design.spacing.lg}>
            <Text 
              fontSize={Design.typography.sizes.xxl + 4} 
              marginBottom={Design.spacing.sm}
            >
              🎭🎪
            </Text>
            <Text 
              fontSize={Design.typography.sizes.xl} 
              fontWeight={Design.typography.weights.bold} 
              color={Design.colors.text.primary} 
              textAlign="center"
              marginBottom={Design.spacing.xs}
              letterSpacing={Design.typography.letterSpacing.tight}
            >
              Numbered Spinner Challenge!
            </Text>
            <Text 
              fontSize={Design.typography.sizes.sm} 
              color={Design.colors.text.secondary} 
              textAlign="center" 
              maxWidth={300}
              lineHeight={Design.typography.sizes.sm * 1.4}
            >
              Each player gets a number - let the spinner decide!
            </Text>
          </YStack>
        </Animated.View>

        {/* Arrow positioned completely outside spinner area */}
        <View
          style={[
            styles.arrowContainer,
            {
              marginBottom: Design.spacing.sm,
              alignItems: 'center',
            },
          ]}
        >
          <View style={styles.arrowShadow} />
          <View style={styles.arrow} />
        </View>

        {/* Spinner Container */}
        <View style={{ alignItems: 'center', marginBottom: Design.spacing.xl }}>
          <Animated.View
            style={{
              transform: [{ scale: pulseAnim }],
              opacity: glowAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [1, 0.85],
              }),
            }}
          >
            <YStack
              alignItems="center"
              justifyContent="center"
              backgroundColor="rgba(255,255,255,0.2)"
              borderRadius={(spinnerSize / 2) + Design.spacing.lg}
              padding={Design.spacing.lg}
              borderWidth={1}
              borderColor="rgba(255,255,255,0.3)"
              {...Design.shadows.lg}
            >
              <Animated.View style={{ transform: [{ rotate }] }}>
                <Svg width={spinnerSize} height={spinnerSize}>
                  {wheelPaths}
                </Svg>
              </Animated.View>
            </YStack>
          </Animated.View>
        </View>

        {/* Controls Card */}
        <Animated.View
          style={{
            width: '100%',
            maxWidth: 360,
            backgroundColor: '#FFFFFF',
            borderRadius: Design.borderRadius.lg,
            padding: Design.spacing.md,
            paddingBottom: Design.spacing.sm,
            ...Design.shadows.md,
            marginBottom: Design.spacing.md,
            opacity: headerFadeAnim,
            transform: [{ translateY: headerSlideAnim }],
          }}
        >
          {/* Player Count Display */}
          <XStack 
            alignItems="center" 
            justifyContent="center" 
            marginBottom={Design.spacing.sm}
            backgroundColor="rgba(76, 175, 80, 0.1)"
            borderRadius={Design.borderRadius.md}
            paddingVertical={Design.spacing.xs}
            paddingHorizontal={Design.spacing.md}
          >
            <Text fontSize={Design.typography.sizes.md} marginRight={Design.spacing.xs}>👥</Text>
            <Text 
              fontSize={Design.typography.sizes.md} 
              fontWeight={Design.typography.weights.bold} 
              color={Design.colors.text.primary}
            >
              Players: {playerCount}
            </Text>
          </XStack>

          {/* Modern Gradient Spin Button */}
          <Animated.View 
            style={{ 
              transform: [{ scale: scaleAnim }],
              marginBottom: Design.spacing.sm,
            }}
          >
            <Pressable
              onPress={spin}
              disabled={spinning}
              accessibilityRole="button"
              accessibilityLabel={spinning ? 'Spinner is spinning' : 'Spin the numbered spinner'}
              accessibilityHint={`Spins the spinner with ${playerCount} segments to randomly select which player goes first`}
              accessibilityState={{ disabled: spinning }}
              style={({ pressed }) => [
                {
                  borderRadius: Design.borderRadius.md,
                  overflow: 'hidden',
                  backgroundColor: '#FFFFFF',
                  ...Design.shadows.sm,
                  transform: [{ scale: pressed ? 0.95 : 1 }],
                  opacity: spinning ? 0.7 : 1,
                },
              ]}
            >
              <LinearGradient
                colors={spinning ? ['#F57C00', '#E65100'] : [Design.colors.primary, Design.colors.primaryDark]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={{
                  paddingVertical: Design.spacing.sm + 2,
                  paddingHorizontal: Design.spacing.lg,
                  borderRadius: Design.borderRadius.md,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <XStack alignItems="center" gap={Design.spacing.xs}>
                  <Text fontSize={Design.typography.sizes.md}>
                    {spinning ? '🌀' : '🎯'}
                  </Text>
                  <Text 
                    fontSize={Design.typography.sizes.md} 
                    color={Design.colors.text.white} 
                    fontWeight={Design.typography.weights.bold}
                  >
                    {spinning ? 'Spinning...' : 'SPIN!'}
                  </Text>
                </XStack>
              </LinearGradient>
            </Pressable>
          </Animated.View>

          {/* Slider */}
          <View style={{ width: '100%', paddingHorizontal: Design.spacing.xs }}>
            <Slider
              minimumValue={2}
              maximumValue={20}
              step={1}
              value={playerCount}
              onValueChange={setPlayerCount}
              disabled={spinning}
              style={{ width: '100%', height: 32 }}
              minimumTrackTintColor={Design.colors.primary}
              maximumTrackTintColor="#E0E0E0"
              thumbTintColor={Design.colors.primary}
            />
          </View>
          <Text 
            fontSize={Design.typography.sizes.xs} 
            color={Design.colors.text.secondary} 
            textAlign="center" 
            marginTop={Design.spacing.xs}
            marginBottom={Design.spacing.xs}
          >
            Slide to adjust players
          </Text>
        </Animated.View>
      </ScrollView>

      {/* Confetti celebration */}
      {showConfetti && (
        <ConfettiCannon
          count={80}
          origin={{ x: width / 2, y: height / 2 }}
          fadeOut={true}
          explosionSpeed={350}
          fallSpeed={2800}
          colors={['#4CAF50', '#FFD700', '#FF6B6B', '#4ECDC4', '#9B59B6', '#FF9800']}
        />
      )}
    </YStack>
  );
}

const styles = StyleSheet.create({
  arrowContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 24,
    height: 30,
  },
  arrowShadow: {
    position: 'absolute',
    top: 2,
    width: 0,
    height: 0,
    borderLeftWidth: 14,
    borderRightWidth: 14,
    borderTopWidth: 32,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderTopColor: 'rgba(0,0,0,0.25)',
  },
  arrow: {
    width: 0,
    height: 0,
    borderLeftWidth: 12,
    borderRightWidth: 12,
    borderTopWidth: 30,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderTopColor: '#E74C3C',
    shadowColor: '#000',
    shadowOpacity: 0.4,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 6,
    elevation: 6,
  },
});
