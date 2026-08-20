// app/about.tsx
import { Button } from '@tamagui/button';
import { Text } from '@tamagui/core';
import { Image } from '@tamagui/image';
import { XStack, YStack } from '@tamagui/stacks';
import Constants from 'expo-constants';
import { LinearGradient } from 'expo-linear-gradient';
import { Linking } from 'react-native';
import { Design } from '../constants/Design';
import { useGameScreenHeader } from '../hooks/useGameScreenHeader';

export default function AboutScreen() {
  useGameScreenHeader('About');
  const openGitHub = () => {
    Linking.openURL('https://github.com/patrickbeekman/PickMeGames/tree/master');
  };

  return (
    <YStack flex={1} backgroundColor={Design.colors.background.light} padding={24}>
      <LinearGradient
        colors={[Design.colors.background.light, '#FFE082', '#FFF9C4']}
        style={{ position: 'absolute', left: 0, right: 0, top: 0, bottom: 0 }}
      />
      
      <YStack flex={1} justifyContent="center" alignItems="center" space={20}>
        {/* Hero Section */}
        <YStack alignItems="center" space={12} marginBottom={15}>
          <YStack
            width={80}
            height={80}
            borderRadius={40}
            backgroundColor={Design.colors.primary}
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
          
          <Text fontSize={32} fontWeight="800" color={Design.colors.text.primary} textAlign="center">
            PickMe Games
          </Text>
          
          <Text fontSize={18} color={Design.colors.text.secondary} textAlign="center" maxWidth={280}>
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
                backgroundColor={Design.colors.accent.blue}
                alignItems="center"
                justifyContent="center"
              >
                <Text fontSize={20}>⭐</Text>
              </YStack>
              <YStack flex={1}>
                <Text fontWeight="600" fontSize={16}>Version {Constants.expoConfig?.version ?? '1.1.0'}</Text>
                <Text color={Design.colors.text.secondary} fontSize={14}>Latest & Greatest</Text>
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
                backgroundColor={Design.colors.accent.orange}
                alignItems="center"
                justifyContent="center"
              >
                <Text fontSize={20}>⚡</Text>
              </YStack>
              <YStack flex={1}>
                <Text fontWeight="600" fontSize={16}>Created by Patrick Beekman</Text>
                <Text color={Design.colors.text.secondary} fontSize={14}>With ❤️ for learning & fun</Text>
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
                backgroundColor={Design.colors.primary}
                alignItems="center"
                justifyContent="center"
              >
                <Text fontSize={20}>❤️</Text>
              </YStack>
              <YStack flex={1}>
                <Text fontWeight="600" fontSize={16}>No Ads. Just Games.</Text>
                <Text color={Design.colors.text.secondary} fontSize={14}>Pure fun experience</Text>
              </YStack>
            </XStack>
          </YStack>
        </YStack>

        {/* Action Buttons */}
        <YStack space={12} width="100%" maxWidth={320} marginTop={32}>
          <Button
            backgroundColor={Design.colors.text.primary}
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

        </YStack>

        {/* Footer */}
        <YStack alignItems="center" marginTop={10} marginBottom={30}>
          <Text fontSize={12} color={Design.colors.text.tertiary} textAlign="center">
            Made with React Native & Tamagui
          </Text>
          <Text fontSize={12} color={Design.colors.text.tertiary} textAlign="center">
            Open source • MIT License
          </Text>
        </YStack>
      </YStack>
    </YStack>
  );
}
