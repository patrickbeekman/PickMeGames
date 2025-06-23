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

  const nextPrompt = () => {
    if (filteredPrompts.length === 0) return;
    // Animate out
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 0.8,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => {
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
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          easing: Easing.bounce,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 300,
          easing: Easing.bounce,
          useNativeDriver: true,
        }),
      ]).start();
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

      {/* Settings Button - positioned in top right */}
      <Link href="/prompt-settings" asChild>
        <Button
          position="absolute"
          top={10}
          right={20}
          backgroundColor="rgba(255,255,255,0.9)"
          borderRadius={15}
          width={60}
          height={60}
          pressStyle={{ scale: 0.95, backgroundColor: "rgba(255,255,255,1)" }}
          shadowColor="#000"
          shadowOpacity={0.15}
          shadowOffset={{ width: 0, height: 4 }}
          shadowRadius={8}
          elevation={4}
          borderWidth={2}
          borderColor="#4CAF50"
          zIndex={20}
        >
          <Text fontSize={20}>⚙️</Text>
        </Button>
      </Link>

      {/* Header with emojis */}
      <YStack alignItems="center" marginBottom={40}>
        <Text fontSize={40} marginBottom={16}>✨💭✨</Text>
        <Text fontSize={20} fontWeight="700" color="#333" textAlign="center" marginBottom={8}>
          Decision Prompt Challenge!
        </Text>
        <Text fontSize={14} color="#666" textAlign="center" maxWidth={300}>
          Get a random prompt to help make your decision!
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
