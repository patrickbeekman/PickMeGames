import { Button } from '@tamagui/button';
import { Text } from '@tamagui/core';
import { YStack } from '@tamagui/stacks';
import { useNavigation } from 'expo-router';
import { usePostHog } from 'posthog-react-native';
import React, { useEffect, useState } from 'react';

export default function NumberGuesser() {
  const navigation = useNavigation();
  const posthog = usePostHog();
  const [randomNumber, setRandomNumber] = useState<number | null>(null);
  const [isRevealing, setIsRevealing] = useState(false);
  const [animatedNumber, setAnimatedNumber] = useState('?');

  useEffect(() => {
    navigation.setOptions({
      headerTitle: 'Number Guesser',
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
      posthog.capture('entered_number_guesser');
  }, []);

  const revealNumber = () => {
    if (isRevealing) return;
    setIsRevealing(true);
    posthog.capture('number_revealed', {
      randomNumber,
    });
  };

  useEffect(() => {
    if (isRevealing) {
      const interval = setInterval(() => {
        setAnimatedNumber(String(Math.floor(Math.random() * 100) + 1));
      }, 50);

      const timeout = setTimeout(() => {
        clearInterval(interval);
        const final = Math.floor(Math.random() * 100) + 1;
        setRandomNumber(final);
        setAnimatedNumber(String(final));
        setIsRevealing(false);
      }, 1000);

      return () => {
        clearInterval(interval);
        clearTimeout(timeout);
      };
    }
  }, [isRevealing]);

  return (
    <YStack flex={1} backgroundColor="#F3E889" alignItems="center" justifyContent="center" padding={20}>
      <Text fontSize={18} fontWeight="600" marginBottom={30} color="#444" textAlign="center">
        Everyone pick a number from 1 to 100.
        Closest guess without going over wins!
      </Text>
      
      <YStack
        width={150}
        height={150}
        borderRadius={12}
        backgroundColor="#fff"
        alignItems="center"
        justifyContent="center"
        elevation={4}
        shadowColor="#000"
        shadowOpacity={0.1}
        shadowOffset={{ width: 0, height: 2 }}
        shadowRadius={6}
        marginBottom={40}
      >
        <Text fontSize={48} fontWeight="bold" color="#333" textAlign="center">
          {isRevealing ? animatedNumber : randomNumber !== null ? randomNumber : '?'}
        </Text>
      </YStack>
      
      <Button
        backgroundColor="#4CAF50"
        borderRadius={999}
        pressStyle={{ scale: 0.95, backgroundColor: "#45a049" }}
        onPress={revealNumber}
        disabled={isRevealing}
      >
        <Text fontSize={18} color="white" fontWeight="bold">
          {isRevealing ? 'Revealing...' : 'Reveal Number'}
        </Text>
      </Button>
    </YStack>
  );
}
