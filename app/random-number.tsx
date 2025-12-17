import { Text } from '@tamagui/core';
import { Image } from '@tamagui/image';
import { XStack, YStack } from '@tamagui/stacks';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from 'expo-router';
import { useEffect, useMemo, useRef, useState } from 'react';
import { AccessibilityInfo, Animated, Easing, Pressable, ScrollView, StyleSheet } from 'react-native';
import ConfettiCannon from 'react-native-confetti-cannon';
import { Design } from '../constants/Design';
import { useAnalytics } from '../hooks/useAnalytics';

export default function NumberGuesser() {
  const navigation = useNavigation();
  const { capture } = useAnalytics();
  const [randomNumber, setRandomNumber] = useState<number | null>(null);
  const [isRevealing, setIsRevealing] = useState(false);
  const [animatedNumber, setAnimatedNumber] = useState('?');
  const [showConfetti, setShowConfetti] = useState(false);
  
  // Animation values
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const bounceAnim = useRef(new Animated.Value(0)).current;
  const headerFadeAnim = useRef(new Animated.Value(0)).current;
  const headerSlideAnim = useRef(new Animated.Value(20)).current;
  const buttonFadeAnim = useRef(new Animated.Value(0)).current;
  const buttonSlideAnim = useRef(new Animated.Value(30)).current;
  const cardFadeAnim = useRef(new Animated.Value(0)).current;
  const cardSlideAnim = useRef(new Animated.Value(20)).current;

  // Quick preset ranges
  const PRESET_RANGES = [
    { label: '🎲 Dice', min: 1, max: 6 },
    { label: '🎯 D20', min: 1, max: 20 },
    { label: '🔢 1-100', min: 1, max: 100 },
    { label: '🎪 1-1K', min: 1, max: 1000 },
    { label: '🌟 1-10K', min: 1, max: 10000 },
    { label: '💫 1-100K', min: 1, max: 100000 },
    { label: '🚀 1-1M', min: 1, max: 1000000 },
  ];

  const [minNumber, setMinNumber] = useState(1);
  const [maxNumber, setMaxNumber] = useState(100);
  const [selectedPreset, setSelectedPreset] = useState<number>(2); // Default to 1-100

  useEffect(() => {
    navigation.setOptions({
      headerTitle: 'Random Number',
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
    capture('entered_number_guesser');
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
      Animated.timing(cardFadeAnim, {
        toValue: 1,
        duration: Design.animation.normal,
        delay: 100,
        useNativeDriver: true,
      }),
      Animated.timing(cardSlideAnim, {
        toValue: 0,
        duration: Design.animation.normal,
        delay: 100,
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

  const applyPreset = (presetIndex: number) => {
    const preset = PRESET_RANGES[presetIndex];
    setMinNumber(preset.min);
    setMaxNumber(preset.max);
    setSelectedPreset(presetIndex);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const revealNumber = () => {
    if (isRevealing) return;
    if (minNumber >= maxNumber) return; // Validate range
    
    // Haptic feedback on press
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    
    // Reset state for new roll to prevent stale values
    setRandomNumber(null);
    setAnimatedNumber('?');
    setIsRevealing(true);
    setShowConfetti(false);
    
    // Start spinning animation
    rotateAnim.setValue(0);
    Animated.timing(rotateAnim, {
      toValue: 1,
      duration: 1200,
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
      minNumber,
      maxNumber,
      range: maxNumber - minNumber + 1,
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

      // Digit-by-digit reveal animation
      const range = maxNumber - minNumber + 1;
      const startValue = minNumber;
      const endValue = Math.floor(Math.random() * range) + minNumber;
      const endValueStr = String(endValue);
      const numDigits = endValueStr.length;
      
      let currentDigit = 0;
      let currentDisplay = '?'.repeat(numDigits);

      const interval = setInterval(() => {
        // Show random digits for unrevealed positions
        const revealed = endValueStr.substring(0, currentDigit);
        const remaining = '?'.repeat(numDigits - currentDigit);
        setAnimatedNumber(revealed + remaining);
        
        // Gradually reveal digits
        if (Math.random() > 0.7 && currentDigit < numDigits) {
          currentDigit++;
        } else {
          // Show random numbers for remaining digits
          const randomDigits = Array.from({ length: numDigits - currentDigit }, () => 
            String(Math.floor(Math.random() * 10))
          ).join('');
          setAnimatedNumber(revealed + randomDigits);
        }
      }, 80);

      const timeout = setTimeout(() => {
        clearInterval(interval);
        pulseAnimation.stop();
        pulseAnim.setValue(1);

        // Final reveal - show actual number digit by digit
        let revealIndex = 0;
        const finalRevealInterval = setInterval(() => {
          if (revealIndex < numDigits) {
            const revealed = endValueStr.substring(0, revealIndex + 1);
            const remaining = '?'.repeat(numDigits - revealIndex - 1);
            setAnimatedNumber(revealed + remaining);
            revealIndex++;
          } else {
            clearInterval(finalRevealInterval);
            setRandomNumber(endValue);
            setAnimatedNumber(endValueStr);
        setIsRevealing(false);
        setShowConfetti(true);
          }
        }, 150);
        
        // Fallback timeout
        setTimeout(() => {
          clearInterval(finalRevealInterval);
          setRandomNumber(endValue);
          setAnimatedNumber(endValueStr);
          setIsRevealing(false);
          setShowConfetti(true);
        }, 2000);

        // Haptic feedback on completion
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

        // Screen reader announcement
        AccessibilityInfo.announceForAccessibility(`Random number revealed: ${endValue.toLocaleString()}`);

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
  }, [isRevealing, minNumber, maxNumber]);

  const spin = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const bounce = bounceAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -20],
  });

  // Memoize font size calculation and display values
  const { fontSize, displayText, accessibilityLabel } = useMemo(() => {
    const numStr = isRevealing
      ? animatedNumber
      : randomNumber !== null
        ? String(randomNumber)
        : '?';
    const len = numStr.replace(/\?/g, '').length || numStr.length;
    
    let calculatedFontSize: number;
    if (len >= 7) calculatedFontSize = Design.typography.sizes.xxxl - 8;
    else if (len === 6) calculatedFontSize = Design.typography.sizes.xxxl - 4;
    else if (len === 5) calculatedFontSize = Design.typography.sizes.xxxl;
    else if (len === 4) calculatedFontSize = Design.typography.sizes.xxxl + 8;
    else calculatedFontSize = Design.typography.sizes.xxxl + 16;

    const display = isRevealing 
      ? animatedNumber 
      : randomNumber !== null 
        ? randomNumber.toLocaleString() 
        : '?';
    
    const a11yLabel = isRevealing 
      ? 'Revealing number' 
      : randomNumber !== null 
        ? `Random number: ${randomNumber.toLocaleString()}` 
        : 'Number not yet revealed';

    return {
      fontSize: calculatedFontSize,
      displayText: display,
      accessibilityLabel: a11yLabel,
    };
  }, [isRevealing, animatedNumber, randomNumber]);

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
        {/* Header with emoji */}
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
              source={require('../icons/random-number.png')}
              width={88}
              height={88}
              objectFit="contain"
              resizeMode="contain"
              marginBottom={Design.spacing.md}
              accessibilityLabel="Random number icon"
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
              Roll a random number
        </Text>
          </YStack>
        </Animated.View>

        {/* Quick Preset Buttons */}
        <Animated.View
          style={{
            opacity: cardFadeAnim,
            transform: [{ translateY: cardSlideAnim }],
            width: '100%',
            maxWidth: 360,
            marginBottom: Design.spacing.lg,
          }}
        >
          <YStack
            backgroundColor="rgba(255,255,255,0.95)"
            borderRadius={Design.borderRadius.lg}
            padding={Design.spacing.md}
            {...Design.shadows.md}
            width="100%"
            gap={Design.spacing.sm}
          >
            <XStack flexWrap="wrap" gap={Design.spacing.xs} justifyContent="center">
              {PRESET_RANGES.map((preset, idx) => (
                <Pressable
                  key={idx}
                  onPress={() => applyPreset(idx)}
                  disabled={isRevealing}
                  accessibilityRole="button"
                  accessibilityLabel={`Set range to ${preset.label}, from ${preset.min} to ${preset.max}`}
                  accessibilityState={{ selected: selectedPreset === idx, disabled: isRevealing }}
                  style={({ pressed }) => [
                    {
                      borderRadius: Design.borderRadius.md,
                      overflow: 'hidden',
                      backgroundColor: selectedPreset === idx ? Design.colors.primary : '#FFFFFF',
                      borderWidth: 2,
                      borderColor: selectedPreset === idx ? Design.colors.primary : '#E0E0E0',
                      ...Design.shadows.sm,
                      transform: [{ scale: pressed ? Design.pressScale.sm : 1 }],
                      opacity: isRevealing ? 0.6 : 1,
                    },
                  ]}
                >
                  <YStack
                    paddingVertical={Design.spacing.xs + 2}
                    paddingHorizontal={Design.spacing.sm}
                    alignItems="center"
                    justifyContent="center"
                    minWidth={70}
                  >
                    <Text
                      fontSize={Design.typography.sizes.xs}
                      fontWeight={Design.typography.weights.semibold}
                      color={selectedPreset === idx ? Design.colors.text.white : Design.colors.text.primary}
                      textAlign="center"
                    >
                      {preset.label}
                    </Text>
                  </YStack>
                </Pressable>
              ))}
            </XStack>
        </YStack>
        </Animated.View>



      
      {/* Animated number display */}
      <Animated.View
        style={{
          transform: [
            { scale: Animated.multiply(scaleAnim, pulseAnim) },
            { rotate: spin },
            { translateY: bounce }
            ],
            width: '100%',
            maxWidth: 360,
            marginBottom: Design.spacing.xl,
        }}
      >
        <YStack
            width="100%"
            minHeight={200}
            borderRadius={Design.borderRadius.xl}
          backgroundColor="rgba(255,255,255,0.95)"
          alignItems="center"
          justifyContent="center"
            {...Design.shadows.lg}
          borderWidth={4}
            borderColor={randomNumber !== null ? Design.colors.primary : "#FFD700"}
            padding={Design.spacing.xl}
          >
            {/* Main number display */}
          <Text 
            fontSize={fontSize}
            fontWeight={Design.typography.weights.bold} 
            color={randomNumber !== null ? Design.colors.primary : Design.colors.text.primary} 
            textAlign="center"
            numberOfLines={1}
            adjustsFontSizeToFit
            letterSpacing={Design.typography.letterSpacing.tight}
            accessibilityRole="text"
            accessibilityLabel={accessibilityLabel}
          >
            {displayText}
          </Text>

        </YStack>
      </Animated.View>
      
      {/* Animated button */}
        <Animated.View 
          style={{ 
            opacity: buttonFadeAnim,
            transform: [{ translateY: buttonSlideAnim }, { scale: isRevealing ? 0.9 : 1 }],
            width: '100%',
            maxWidth: 360,
            marginBottom: Design.spacing.md,
          }}
        >
          <Pressable
          onPress={revealNumber}
          disabled={isRevealing}
            accessibilityRole="button"
            accessibilityLabel={isRevealing ? 'Revealing number' : randomNumber !== null ? 'Generate new random number' : 'Reveal random number'}
            accessibilityHint={randomNumber !== null ? 'Generates a new random number' : `Reveals a random number between ${minNumber.toLocaleString()} and ${maxNumber.toLocaleString()}`}
            accessibilityState={{ disabled: isRevealing }}
            style={({ pressed }) => [
              {
                borderRadius: Design.borderRadius.lg,
                overflow: 'hidden',
                backgroundColor: '#FFFFFF',
                ...Design.shadows.lg,
                transform: [{ scale: pressed ? Design.pressScale.md : 1 }],
                opacity: isRevealing ? 0.8 : 1,
              },
            ]}
          >
            <LinearGradient
              colors={isRevealing 
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
                  {isRevealing ? '🎲' : randomNumber !== null ? '🔄' : '🎯'}
                </Text>
                <Text 
                  fontSize={Design.typography.sizes.lg + 2} 
                  color={Design.colors.text.white} 
                  fontWeight={Design.typography.weights.bold}
                  letterSpacing={Design.typography.letterSpacing.wide}
                >
                  {isRevealing ? 'Rolling...' : randomNumber !== null ? 'Roll Again' : 'Reveal Number'}
          </Text>
              </XStack>
            </LinearGradient>
          </Pressable>
      </Animated.View>

      {/* Reset instruction */}
      {randomNumber !== null && !isRevealing && (
          <Animated.View style={{ opacity: 1, marginTop: Design.spacing.lg }}>
            <Text 
              fontSize={Design.typography.sizes.sm} 
              color={Design.colors.text.secondary} 
              textAlign="center"
            >
            Tap "Roll Again" for a new number! 🎲
          </Text>
        </Animated.View>
      )}
      </ScrollView>

      {/* Confetti celebration */}
      {showConfetti && (
        <ConfettiCannon
          count={80}
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
