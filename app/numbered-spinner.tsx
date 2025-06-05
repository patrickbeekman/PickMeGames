import Slider from '@react-native-community/slider';
import { Button } from '@tamagui/button';
import { Text } from '@tamagui/core';
import { YStack } from '@tamagui/stacks';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from 'expo-router';
import { usePostHog } from 'posthog-react-native';
import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { Animated, Dimensions, Easing, StyleSheet } from 'react-native';
import ConfettiCannon from 'react-native-confetti-cannon';
import Svg, { G, Path, Text as SvgText } from 'react-native-svg';

const SPINNER_SIZE = 300;
const { width, height } = Dimensions.get('window');

export default function SpinnerSelector() {
  const navigation = useNavigation();
  const posthog = usePostHog();
  const [playerCount, setPlayerCount] = useState(6);
  const [spinning, setSpinning] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const rotation = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;

  useLayoutEffect(() => {
    navigation.setOptions({
      headerTitle: 'Numbered Spinner',
      headerStyle: {
        backgroundColor: '#F3E889',
      },
      headerTintColor: '#333',
      headerTitleStyle: {
        fontWeight: 'bold',
      },
    });
  }, [navigation]);

  useEffect(() => {
    posthog.capture('entered_spinner');
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

    Animated.timing(rotation, {
      toValue: targetRotation,
      duration: 3000,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start(() => {
      setSpinning(false);
      setShowConfetti(true);

      // Reset button scale
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }).start();

      // Hide confetti after 3 seconds
      setTimeout(() => setShowConfetti(false), 3000);
    });

    posthog.capture('spun_numbered_spinner', {
      playerCount,
      finalAngle: randomOffset,
    });
  };

  const renderWheel = () => {
    const angleStep = 360 / playerCount;
    const radius = SPINNER_SIZE / 2;
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

      paths.push(
        <G key={i}>
          <Path d={pathData} fill={`hsl(${(i * 360) / playerCount}, 80%, 60%)`} />
          <SvgText
            x={labelX}
            y={labelY}
            fontSize="16"
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
  };

  const rotate = rotation.interpolate({
    inputRange: [0, 360],
    outputRange: ['0deg', '360deg'],
    extrapolate: 'extend',
  });

  return (
    <YStack flex={1} backgroundColor="#F3E889" alignItems="center" justifyContent="center">
      <LinearGradient
        colors={['#F3E889', '#FFE082', '#FFF9C4']}
        style={{ position: 'absolute', left: 0, right: 0, top: 0, bottom: 0 }}
      />

      {/* Header with emojis */}
      <YStack alignItems="center" marginBottom={30} marginTop={-50}>
        <Text fontSize={32} marginBottom={8}>🎭🎪</Text>
        <Text fontSize={18} fontWeight="600" color="#333" textAlign="center">
          Numbered Spinner Challenge!
        </Text>
        <Text fontSize={14} color="#666" textAlign="center" maxWidth={280}>
          Each player gets a number - let the spinner decide!
        </Text>
      </YStack>

      {/* Enhanced Arrow Pointer */}
      <YStack style={styles.arrowContainer}>
        <YStack style={styles.arrowShadow} />
        <YStack style={styles.arrow} />
      </YStack>

      {/* Enhanced Spinner Container */}
      <YStack
        alignItems="center"
        justifyContent="center"
        backgroundColor="rgba(255,255,255,0.1)"
        borderRadius={SPINNER_SIZE / 2 + 20}
        padding={20}
        shadowColor="#000"
        shadowOpacity={0.15}
        shadowOffset={{ width: 0, height: 8 }}
        shadowRadius={16}
      >
        <Animated.View style={{ transform: [{ rotate }] }}>
          <Svg width={SPINNER_SIZE} height={SPINNER_SIZE}>
            {renderWheel()}
          </Svg>
        </Animated.View>
      </YStack>

      {/* Enhanced Player Count Slider */}
      <YStack
        marginTop={30}
        alignItems="center"
        backgroundColor="rgba(255,255,255,0.9)"
        borderRadius={16}
        padding={20}
        width="90%"
        maxWidth={320}
        shadowColor="#000"
        shadowOpacity={0.1}
        shadowOffset={{ width: 0, height: 4 }}
        shadowRadius={8}
      >
        <Text fontSize={18} fontWeight="600" marginBottom={12} color="#333">
          👥 Players: {playerCount}
        </Text>
              {/* Enhanced Spin Button */}
      <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
        <Button
          // position="absolute"
          // bottom={80}
          alignSelf="center"
          backgroundColor={spinning ? "#FF9800" : "#4CAF50"}
          borderRadius={50}
          paddingHorizontal={40}
          paddingVertical={5}
          pressStyle={{ scale: 0.95, backgroundColor: spinning ? "#F57C00" : "#45a049" }}
          shadowColor="#000"
          shadowOpacity={0.25}
          shadowOffset={{ width: 0, height: 8 }}
          shadowRadius={12}
          elevation={8}
          onPress={spin}
          disabled={spinning}
        >
          <Text fontSize={20} color="white" fontWeight="bold">
            {spinning ? '🌀 Spinning...' : '🎯 SPIN!'}
          </Text>
        </Button>
      </Animated.View>
        <Slider
          minimumValue={2}
          maximumValue={15}
          step={1}
          value={playerCount}
          onValueChange={setPlayerCount}
          disabled={spinning}
          style={{ width: 250, height: 40 }}
          minimumTrackTintColor="#4CAF50"
          maximumTrackTintColor="#E0E0E0"
          // thumbStyle={{ backgroundColor: '#4CAF50', width: 20, height: 20 }}
        />
        <Text fontSize={12} color="#666" textAlign="center" marginTop={8}>
          Slide to adjust the number of players
        </Text>
      </YStack>



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
    position: 'absolute',
    top: '17%',
    zIndex: 10,
    alignItems: 'center',
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
    borderTopColor: 'rgba(0,0,0,0.2)',
  },
  arrow: {
    width: 0,
    height: 0,
    borderLeftWidth: 12,
    borderRightWidth: 12,
    borderTopWidth: 30,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderTopColor: '#D32F2F',
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 5,
  },
});
