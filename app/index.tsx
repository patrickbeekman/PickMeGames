import { Button } from '@tamagui/button';
import { styled, Text } from '@tamagui/core';
import { Image } from '@tamagui/image';
import { YStack as TamaguiYStack } from '@tamagui/stacks';
import { Link, useNavigation } from 'expo-router';
import { usePostHog } from 'posthog-react-native';
import { useEffect, useLayoutEffect } from 'react';
import { Linking, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';


const YStack = styled(TamaguiYStack, {
  flexDirection: 'column',
});

const XStack = styled(TamaguiYStack, {
  flexDirection: 'row',
});

export default function HomeScreen() {
  const navigation = useNavigation();

  useLayoutEffect(() => {
    navigation.setOptions({
      title: '',
    });
  }, [navigation]);

  const posthog = usePostHog();
  const options = [
    { title: 'Multifinger Tap', route: '/finger-tap' },
    { title: 'Spinner', route: '/spinner' },
    { title: 'Numbered Spinner', route: '/numbered-spinner' },
    { title: 'Random Number', route: '/random-number' },
    { title: 'Prompted', route: '/prompted' },
  ];

  useEffect(() => {
      posthog.capture('entered_finger_tap');
    }, []);

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <YStack flex={1} backgroundColor="#F3E889">
        <StatusBar barStyle="dark-content" backgroundColor="#F3E889" />
        <YStack flex={1} justifyContent="center" alignItems="center" padding={20}>
          <Image
            source={require('../assets/images/pickmelogo_transparent.png')}
            width={200}
            height={200}
            marginBottom={24}
            resizeMode="contain"
          />
          <Text 
            fontSize={28} 
            color="#555" 
            fontWeight="bold" 
            textAlign="center" 
            marginBottom={32}
          >
            Select a method to pick Player 1
          </Text>
      {options.map((opt) => (
        <Link href={opt.route as any} asChild key={opt.route}>
          <Button
            size="$5"
            theme="green"
            backgroundColor="#4CAF50"
            borderRadius={12}
            width={280}
            marginBottom={20}
            pressStyle={{ scale: 0.95, backgroundColor: "#45a049" }}
            shadowColor="#000123"
            shadowOpacity={0.12}
            shadowOffset={{ width: 0, height: 10 }}
            shadowRadius={8}
            elevation={3}
          >
            <Text color="white" fontSize={18}>{opt.title}</Text>
          </Button>
        </Link>
      ))}
      </YStack>
      <XStack justifyContent="center" marginTop={25} paddingHorizontal={20} gap={10}>
          <Button
            flex={1}
            backgroundColor="#FFD700"
            borderRadius={12}
            pressStyle={{ scale: 0.95, backgroundColor: "#e6c200" }}
            onPress={() => Linking.openURL('https://www.buymeacoffee.com/pickmegames')}
          >
            <Text color="#333" fontWeight="bold" fontSize={16}>Buy me a coffee</Text>
          </Button>
          
          <Link href="/about" asChild>
            <Button
              flex={1}
              theme="green"
              backgroundColor="#4CAF50"
              borderRadius={12}
              pressStyle={{ scale: 0.95, backgroundColor: "#45a049" }}
            >
              <Text color="white" fontWeight="bold" fontSize={16}>About</Text>
            </Button>
          </Link>
        </XStack>
    </YStack>
    </SafeAreaView>
  );
}
