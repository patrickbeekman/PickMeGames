import { Text } from '@tamagui/core';
import { XStack, YStack } from '@tamagui/stacks';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { Link, useNavigation } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { AccessibilityInfo, Animated, Easing, Pressable, ScrollView, StyleSheet } from 'react-native';
import { Design } from '../constants/Design';
import { useAnalytics } from '../hooks/useAnalytics';
import { usePrompts } from '../hooks/usePrompts';

export default function PromptSelector() {
  const navigation = useNavigation();
  const { capture } = useAnalytics();
  const { getFilteredPrompts, loading } = usePrompts();
  const [filteredPrompts, setFilteredPrompts] = useState<string[]>([]);
  const [usedPrompts, setUsedPrompts] = useState<Set<number>>(new Set());
  const [currentIndex, setCurrentIndex] = useState(0);
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const headerFadeAnim = useRef(new Animated.Value(0)).current;
  const headerSlideAnim = useRef(new Animated.Value(20)).current;
  const buttonFadeAnim = useRef(new Animated.Value(0)).current;
  const buttonSlideAnim = useRef(new Animated.Value(30)).current;
  const cardFadeAnim = useRef(new Animated.Value(0)).current;
  const cardSlideAnim = useRef(new Animated.Value(20)).current;

  // Load filtered prompts when component mounts or when returning from settings - FIX: Add loading guard
  useEffect(() => {
    let isMounted = true;
    const loadFilteredPrompts = async () => {
      if (loading) return;
      try {
        const filtered = await getFilteredPrompts();
        if (!isMounted) return;
        setFilteredPrompts(filtered);
        setUsedPrompts(new Set());
        if (filtered.length > 0) {
          setCurrentIndex(Math.floor(Math.random() * filtered.length));
        }
      } catch (error) {
        console.log('Error loading filtered prompts:', error);
      }
    };
    loadFilteredPrompts();
    const unsubscribe = navigation.addListener('focus', () => {
      if (!loading) {
        loadFilteredPrompts();
      }
    });
    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, [navigation, loading]); // getFilteredPrompts is stable, so not needed in deps

  useEffect(() => {
    navigation.setOptions({
      headerTitle: 'Prompted',
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
    // Only capture once when component mounts and prompts are loaded
    if (!loading && filteredPrompts.length > 0) {
      capture('enter_prompt_selector');
    }
  }, [capture, loading, filteredPrompts.length]);

  // Entrance animations
  useEffect(() => {
    if (!loading && filteredPrompts.length > 0) {
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
    }
  }, [loading, filteredPrompts.length]);

  // Store animation refs for cleanup
  const animationRefs = useRef<Animated.CompositeAnimation[]>([]);

  // Cleanup animations on unmount
  useEffect(() => {
    return () => {
      animationRefs.current.forEach((anim) => {
        anim.stop();
      });
      animationRefs.current = [];
    };
  }, []);

  const nextPrompt = () => {
    if (filteredPrompts.length === 0) return;
    
    // Haptic feedback on press
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    
    // Stop any running animations
    animationRefs.current.forEach((anim) => {
      anim.stop();
    });
    animationRefs.current = [];
    
    // Animate out
    const fadeOutAnim = Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 200,
      useNativeDriver: true,
    });
    const scaleOutAnim = Animated.timing(scaleAnim, {
      toValue: 0.8,
      duration: 200,
      useNativeDriver: true,
    });
    
    const outAnimation = Animated.parallel([fadeOutAnim, scaleOutAnim]);
    animationRefs.current.push(outAnimation);
    
    outAnimation.start(() => {
      // Mark current prompt as used
      const newUsedPrompts = new Set(usedPrompts);
      newUsedPrompts.add(currentIndex);

      // If all prompts have been used, reset the used prompts list
      if (newUsedPrompts.size >= filteredPrompts.length) {
        newUsedPrompts.clear();
        newUsedPrompts.add(currentIndex);
      }

      setUsedPrompts(newUsedPrompts);

      // Find available prompts (not yet used)
      const availablePrompts = filteredPrompts
        .map((_, index) => index)
        .filter(index => !newUsedPrompts.has(index));

      // Select random prompt from available ones
      const next = availablePrompts[Math.floor(Math.random() * availablePrompts.length)];
      setCurrentIndex(next);

      // Animate in
      const fadeInAnim = Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        easing: Easing.bounce,
        useNativeDriver: true,
      });
      const scaleInAnim = Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 300,
        easing: Easing.bounce,
        useNativeDriver: true,
      });
      
      const inAnimation = Animated.parallel([fadeInAnim, scaleInAnim]);
      animationRefs.current.push(inAnimation);
      inAnimation.start(() => {
        // Haptic feedback on new prompt
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        // Screen reader announcement
        const newPrompt = filteredPrompts[next];
        AccessibilityInfo.announceForAccessibility(`New prompt: ${newPrompt}`);
        // Remove completed animations from refs
        animationRefs.current = animationRefs.current.filter(anim => anim !== inAnimation);
      });
    });

    capture('prompt_changed', {
      fromIndex: currentIndex,
      totalUsedPrompts: usedPrompts.size + 1,
      totalAvailablePrompts: filteredPrompts.length,
    });
  };

  const currentPrompt = filteredPrompts.length > 0 ? filteredPrompts[currentIndex] : "No prompts available. Add some in settings!";

  if (loading) {
    return (
      <YStack flex={1} backgroundColor={Design.colors.background.light} alignItems="center" justifyContent="center">
        <LinearGradient
          colors={[Design.colors.background.light, Design.colors.background.medium, Design.colors.background.lightest]}
          locations={[0, 0.5, 1]}
          style={StyleSheet.absoluteFillObject}
        />
        <Text fontSize={Design.typography.sizes.lg} color={Design.colors.text.primary}>Loading prompts...</Text>
      </YStack>
    );
  }

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

        {/* Header with emojis */}
        <Animated.View
          style={{
            opacity: headerFadeAnim,
            transform: [{ translateY: headerSlideAnim }],
            alignItems: 'center',
            marginBottom: Design.spacing.xl,
          }}
        >
          <YStack alignItems="center">
            <Text fontSize={Design.typography.sizes.xxxl} marginBottom={Design.spacing.md}>✨💭✨</Text>
            <Text 
              fontSize={Design.typography.sizes.xl} 
              fontWeight={Design.typography.weights.bold} 
              color={Design.colors.text.primary} 
              textAlign="center" 
              marginBottom={Design.spacing.sm}
              letterSpacing={Design.typography.letterSpacing.tight}
              accessibilityRole="header"
            >
              Decision Prompt Challenge!
            </Text>
            <Text 
              fontSize={Design.typography.sizes.sm} 
              color={Design.colors.text.secondary} 
              textAlign="center" 
              maxWidth={300}
              lineHeight={Design.typography.sizes.sm * 1.4}
            >
              Get a random prompt to help make your decision! 
              Tap "New Prompt" for another idea.
            </Text>
          </YStack>
        </Animated.View>

        {/* Enhanced Prompt Display */}
        <Animated.View
          style={{
            opacity: fadeAnim,
            transform: [
              { scale: scaleAnim },
              { translateY: cardSlideAnim },
            ],
            width: '100%',
            maxWidth: 360,
            marginBottom: Design.spacing.lg,
          }}
        >
          <YStack
            backgroundColor="rgba(255,255,255,0.95)"
            borderRadius={Design.borderRadius.xl}
            padding={Design.spacing.xl}
            marginVertical={Design.spacing.lg}
            minHeight={200}
            justifyContent="center"
            alignItems="center"
            {...Design.shadows.lg}
            borderWidth={3}
            borderColor={Design.colors.primary}
          >
            <Text 
              fontSize={Design.typography.sizes.xl} 
              color={Design.colors.text.primary} 
              textAlign="center" 
              fontWeight={Design.typography.weights.medium} 
              lineHeight={Design.typography.sizes.xl * 1.4}
              accessibilityRole="text"
              accessibilityLabel={`Current prompt: ${currentPrompt}`}
            >
              {currentPrompt}
            </Text>
          </YStack>
        </Animated.View>

        {/* Call to action for custom prompts */}
        <Animated.View
          style={{
            opacity: buttonFadeAnim,
            transform: [{ translateY: buttonSlideAnim }],
            width: '100%',
            maxWidth: 360,
            marginBottom: Design.spacing.md,
          }}
        >
          <Link href="/prompt-settings" asChild>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Add custom prompts"
              accessibilityHint="Opens settings to add or manage custom prompts"
              style={({ pressed }) => [
                {
                  borderRadius: Design.borderRadius.lg,
                  overflow: 'hidden',
                  backgroundColor: '#FFFFFF',
                  borderWidth: 2,
                  borderColor: Design.colors.accent.orange,
                  ...Design.shadows.md,
                  transform: [{ scale: pressed ? Design.pressScale.md : 1 }],
                },
              ]}
            >
              <LinearGradient
                colors={['#FFF3E0', '#FFE0B2', '#FFCC80']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={{
                  paddingVertical: Design.spacing.md,
                  paddingHorizontal: Design.spacing.xl,
                  borderRadius: Design.borderRadius.lg,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <XStack alignItems="center" gap={Design.spacing.sm}>
                  <Text fontSize={Design.typography.sizes.md}>➕</Text>
                  <Text 
                    fontSize={Design.typography.sizes.md} 
                    color={Design.colors.accent.orange} 
                    fontWeight={Design.typography.weights.bold}
                  >
                    Add Custom Prompts
                  </Text>
                </XStack>
              </LinearGradient>
            </Pressable>
          </Link>
          <Text 
            fontSize={Design.typography.sizes.xs} 
            color={Design.colors.text.tertiary} 
            marginTop={Design.spacing.xs} 
            textAlign="center" 
            maxWidth={260}
          >
            Manage your prompts anytime from this page.
          </Text>
        </Animated.View>

        {/* Enhanced Button */}
        <Animated.View
          style={{
            opacity: buttonFadeAnim,
            transform: [{ translateY: buttonSlideAnim }],
            width: '100%',
            maxWidth: 360,
            marginTop: Design.spacing.lg,
            marginBottom: Design.spacing.md,
          }}
        >
          <Pressable
            onPress={nextPrompt}
            accessibilityRole="button"
            accessibilityLabel="Get new prompt"
            accessibilityHint="Generates a new random prompt to help decide who goes first"
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
              colors={[Design.colors.primary, Design.colors.primaryDark, '#3d8b40']}
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
                <Text fontSize={Design.typography.sizes.xl}>🎲</Text>
                <Text 
                  fontSize={Design.typography.sizes.lg + 2} 
                  color={Design.colors.text.white} 
                  fontWeight={Design.typography.weights.bold}
                  letterSpacing={Design.typography.letterSpacing.wide}
                >
                  New Prompt
                </Text>
              </XStack>
            </LinearGradient>
          </Pressable>
        </Animated.View>

        {/* Prompt counter */}
        <Animated.View
          style={{
            opacity: buttonFadeAnim,
            transform: [{ translateY: buttonSlideAnim }],
            width: '100%',
            maxWidth: 360,
            marginTop: Design.spacing.lg,
          }}
        >
          <YStack 
            alignItems="center" 
            backgroundColor="rgba(76, 175, 80, 0.1)"
            borderRadius={Design.borderRadius.lg}
            padding={Design.spacing.md}
            {...Design.shadows.sm}
          >
            <Text 
              fontSize={Design.typography.sizes.sm} 
              color={Design.colors.text.secondary} 
              textAlign="center" 
              fontWeight={Design.typography.weights.medium}
            >
              💡 Prompt {usedPrompts.size + 1} of {filteredPrompts.length}
            </Text>
            {usedPrompts.size >= filteredPrompts.length - 1 && (
              <Text 
                fontSize={Design.typography.sizes.xs} 
                color={Design.colors.text.tertiary} 
                textAlign="center" 
                marginTop={Design.spacing.xs}
              >
                Next prompt will reset the cycle
              </Text>
            )}
          </YStack>
        </Animated.View>
      </ScrollView>
    </YStack>
  );
}
