import { Button } from '@tamagui/button';
import { Text } from '@tamagui/core';
import { YStack } from '@tamagui/stacks';
import { useNavigation } from 'expo-router';
import { usePostHog } from 'posthog-react-native';
import React, { useEffect, useState } from 'react';
import prompts from '../assets/prompts.json';

export default function PromptSelector() {
  const navigation = useNavigation();
  const posthog = usePostHog();
  const [currentIndex, setCurrentIndex] = useState(() =>
    Math.floor(Math.random() * prompts.length)
  );

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
          posthog.capture('prompt_selected');
      }, []);

  const nextPrompt = () => {
    let next;
    do {
        next = Math.floor(Math.random() * prompts.length);
    } while (prompts.length > 1 && next === currentIndex);
    setCurrentIndex(next);

  };

  const currentPrompt = prompts[currentIndex];

  return (
    <YStack flex={1} backgroundColor="#F3E889" alignItems="center" justifyContent="center" padding={20}>
      <YStack
        backgroundColor="#fff"
        borderRadius={16}
        padding={20}
        marginVertical={20}
        maxWidth="90%"
        maxHeight="60%"
        justifyContent="center"
        alignItems="center"
        shadowColor="#000"
        shadowOpacity={0.1}
        shadowOffset={{ width: 0, height: 2 }}
        shadowRadius={8}
        elevation={4}
      >
        <Text fontSize={20} color="#333" textAlign="center">
          {currentPrompt}
        </Text>
      </YStack>

      <Button
        backgroundColor="#4CAF50"
        borderRadius={999}
        pressStyle={{ scale: 0.95, backgroundColor: "#45a049" }}
        shadowColor="#000"
        shadowOpacity={0.2}
        shadowOffset={{ width: 0, height: 2 }}
        shadowRadius={4}
        onPress={nextPrompt}
      >
        <Text fontSize={18} color="white" fontWeight="bold">
          Next Prompt
        </Text>
      </Button>
    </YStack>
  );
}
