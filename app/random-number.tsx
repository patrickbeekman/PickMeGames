import Slider from '@react-native-community/slider';
import { Button } from '@tamagui/button';
import { Text } from '@tamagui/core';
import { YStack } from '@tamagui/stacks';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { Animated, Easing } from 'react-native';
import ConfettiCannon from 'react-native-confetti-cannon';
import { useAnalytics } from '../hooks/useAnalytics';

export default function NumberGuesser() {
  const navigation = useNavigation();
  const { capture, isReady } = useAnalytics();
  const [randomNumber, setRandomNumber] = useState<number | null>(null);
  const [isRevealing, setIsRevealing] = useState(false);
  const [animatedNumber, setAnimatedNumber] = useState('?');
  const [showConfetti, setShowConfetti] = useState(false);
  
  // Animation values
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const bounceAnim = useRef(new Animated.Value(0)).current;

  const RANGE_OPTIONS = [10, 100, 1000, 10000, 100000, 1000000];
  const [rangeIndex, setRangeIndex] = useState(1); // default to 100
  const maxNumber = RANGE_OPTIONS[rangeIndex];

  useEffect(() => {
    navigation.setOptions({
      headerTitle: 'Number Guesser',
      headerStyle: {
        backgroundColor: '#F3E889',
        borderBottomWidth: 0,
        shadowOpacity: 0,
        elevation: 0,
      },
      headerTintColor: '#333',
      headerTitleStyle: {
        fontWeight: 'bold',
      },
    });
  }, [navigation]);

  useEffect(() => {
    if (isReady) {
      capture('entered_number_guesser');
    }
  }, [capture, isReady]);

  const revealNumber = () => {
    if (isRevealing) return;
    setIsRevealing(true);
    setShowConfetti(false);
    
    // Start spinning animation
    rotateAnim.setValue(0);
    Animated.timing(rotateAnim, {
      toValue: 1,
      duration: 1000,
      easing: Easing.out(Easing.quad),
      useNativeDriver: true,
    }).start();

    // Scale bounce effect
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 1.2,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();

    capture('number_revealed', {
      randomNumber,
      maxNumber,
    });
  };

  useEffect(() => {
    if (isRevealing) {
      // Continuous pulse during reveal
      const pulseAnimation = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.1,
            duration: 100,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 100,
            useNativeDriver: true,
          }),
        ])
      );
      pulseAnimation.start();

      const interval = setInterval(() => {
        setAnimatedNumber(String(Math.floor(Math.random() * maxNumber) + 1));
      }, 50);

      const timeout = setTimeout(() => {
        clearInterval(interval);
        pulseAnimation.stop();
        pulseAnim.setValue(1);

        const final = Math.floor(Math.random() * maxNumber) + 1;
        setRandomNumber(final);
        setAnimatedNumber(String(final));
        setIsRevealing(false);
        setShowConfetti(true);

        // Victory bounce animation
        Animated.sequence([
          Animated.timing(bounceAnim, {
            toValue: 1,
            duration: 300,
            easing: Easing.bounce,
            useNativeDriver: true,
          }),
          Animated.timing(scaleAnim, {
            toValue: 1.3,
            duration: 200,
            useNativeDriver: true,
          }),
          Animated.timing(scaleAnim, {
            toValue: 1,
            duration: 300,
            easing: Easing.bounce,
            useNativeDriver: true,
          }),
        ]).start();
      }, 1000);

      return () => {
        clearInterval(interval);
        clearTimeout(timeout);
        pulseAnimation.stop();
      };
    }
  }, [isRevealing, maxNumber]);

  const spin = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const bounce = bounceAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -20],
  });

  return (
    <YStack flex={1} backgroundColor="#F3E889" alignItems="center" justifyContent="center" padding={20}>
      <LinearGradient
        colors={['#F3E889', '#FFE082', '#FFF9C4']}
        style={{ position: 'absolute', left: 0, right: 0, top: 0, bottom: 0 }}
      />
      
      {/* Range slider */}
      <YStack
        alignItems="center"
        backgroundColor="rgba(255,255,255,0.95)"
        borderRadius={16}
        padding={18}
        marginBottom={24}
        shadowColor="#000"
        shadowOpacity={0.08}
        shadowOffset={{ width: 0, height: 2 }}
        shadowRadius={6}
        width="100%"
        maxWidth={340}
      >
        <Text fontSize={16} fontWeight="600" color="#333" marginBottom={8}>
          Max Number: <Text fontWeight="bold" color="#4CAF50">{maxNumber.toLocaleString()}</Text>
        </Text>
        <Slider
          minimumValue={0}
          maximumValue={RANGE_OPTIONS.length - 1}
          step={1}
          value={rangeIndex}
          onValueChange={val => setRangeIndex(Math.round(val))}
          disabled={isRevealing}
          style={{ width: 220, height: 40 }}
          minimumTrackTintColor="#4CAF50"
          maximumTrackTintColor="#E0E0E0"
          thumbTintColor="#4CAF50"
        />
        <YStack flexDirection="row" justifyContent="space-between" width={220} marginTop={4}>
          {RANGE_OPTIONS.map((val, idx) => (
            <Text
              key={val}
              fontSize={10}
              color={idx === rangeIndex ? "#4CAF50" : "#999"}
              fontWeight={idx === rangeIndex ? "bold" : "normal"}
              style={{ width: 36, textAlign: 'center' }}
            >
              {val === 1000000
                ? '1M'
                : val === 100000
                  ? '100k'
                  : val === 10000
                    ? '10k'
                    : val === 1000
                      ? '1k'
                      : val}
            </Text>
          ))}
        </YStack>
      </YStack>

      {/* Fun header with emoji */}
      <YStack alignItems="center" marginBottom={40}>
        <Text fontSize={40} marginBottom={16}>✨🎲✨</Text>
        <Text fontSize={20} fontWeight="700" color="#333" textAlign="center" marginBottom={8}>
          Lucky Number Challenge!
        </Text>
        <Text fontSize={16} fontWeight="500" color="#666" textAlign="center" maxWidth={300}>
          Everyone pick a number from 1 to {maxNumber.toLocaleString()}.
          Closest guess without going over wins!
        </Text>
      </YStack>
      
      {/* Animated number display */}
      <Animated.View
        style={{
          transform: [
            { scale: Animated.multiply(scaleAnim, pulseAnim) },
            { rotate: spin },
            { translateY: bounce }
          ]
        }}
      >
        <YStack
          width={180}
          height={180}
          borderRadius={90}
          backgroundColor="rgba(255,255,255,0.95)"
          alignItems="center"
          justifyContent="center"
          elevation={8}
          shadowColor="#000"
          shadowOpacity={0.15}
          shadowOffset={{ width: 0, height: 8 }}
          shadowRadius={12}
          marginBottom={50}
          borderWidth={4}
          borderColor={randomNumber !== null ? "#4CAF50" : "#FFD700"}
        >
          {/*
            Dynamically scale font size based on number length.
            - 7+ digits: 32
            - 6 digits: 40
            - 5 digits: 48
            - 4 digits: 56
            - else: 72/56
          */}
          <Text 
            fontSize={
              (() => {
                const numStr = isRevealing
                  ? animatedNumber
                  : randomNumber !== null
                    ? String(randomNumber)
                    : '?';
                if (numStr.length >= 7) return 32;
                if (numStr.length === 6) return 40;
                if (numStr.length === 5) return 48;
                if (numStr.length === 4) return 56;
                return randomNumber !== null ? 56 : 72;
              })()
            }
            fontWeight="bold" 
            color={randomNumber !== null ? "#4CAF50" : "#333"} 
            textAlign="center"
            numberOfLines={1}
            adjustsFontSizeToFit
          >
            {isRevealing ? animatedNumber : randomNumber !== null ? randomNumber : '?'}
          </Text>
          {randomNumber !== null}
        </YStack>
      </Animated.View>
      
      {/* Animated button */}
      <Animated.View style={{ transform: [{ scale: isRevealing ? 0.9 : 1 }] }}>
        <Button
          backgroundColor={isRevealing ? "#FF9800" : "#4CAF50"}
          borderRadius={50}
          paddingHorizontal={32}
          paddingVertical={5}
          pressStyle={{ scale: 0.95, backgroundColor: isRevealing ? "#F57C00" : "#45a049" }}
          shadowColor="#000"
          shadowOpacity={0.2}
          shadowOffset={{ width: 0, height: 4 }}
          shadowRadius={8}
          onPress={revealNumber}
          disabled={isRevealing}
        >
          <Text fontSize={18} color="white" fontWeight="bold">
            {isRevealing ? '🎲 Rolling...' : randomNumber !== null ? '🔄 Roll Again' : '🎯 Reveal Number'}
          </Text>
        </Button>
      </Animated.View>

      {/* Reset instruction */}
      {randomNumber !== null && !isRevealing && (
        <Animated.View style={{ opacity: 1, marginTop: 24 }}>
          <Text fontSize={14} color="#666" textAlign="center">
            Tap "Roll Again" for a new number! 🎲
          </Text>
        </Animated.View>
      )}

      {/* Confetti celebration */}
      {showConfetti && (
        <ConfettiCannon
          count={80}
          origin={{ x: 200, y: 300 }}
          fadeOut={true}
          explosionSpeed={350}
          fallSpeed={3000}
          colors={['#FFD700', '#4CAF50', '#FF6B6B', '#4ECDC4', '#45B7D1']}
        />
      )}
    </YStack>
  );
}
