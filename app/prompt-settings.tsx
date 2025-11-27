import AsyncStorage from '@react-native-async-storage/async-storage';
import { Button } from '@tamagui/button';
import { Text } from '@tamagui/core';
import { Input } from '@tamagui/input';
import { XStack, YStack } from '@tamagui/stacks';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { Alert, FlatList, Keyboard, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAnalytics } from '../hooks/useAnalytics';
import { usePrompts } from '../hooks/usePrompts';

export default function PromptSettings() {
  const navigation = useNavigation();
  const { capture, isReady } = useAnalytics();
  const { 
    prompts, 
    loading, 
    addPrompt, 
    removePrompt, 
    resetToDefaults, 
    getCustomPrompts,
    defaultPromptsCount 
  } = usePrompts();
  const [newPrompt, setNewPrompt] = useState('');
  const [showCustom, setShowCustom] = useState(false);
  const inputRef = useRef<any>(null);

  // Track deleted default prompts locally so they don't show up again
  const [hiddenDefaults, setHiddenDefaults] = useState<number[]>([]);

  // Load hidden defaults from AsyncStorage on mount
  useEffect(() => {
    AsyncStorage.getItem('hidden_default_prompts')
      .then(stored => {
        if (stored) setHiddenDefaults(JSON.parse(stored));
      })
      .catch(() => {});
  }, []);

  // Save hidden defaults to AsyncStorage
  useEffect(() => {
    AsyncStorage.setItem('hidden_default_prompts', JSON.stringify(hiddenDefaults)).catch(() => {});
  }, [hiddenDefaults]);

  // Helper to hide all default prompts
  const hideAllDefaults = () => {
    setHiddenDefaults(Array.from({ length: defaultPromptsCount }, (_, i) => i));
  };

  // Helper to restore all default prompts
  const restoreAllDefaults = () => {
    setHiddenDefaults([]);
  };

  // Filtered default prompts for display and count
  const filteredDefaultPrompts = prompts.slice(0, defaultPromptsCount).filter((_, i) => !hiddenDefaults.includes(i));
  const visiblePrompts = showCustom ? getCustomPrompts() : filteredDefaultPrompts;

  const renderPromptItem = ({ item, index }: { item: string; index: number }) => {
    // Adjust index for custom prompts view
    const realIndex = showCustom ? index + defaultPromptsCount : index;
    const isDefault = !showCustom;

    return (
      <YStack
        backgroundColor={isDefault ? "#E8F5E9" : "#FFF3E0"}
        borderRadius={12}
        padding={16}
        marginVertical={4}
        marginHorizontal={16}
        borderWidth={0}
      >
        <XStack alignItems="center" justifyContent="space-between">
          <YStack flex={1} marginRight={12}>
            <Text fontSize={16} color="#1A1A1A" lineHeight={22}>
              {item}
            </Text>
          </YStack>
          <Button
            size="$2"
            backgroundColor={isDefault ? "#4CAF50" : "#F57C00"}
            borderRadius={20}
            pressStyle={{ scale: 0.95, backgroundColor: isDefault ? "#388E3C" : "#E65100" }}
            onPress={() => handleRemovePrompt(realIndex, item, isDefault)}
          >
            <Text color="white" fontSize={12} fontWeight="bold">
              🗑️ Remove
            </Text>
          </Button>
        </XStack>
      </YStack>
    );
  };

  useEffect(() => {
    navigation.setOptions({
      headerTitle: 'Prompt Settings',
      headerStyle: {
        backgroundColor: '#F3E889',
        borderBottomWidth: 0,
        shadowOpacity: 0,
        elevation: 0,
      },
      headerTintColor: '#1A1A1A',
      headerTitleStyle: {
        fontWeight: 'bold',
      },
    });
  }, [navigation]);

  useEffect(() => {
    if (isReady) {
      capture('entered_prompt_settings');
    }
  }, [capture, isReady]);

  const handleAddPrompt = async () => {
    if (!newPrompt.trim()) return;
    capture('prompt_typed', { prompt: newPrompt });
    const success = await addPrompt(newPrompt);
    if (success) {
      setNewPrompt('');
      Alert.alert('Success', 'Prompt added successfully!');
    } else {
      Alert.alert('Error', 'Prompt already exists or is invalid.');
    }
  };

  // Allow hiding default prompts instead of blocking deletion
  const handleRemovePrompt = (index: number, prompt: string, isDefault: boolean) => {
    if (isDefault) {
      setHiddenDefaults((prev) => [...prev, index]);
      return;
    }
    Alert.alert(
      'Remove Prompt',
      `Are you sure you want to remove this prompt?\n\n"${prompt}"`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: () => removePrompt(index),
        },
      ]
    );
  };

  const handleResetToDefaults = () => {
    Alert.alert(
      'Reset to Defaults',
      'This will remove all custom prompts and reset to the original list. Are you sure?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset',
          style: 'destructive',
          onPress: resetToDefaults,
        },
      ]
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <YStack flex={1} backgroundColor="#F3E889" alignItems="center" justifyContent="center">
          <Text fontSize={18} color="#1A1A1A">Loading prompts...</Text>
        </YStack>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <YStack flex={1} backgroundColor="#F3E889">
        <LinearGradient
          colors={['#F3E889', '#FFE082', '#FFF9C4']}
          style={{ position: 'absolute', left: 0, right: 0, top: 0, bottom: -40 }}
        />
        
        {/* Header */}
        <YStack padding={1} alignItems="center">
          <Text fontSize={32} marginBottom={8}>⚙️💭⚙️</Text>
          <Text fontSize={20} fontWeight="700" color="#1A1A1A" textAlign="center" marginBottom={2}>
            Manage Your Prompts
          </Text>
          <Text fontSize={14} color="#4A4A4A" textAlign="center" maxWidth={300} marginBottom={8}>
            Add custom prompts or remove ones you don't like!
          </Text>
        </YStack>

        {/* Add New Prompt Section */}
        <YStack
          margin={16}
          backgroundColor="rgba(255,255,255,0.95)"
          borderRadius={16}
          padding={20}
          shadowColor="#000"
          shadowOpacity={0.1}
          shadowOffset={{ width: 0, height: 4 }}
          shadowRadius={8}
        >
          <Text fontSize={16} fontWeight="600" color="#1A1A1A" marginBottom={12}>
            ✨ Add New Prompt
          </Text>
          
          <Input
            ref={inputRef}
            placeholder="Enter your custom prompt..."
            value={newPrompt}
            onChangeText={setNewPrompt}
            backgroundColor="white"
            borderRadius={8}
            borderWidth={1}
            borderColor="#E0E0E0"
            padding={12}
            marginBottom={12}
            returnKeyType="done"
            blurOnSubmit={true}
            onSubmitEditing={Keyboard.dismiss}
          />
          
          <Button
            backgroundColor="#4CAF50"
            borderRadius={8}
            pressStyle={{ scale: 0.95, backgroundColor: "#45a049" }}
            onPress={handleAddPrompt}
            disabled={!newPrompt.trim()}
            opacity={newPrompt.trim() ? 1 : 0.5}
          >
            <Text color="white" fontWeight="bold">
              ➕ Add Prompt
            </Text>
          </Button>
        </YStack>

        {/* Stats as Toggle Buttons */}
        <XStack justifyContent="center" marginHorizontal={16} marginBottom={16} gap={12}>
          <Button
            flex={1}
            backgroundColor={showCustom ? "rgba(76, 175, 80, 0.08)" : "#E8F5E9"}
            borderColor="#4CAF50"
            borderWidth={showCustom ? 1 : 2}
            borderRadius={12}
            padding={0}
            onPress={() => {
              setShowCustom(false);
              Keyboard.dismiss();
            }}
            pressStyle={{ scale: 0.97, backgroundColor: "#C8E6C9" }}
          >
            <YStack alignItems="center" paddingVertical={8} paddingHorizontal={4}>
              <Text fontSize={12} color="#4A4A4A" marginBottom={2}>Default Prompts</Text>
              <Text fontSize={20} fontWeight="bold" color="#4CAF50">
                {filteredDefaultPrompts.length}
              </Text>
            </YStack>
          </Button>
          <Button
            flex={1}
            backgroundColor={showCustom ? "#FFF3E0" : "rgba(255, 193, 7, 0.08)"}
            borderColor="#F57C00"
            borderWidth={showCustom ? 2 : 1}
            borderRadius={12}
            padding={0}
            onPress={() => {
              setShowCustom(true);
              Keyboard.dismiss();
            }}
            pressStyle={{ scale: 0.97, backgroundColor: "#FFE0B2" }}
          >
            <YStack alignItems="center" paddingVertical={8} paddingHorizontal={4}>
              <Text fontSize={12} color="#4A4A4A" marginBottom={2}>Custom Prompts</Text>
              <Text fontSize={20} fontWeight="bold" color="#F57C00">
                {getCustomPrompts().length}
              </Text>
            </YStack>
          </Button>
        </XStack>

        {/* Prompts List */}
        <FlatList
          data={visiblePrompts}
          renderItem={renderPromptItem}
          keyExtractor={(item, index) => `${index}-${item}`}
          showsVerticalScrollIndicator={false}
          style={{ flex: 1 }}
          contentContainerStyle={{ paddingBottom: 100 }}
        />

        {/* Reset/Delete Buttons */}
        <XStack margin={16} gap={12} justifyContent="center">
          <Button
            backgroundColor="#F57C00"
            borderRadius={12}
            pressStyle={{ scale: 0.95, backgroundColor: "#E65100" }}
            onPress={hideAllDefaults}
            flex={1}
          >
            <Text color="white" fontWeight="bold">
              🗑️ Delete All Default Prompts
            </Text>
          </Button>
          {getCustomPrompts().length > 0 || hiddenDefaults.length > 0 ? (
            <Button
              backgroundColor="#4CAF50"
              borderRadius={12}
              pressStyle={{ scale: 0.95, backgroundColor: "#388E3C" }}
              onPress={() => {
                handleResetToDefaults();
                restoreAllDefaults();
              }}
              flex={1}
            >
              <Text color="white" fontWeight="bold">
                🔄 Reset to Default Prompts
              </Text>
            </Button>
          ) : null}
        </XStack>
      </YStack>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
