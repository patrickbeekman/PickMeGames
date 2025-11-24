import { Button } from '@tamagui/button';
import { Text } from '@tamagui/core';
import { YStack } from '@tamagui/stacks';
import { LinearGradient } from 'expo-linear-gradient';
import { Link, useNavigation } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { Animated, Easing } from 'react-native';
import { useAnalytics } from '../hooks/useAnalytics';
import { usePrompts } from '../hooks/usePrompts';

export default function PromptSelector() {
  const navigation = useNavigation();
  const { capture, isReady } = useAnalytics();
  const { getFilteredPrompts, loading } = usePrompts();
  const [filteredPrompts, setFilteredPrompts] = useState<string[]>([]);
  const [usedPrompts, setUsedPrompts] = useState<Set<number>>(new Set());
  const [currentIndex, setCurrentIndex] = useState(0);
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;

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
      headerTitle: 'Prompt Selector',
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
    // Only capture once when component mounts and prompts are loaded
    if (isReady && !loading && filteredPrompts.length > 0) {
      capture('enter_prompt_selector');
    }
  }, [capture, isReady, loading, filteredPrompts.length]);

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
      <YStack flex={1} backgroundColor="#F3E889" alignItems="center" justifyContent="center">
        <LinearGradient
          colors={['#F3E889', '#FFE082', '#FFF9C4']}
          style={{ position: 'absolute', left: 0, right: 0, top: 0, bottom: 0 }}
        />
        <Text fontSize={18} color="#333">Loading prompts...</Text>
      </YStack>
    );
  }

  return (
    <YStack flex={1} backgroundColor="#F3E889" alignItems="center" justifyContent="center" padding={20}>
      <LinearGradient
        colors={['#F3E889', '#FFE082', '#FFF9C4']}
        style={{ position: 'absolute', left: 0, right: 0, top: 0, bottom: 0 }}
      />

      {/* Header with emojis */}
      <YStack alignItems="center" marginBottom={40}>
        <Text fontSize={40} marginBottom={16}>✨💭✨</Text>
        <Text fontSize={20} fontWeight="700" color="#333" textAlign="center" marginBottom={8}>
          Decision Prompt Challenge!
        </Text>
        <Text fontSize={14} color="#666" textAlign="center" maxWidth={300}>
          Get a random prompt to help make your decision! 
          Tap "New Prompt" for another idea.
        </Text>
      </YStack>

      {/* Enhanced Prompt Display */}
      <Animated.View
        style={{
          transform: [{ scale: scaleAnim }],
          opacity: fadeAnim,
        }}
      >
        <YStack
          backgroundColor="rgba(255,255,255,0.95)"
          borderRadius={20}
          padding={30}
          marginVertical={20}
          maxWidth="90%"
          minHeight={200}
          justifyContent="center"
          alignItems="center"
          shadowColor="#000"
          shadowOpacity={0.15}
          shadowOffset={{ width: 0, height: 8 }}
          shadowRadius={16}
          elevation={8}
          borderWidth={3}
          borderColor="#4CAF50"
        >
          <Text fontSize={22} color="#333" textAlign="center" fontWeight="500" lineHeight={32}>
            {currentPrompt}
          </Text>
        </YStack>
      </Animated.View>

      {/* Call to action for custom prompts */}
      <YStack alignItems="center" marginTop={12} marginBottom={12}>
        <Link href="/prompt-settings" asChild>
          <Button
            backgroundColor="#FFF3E0"
            borderRadius={28}
            paddingHorizontal={32}
            paddingVertical={12}
            marginTop={8}
            borderWidth={2}
            borderColor="#FF9800"
            pressStyle={{ scale: 0.97, backgroundColor: "#FFE0B2" }}
            size="$4"
            elevation={4}
            shadowColor="#FF9800"
            shadowOpacity={0.15}
            shadowOffset={{ width: 0, height: 4 }}
            shadowRadius={10}
          >
            <Text fontSize={15} color="#FF9800" fontWeight="bold">
              ➕ Add Custom Prompts
            </Text>
          </Button>
        </Link>
        <Text fontSize={12} color="#888" marginTop={6} textAlign="center" maxWidth={260}>
          Manage your prompts anytime from this page.
        </Text>
      </YStack>

      {/* Enhanced Button */}
      <Button
        backgroundColor="#4CAF50"
        borderRadius={50}
        paddingHorizontal={40}
        paddingVertical={5}
        pressStyle={{ scale: 0.95, backgroundColor: "#45a049" }}
        shadowColor="#000"
        shadowOpacity={0.2}
        shadowOffset={{ width: 0, height: 6 }}
        shadowRadius={12}
        elevation={8}
        onPress={nextPrompt}
        marginTop={20}
        accessibilityLabel="Get a new random prompt"
      >
        <Text fontSize={20} color="white" fontWeight="bold">
          🎲 New Prompt
        </Text>
      </Button>

      {/* Prompt counter */}
      <YStack 
        alignItems="center" 
        marginTop={20}
        backgroundColor="rgba(76, 175, 80, 0.1)"
        borderRadius={16}
        padding={16}
      >
        <Text fontSize={14} color="#666" textAlign="center" fontWeight="500">
          💡 Prompt {usedPrompts.size + 1} of {filteredPrompts.length}
        </Text>
        {usedPrompts.size >= filteredPrompts.length - 1 && (
          <Text fontSize={12} color="#999" textAlign="center" marginTop={4}>
            Next prompt will reset the cycle
          </Text>
        )}
      </YStack>

    </YStack>
  );
}
