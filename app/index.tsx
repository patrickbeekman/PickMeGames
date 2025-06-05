import { Button } from '@tamagui/button';
import { Text } from '@tamagui/core';
import { Image } from '@tamagui/image';
import { XStack, YStack } from '@tamagui/stacks';
import { LinearGradient } from 'expo-linear-gradient';
import { Link, useNavigation } from 'expo-router';
import { usePostHog } from 'posthog-react-native';
import { useEffect, useLayoutEffect } from 'react';
import { Linking, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function HomeScreen() {
  const navigation = useNavigation();

  useLayoutEffect(() => {
    navigation.setOptions({
      title: '',
    });
  }, [navigation]);

  const posthog = usePostHog();
  const options = [
    { title: 'Multifinger Tap', route: '/finger-tap', emoji: '👆' },
    { title: 'Spinner', route: '/spinner', emoji: '🌀' },
    { title: 'Numbered Spinner', route: '/numbered-spinner', emoji: '🍭' },
    { title: 'Random Number', route: '/random-number', emoji: '🎲' },
    { title: 'Prompted', route: '/prompted', emoji: '💭' },
  ];

  useEffect(() => {
    posthog.capture('entered_finger_tap');
  }, []);

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <YStack flex={1} backgroundColor="#F3E889">
        <LinearGradient
          colors={['#F3E889', '#FFE082', '#FFF9C4']}
          style={{ position: 'absolute', left: 0, right: 0, top: 0, bottom: -40 }}
        />
        <StatusBar barStyle="dark-content" backgroundColor="#F3E889" />
        
        <YStack flex={1} justifyContent="center" alignItems="center" padding={20}>
          {/* Logo */}
          <Image
            source={require('../assets/images/pickmelogo_transparent.png')}
            width={200}
            height={200}
            marginBottom={24}
            resizeMode="contain"
          />
          
          {/* Title */}
          <Text 
            fontSize={28} 
            color="#555" 
            fontWeight="bold" 
            textAlign="center" 
            marginBottom={32}
          >
            Choose your picker and let fate decide!
          </Text>

          {/* Game Options */}
          {options.map((opt) => (
            <Link href={opt.route as any} asChild key={opt.route}>
              <Button
                backgroundColor="#4CAF50"
                borderRadius={12}
                width={320}
                marginBottom={16}
                pressStyle={{ scale: 0.95, backgroundColor: "#45a049" }}
                shadowColor="#000123"
                shadowOpacity={0.12}
                shadowOffset={{ width: 0, height: 4 }}
                shadowRadius={8}
                elevation={3}
                padding={5}
              >
                <XStack alignItems="center" space={12} width="100%">
                  <Text fontSize={24}>{opt.emoji}</Text>
                  <Text color="white" fontSize={18} fontWeight="600" flex={1} textAlign="left">
                    {opt.title}
                  </Text>
                  <Text color="white" fontSize={16}>→</Text>
                </XStack>
              </Button>
            </Link>
          ))}
        </YStack>
        
        {/* Bottom Buttons */}
        <XStack justifyContent="center" marginTop={12} paddingHorizontal={20} gap={10} paddingBottom={20}>
          <Button
            flex={1}
            backgroundColor="#FFD700"
            borderRadius={12}
            padding={5}
            pressStyle={{ scale: 0.95, backgroundColor: "#e6c200" }}
            onPress={() => Linking.openURL('https://www.buymeacoffee.com/pickmegames')}
          >
            <XStack alignItems="center" justifyContent="center" space={6}>
              <Text fontSize={16}>☕</Text>
              <Text color="#333" fontWeight="bold" fontSize={14}>
                Buy Coffee
              </Text>
            </XStack>
          </Button>
          
          <Link href="/about" asChild>
            <Button
              flex={1}
              backgroundColor="#4CAF50"
              borderRadius={12}
              padding={5}
              pressStyle={{ scale: 0.95, backgroundColor: "#45a049" }}
            >
              <XStack alignItems="center" justifyContent="center" space={6}>
                <Text fontSize={16}>ℹ️</Text>
                <Text color="white" fontWeight="bold" fontSize={14}>
                  About
                </Text>
              </XStack>
            </Button>
          </Link>
        </XStack>
      </YStack>
    </SafeAreaView>
  );
}
