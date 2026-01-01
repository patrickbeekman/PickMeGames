import Slider from '@react-native-community/slider';
import { Text } from '@tamagui/core';
import { Image } from '@tamagui/image';
import { XStack, YStack } from '@tamagui/stacks';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from 'expo-router';
import { useEffect, useMemo, useRef, useState } from 'react';
import { AccessibilityInfo, Animated, Easing, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { Design } from '../constants/Design';
import { useAnalytics } from '../hooks/useAnalytics';

export default function NumberGuesser() {
  const navigation = useNavigation();
  const { capture } = useAnalytics();
  const [randomNumber, setRandomNumber] = useState<number | null>(null);
  const [isRevealing, setIsRevealing] = useState(false);
  const [animatedNumber, setAnimatedNumber] = useState('?');
  
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
  const revealTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Quick preset ranges
  const PRESET_RANGES = [
    { label: '🎲 D6', min: 1, max: 6 },
    { label: '🎲 D8', min: 1, max: 8 },
    { label: '🎲 D10', min: 1, max: 10 },
    { label: '🎯 D12', min: 1, max: 12 },
    { label: '🎯 D20', min: 1, max: 20 },
    { label: '🔢 1-100', min: 1, max: 100 },
    { label: '🎪 1-1K', min: 1, max: 1000 },
    { label: '🌟 1-10K', min: 1, max: 10000 },
    { label: '💫 1-100K', min: 1, max: 100000 },
    { label: '🚀 1-1M', min: 1, max: 1000000 },
  ];

  const [minNumber, setMinNumber] = useState(1);
  const [maxNumber, setMaxNumber] = useState(100);
  const [selectedPreset, setSelectedPreset] = useState<number>(5); // Default to 1-100 (index 5 in new array)

  // Handle slider change
  const handleSliderChange = (value: number) => {
    const presetIndex = Math.round(value);
    const preset = PRESET_RANGES[presetIndex];
    setMinNumber(preset.min);
    setMaxNumber(preset.max);
    setSelectedPreset(presetIndex);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

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


  const revealNumber = () => {
    if (isRevealing) return;
    if (minNumber >= maxNumber) return; // Validate range
    
    // Clear any pending timeout
    if (revealTimeoutRef.current) {
      clearTimeout(revealTimeoutRef.current);
      revealTimeoutRef.current = null;
    }
    
    // Haptic feedback on press
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    
    // Generate random number immediately
    const range = maxNumber - minNumber + 1;
    const newNumber = Math.floor(Math.random() * range) + minNumber;
    const newNumberStr = String(newNumber);
    
    // Reset state for new roll
    setRandomNumber(null);
    setAnimatedNumber('?');
    setIsRevealing(true);
    
    // Start spinning animation
    rotateAnim.setValue(0);
    Animated.timing(rotateAnim, {
      toValue: 1,
      duration: 800,
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

    // Simple reveal after short delay
    revealTimeoutRef.current = setTimeout(() => {
      setRandomNumber(newNumber);
      setAnimatedNumber(newNumberStr);
      setIsRevealing(false);
      revealTimeoutRef.current = null;
      
      // Haptic feedback on completion
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      
      // Screen reader announcement
      AccessibilityInfo.announceForAccessibility(`Random number revealed: ${newNumber.toLocaleString()}`);
      
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
    }, 800);

    capture('number_revealed', {
      randomNumber: newNumber,
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

      return () => {
        pulseAnimation.stop();
        pulseAnim.setValue(1);
      };
    }
  }, [isRevealing]);

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

        {/* Range Selector Slider */}
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
            <Text
              fontSize={Design.typography.sizes.md}
              fontWeight={Design.typography.weights.semibold}
              color={Design.colors.text.primary}
              textAlign="center"
              marginBottom={Design.spacing.xs}
            >
              Select Range
            </Text>
            <Text
              fontSize={Design.typography.sizes.sm}
              color={Design.colors.text.secondary}
              textAlign="center"
              marginBottom={Design.spacing.md}
            >
              {PRESET_RANGES[selectedPreset].label}: {minNumber.toLocaleString()} - {maxNumber.toLocaleString()}
            </Text>
            <View style={{ width: '100%', paddingHorizontal: Design.spacing.xs, position: 'relative', marginBottom: Design.spacing.xs }}>
              {/* Visual notches for each preset */}
              <View style={{ position: 'absolute', top: 16, left: Design.spacing.xs, right: Design.spacing.xs, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', pointerEvents: 'none', zIndex: 1 }}>
                {PRESET_RANGES.map((_, index) => (
                  <View
                    key={index}
                    style={{
                      width: 2,
                      height: 8,
                      backgroundColor: index === selectedPreset ? Design.colors.primary : '#D0D0D0',
                      borderRadius: 1,
                    }}
                  />
                ))}
              </View>
              <Slider
                minimumValue={0}
                maximumValue={PRESET_RANGES.length - 1}
                step={1}
                value={selectedPreset}
                onValueChange={handleSliderChange}
                disabled={isRevealing}
                style={{ width: '100%', height: 40 }}
                minimumTrackTintColor={Design.colors.primary}
                maximumTrackTintColor="#E0E0E0"
                thumbTintColor={Design.colors.primary}
              />
            </View>
            <XStack justifyContent="space-between" width="100%" paddingHorizontal={Design.spacing.xs} marginTop={Design.spacing.xs}>
              <Text fontSize={Design.typography.sizes.xs} color={Design.colors.text.tertiary}>
                {PRESET_RANGES[0].label}
              </Text>
              <Text fontSize={Design.typography.sizes.xs} color={Design.colors.text.tertiary}>
                {PRESET_RANGES[PRESET_RANGES.length - 1].label}
              </Text>
            </XStack>
          </YStack>
        </Animated.View>



      
      {/* Animated number display */}
      <Animated.View
        style={{
          width: '100%',
          maxWidth: 360,
          marginBottom: Design.spacing.xl,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Animated.View
          style={{
            transform: [
              { scale: Animated.multiply(scaleAnim, pulseAnim) },
              { rotate: spin },
              { translateY: bounce }
            ],
            width: '100%',
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

      </ScrollView>
    </YStack>
  );
}
