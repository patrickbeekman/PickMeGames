import { Button } from '@tamagui/button';
import { Text, View } from '@tamagui/core';
import { YStack } from '@tamagui/stacks';
import { useNavigation } from 'expo-router';
import { usePostHog } from 'posthog-react-native';
import React, { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Dimensions,
  Easing,
  StyleSheet,
} from 'react-native';

const { width } = Dimensions.get('window');
const SPINNER_SIZE = width * 0.8;
const SPINS_PER_TURN = 4; // Number of full spins before stopping
const ARROW_LENGTH = SPINNER_SIZE / 2 - 10;

const TwisterSpinner = () => {
  const navigation = useNavigation();
  const posthog = usePostHog();
  const rotation = useRef(new Animated.Value(0)).current;
  const [spinning, setSpinning] = useState(false);
  const [baseRotation, setBaseRotation] = useState(0);
  const isMounted = useRef(true);
  const animationRef = useRef<Animated.CompositeAnimation | null>(null);

  useEffect(() => {
    navigation.setOptions({
      headerTitle: 'Spinner',
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

  const spin = () => {
    if (spinning) return;
  
    const randomOffset = Math.random() * 360; // random final angle
    const fullSpins = SPINS_PER_TURN * 360;
    const targetRotation = baseRotation + fullSpins + randomOffset;
  
    setSpinning(true);
  
    // Save animation ref so we can stop it on unmount
    animationRef.current = Animated.timing(rotation, {
      toValue: targetRotation,
      duration: 3500,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    });

    animationRef.current.start(() => {
      if (isMounted.current) {
        setSpinning(false);
        setBaseRotation(targetRotation);
      }
    });

    // capture the spin event
    posthog.capture('spun_empty_spinner', {
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
    <YStack flex={1} backgroundColor="#F3E889" alignItems="center" justifyContent="center">
      {/* Static base circle */}
      <View style={styles.circle} />

      {/* Rotating arrow */}
      <Animated.View style={[styles.arrowContainer, { transform: [{ rotate }] }]}>
        <View style={styles.arrow} />
      </Animated.View>

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
        <Text color="white" fontWeight="bold" fontSize={18}>
          {spinning ? 'Spinning...' : 'Spin'}
        </Text>
      </Button>
    </YStack>
  );
};

const styles = StyleSheet.create({
  circle: {
    width: SPINNER_SIZE,
    height: SPINNER_SIZE,
    borderRadius: SPINNER_SIZE / 2,
    backgroundColor: '#FFE082',
    borderColor: '#FFB300',
    borderWidth: 10,
    position: 'absolute',
  },
  arrowContainer: {
    position: 'absolute',
    width: SPINNER_SIZE,
    height: SPINNER_SIZE,
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  arrow: {
    width: 0,
    height: 0,
    borderLeftWidth: 10,
    borderRightWidth: 10,
    borderBottomWidth: ARROW_LENGTH,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderBottomColor: '#8BBB19',
  },
});

export default TwisterSpinner;
