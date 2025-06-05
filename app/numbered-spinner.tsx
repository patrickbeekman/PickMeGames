import Slider from '@react-native-community/slider';
import { Button } from '@tamagui/button';
import { Text } from '@tamagui/core';
import { YStack } from '@tamagui/stacks';
import { useNavigation } from 'expo-router';
import { usePostHog } from 'posthog-react-native';
import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { Animated, Easing, StyleSheet } from 'react-native';
import Svg, { G, Path, Text as SvgText } from 'react-native-svg';

const SPINNER_SIZE = 300;

export default function SpinnerSelector() {
  const navigation = useNavigation();
  const posthog = usePostHog();
  const [playerCount, setPlayerCount] = useState(6);
  const [spinning, setSpinning] = useState(false);
  const rotation = useRef(new Animated.Value(0)).current;

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

    const fullRotation = 4 * 360;
    const randomOffset = Math.floor(Math.random() * 360);
    const targetRotation = fullRotation + randomOffset;

    rotation.setValue(0);
    setSpinning(true);

    Animated.timing(rotation, {
      toValue: targetRotation,
      duration: 3000,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start(() => {
        setSpinning(false);
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

      {/* Arrow Pointer */}
      <YStack style={styles.arrow} />

      {/* Spinner */}
      <Animated.View style={{ transform: [{ rotate }] }}>
        <Svg width={SPINNER_SIZE} height={SPINNER_SIZE}>
          {renderWheel()}
        </Svg>
      </Animated.View>

      {/* Player Count Slider */}
      <YStack marginTop={20} alignItems="center">
        <Text fontSize={16} fontWeight="500" marginBottom={8}>
          Players: {playerCount}
        </Text>
        <Slider
          minimumValue={2}
          maximumValue={15}
          step={1}
          value={playerCount}
          onValueChange={setPlayerCount}
          disabled={spinning}
          style={{ width: 250 }}
        />
      </YStack>

      {/* Spin Button */}
      <Button
        position="absolute"
        bottom={80}
        alignSelf="center"
        backgroundColor="#4CAF50"
        borderRadius={999}
        pressStyle={{ scale: 0.95, backgroundColor: "#45a049" }}
        shadowColor="#000"
        shadowOpacity={0.2}
        shadowOffset={{ width: 0, height: 2 }}
        shadowRadius={4}
        onPress={spin}
        disabled={spinning}
      >
        <Text fontSize={18} color="white" fontWeight="bold">
          {spinning ? 'Spinning...' : 'Spin!'}
        </Text>
      </Button>
    </YStack>
  );
}

const styles = StyleSheet.create({
  arrow: {
    position: 'absolute',
    top: '20%',
    transform: [{ rotate: '0deg' }],
    width: 0,
    height: 0,
    borderLeftWidth: 12,
    borderRightWidth: 12,
    borderTopWidth: 30,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderTopColor: '#D32F2F',
    zIndex: 10,
  },
});
