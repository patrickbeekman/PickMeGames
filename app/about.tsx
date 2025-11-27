// app/about.tsx
import { Button } from '@tamagui/button';
import { Text } from '@tamagui/core';
import { Image } from '@tamagui/image';
import { XStack, YStack } from '@tamagui/stacks';
import Constants from 'expo-constants';
import { LinearGradient } from 'expo-linear-gradient';
import { Linking } from 'react-native';

export default function AboutScreen() {
  const openGitHub = () => {
    Linking.openURL('https://github.com/patrickbeekman/PickMeGames/tree/master');
  };

  const openFeedback = () => {
    Linking.openURL('https://airtable.com/appPI2noUjKkmeNWM/pagrjCubfIJqODIOQ/form');
  };

  return (
    <YStack flex={1} backgroundColor="#F3E889" padding={24}>
      <LinearGradient
        colors={['#F3E889', '#FFE082', '#FFF9C4']}
        style={{ position: 'absolute', left: 0, right: 0, top: 0, bottom: 0 }}
      />
      
      <YStack flex={1} justifyContent="center" alignItems="center" space={20}>
        {/* Hero Section */}
        <YStack alignItems="center" space={12} marginBottom={15}>
          <YStack
            width={80}
            height={80}
            borderRadius={40}
            backgroundColor="#4CAF50"
            alignItems="center"
            justifyContent="center"
            padding={8}
          >
            <Image
              source={require('../assets/images/pickmelogo_transparent.png')}
              width={80}
              height={80}
              resizeMode="contain"
            />
          </YStack>
          
          <Text fontSize={32} fontWeight="800" color="#1A1A1A" textAlign="center">
            PickMe Games
          </Text>
          
          <Text fontSize={18} color="#4A4A4A" textAlign="center" maxWidth={280}>
            Making decisions fun, one game at a time
          </Text>
        </YStack>

        {/* Info Cards */}
        <YStack space={12} width="100%" maxWidth={320}>
          <YStack
            padding={16}
            backgroundColor="rgba(255,255,255,0.9)"
            borderRadius={12}
          >
            <XStack alignItems="center" space={12}>
              <YStack
                width={40}
                height={40}
                borderRadius={20}
                backgroundColor="#1976D2"
                alignItems="center"
                justifyContent="center"
              >
                <Text fontSize={20}>⭐</Text>
              </YStack>
              <YStack flex={1}>
                <Text fontWeight="600" fontSize={16}>Version {Constants.expoConfig?.version ?? '1.0.0'}</Text>
                <Text color="#4A4A4A" fontSize={14}>Latest & Greatest</Text>
              </YStack>
            </XStack>
          </YStack>

          <YStack
            padding={16}
            backgroundColor="rgba(255,255,255,0.9)"
            borderRadius={12}
          >
            <XStack alignItems="center" space={12}>
              <YStack
                width={40}
                height={40}
                borderRadius={20}
                backgroundColor="#F57C00"
                alignItems="center"
                justifyContent="center"
              >
                <Text fontSize={20}>⚡</Text>
              </YStack>
              <YStack flex={1}>
                <Text fontWeight="600" fontSize={16}>Created by Patrick Beekman</Text>
                <Text color="#4A4A4A" fontSize={14}>With ❤️ for learning & fun</Text>
              </YStack>
            </XStack>
          </YStack>

          <YStack
            padding={16}
            backgroundColor="rgba(255,255,255,0.9)"
            borderRadius={12}
          >
            <XStack alignItems="center" space={12}>
              <YStack
                width={40}
                height={40}
                borderRadius={20}
                backgroundColor="#4CAF50"
                alignItems="center"
                justifyContent="center"
              >
                <Text fontSize={20}>❤️</Text>
              </YStack>
              <YStack flex={1}>
                <Text fontWeight="600" fontSize={16}>No Ads. Just Games.</Text>
                <Text color="#4A4A4A" fontSize={14}>Pure fun experience</Text>
              </YStack>
            </XStack>
          </YStack>
        </YStack>

        {/* Action Buttons */}
        <YStack space={12} width="100%" maxWidth={320} marginTop={32}>
          <Button
            backgroundColor="#333"
            borderRadius={8}
            pressStyle={{ scale: 0.95, backgroundColor: "#555" }}
            onPress={openGitHub}
          >
            <XStack alignItems="center" space={8}>
              <Text fontSize={18}>⚙️</Text>
              <Text color="white" fontWeight="600" fontSize={16}>View on GitHub</Text>
              <Text color="white" fontSize={16}>→</Text>
            </XStack>
          </Button>

          <Button
            backgroundColor="#4CAF50"
            borderRadius={8}
            pressStyle={{ scale: 0.95, backgroundColor: "#45a049" }}
            onPress={openFeedback}
          >
            <XStack alignItems="center" space={8}>
              <Text fontSize={18}>💬</Text>
              <Text color="white" fontWeight="600" fontSize={16}>Send Feedback</Text>
              <Text color="white" fontSize={16}>→</Text>
            </XStack>
          </Button>
        </YStack>

        {/* Footer */}
        <YStack alignItems="center" marginTop={10} marginBottom={30}>
          <Text fontSize={12} color="#6B6B6B" textAlign="center">
            Made with React Native & Tamagui
          </Text>
          <Text fontSize={12} color="#6B6B6B" textAlign="center">
            Open source • MIT License
          </Text>
        </YStack>
      </YStack>
    </YStack>
  );
}
