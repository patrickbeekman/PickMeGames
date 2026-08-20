import AsyncStorage from '@react-native-async-storage/async-storage';
import { Button } from '@tamagui/button';
import { Text } from '@tamagui/core';
import { Input } from '@tamagui/input';
import { XStack, YStack } from '@tamagui/stacks';
import { LinearGradient } from 'expo-linear-gradient';
import { useEffect, useRef, useState } from 'react';
import { Alert, FlatList, Keyboard, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Design } from '../constants/Design';
import { useAnalytics } from '../hooks/useAnalytics';
import { useGameScreenHeader } from '../hooks/useGameScreenHeader';
import { usePrompts } from '../hooks/usePrompts';

export default function PromptSettings() {
  const { capture } = useAnalytics();
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
  const inputRef = useRef<HTMLInputElement>(null);

  // Track deleted default prompts locally so they don't show up again
  const [hiddenDefaults, setHiddenDefaults] = useState<number[]>([]);
  const [hiddenLoaded, setHiddenLoaded] = useState(false);

  // Load hidden defaults from AsyncStorage on mount
  useEffect(() => {
    AsyncStorage.getItem('hidden_default_prompts')
      .then(stored => {
        if (stored) setHiddenDefaults(JSON.parse(stored));
      })
      .catch(() => {})
      .finally(() => setHiddenLoaded(true));
  }, []);

  // Save hidden defaults to AsyncStorage (gated on load completion so we
  // don't overwrite stored data with the initial empty state before it loads)
  useEffect(() => {
    if (!hiddenLoaded) return;
    AsyncStorage.setItem('hidden_default_prompts', JSON.stringify(hiddenDefaults)).catch(() => {});
  }, [hiddenDefaults, hiddenLoaded]);

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
    const isDefault = !showCustom;
    
    // For default prompts, find the original index in the unfiltered array
    // For custom prompts, calculate the real index in the full prompts array
    let realIndex: number;
    if (isDefault) {
      // Find which original default prompt this is by matching the item
      // and finding its position in the original default prompts array
      const originalIndex = prompts.slice(0, defaultPromptsCount).findIndex(p => p === item);
      realIndex = originalIndex >= 0 ? originalIndex : index;
    } else {
      realIndex = index + defaultPromptsCount;
    }

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
            <Text fontSize={16} color={Design.colors.text.primary} lineHeight={22}>
              {item}
            </Text>
          </YStack>
          <Button
            size="$2"
            backgroundColor={isDefault ? Design.colors.primary : Design.colors.accent.orange}
            borderRadius={20}
            pressStyle={{ scale: 0.95, backgroundColor: isDefault ? Design.colors.primaryDark : "#E65100" }}
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

  useGameScreenHeader('Prompt Settings');

  useEffect(() => {
    capture('entered_prompt_settings');
  }, [capture]);

  const handleAddPrompt = async () => {
    if (!newPrompt.trim()) return;
    capture('prompt_typed', { prompt: newPrompt });
    const success = await addPrompt(newPrompt);
    if (success) {
      setNewPrompt('');
    }
  };

  // Allow hiding default prompts instead of blocking deletion
  const handleRemovePrompt = (index: number, prompt: string, isDefault: boolean) => {
    if (isDefault) {
      // Only add if not already hidden (prevent duplicates)
      setHiddenDefaults((prev) => {
        if (prev.includes(index)) {
          return prev; // Already hidden
        }
        return [...prev, index];
      });
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
          onPress: () => {
            resetToDefaults();
            restoreAllDefaults();
          },
        },
      ]
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <YStack flex={1} backgroundColor={Design.colors.background.light} alignItems="center" justifyContent="center">
          <Text fontSize={18} color={Design.colors.text.primary}>Loading prompts...</Text>
        </YStack>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <YStack flex={1} backgroundColor={Design.colors.background.light}>
        <LinearGradient
          colors={[Design.colors.background.light, '#FFE082', '#FFF9C4']}
          style={{ position: 'absolute', left: 0, right: 0, top: 0, bottom: -40 }}
        />
        
        {/* Header */}
        <YStack padding={1} alignItems="center">
          <Text fontSize={32} marginBottom={8}>⚙️💭⚙️</Text>
          <Text fontSize={20} fontWeight="700" color={Design.colors.text.primary} textAlign="center" marginBottom={2}>
            Manage Your Prompts
          </Text>
          <Text fontSize={14} color={Design.colors.text.secondary} textAlign="center" maxWidth={300} marginBottom={8}>
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
          <Text fontSize={16} fontWeight="600" color={Design.colors.text.primary} marginBottom={12}>
            ✨ Add New Prompt
          </Text>
          
          <Input
            ref={inputRef}
            placeholder="Enter your custom prompt..."
            value={newPrompt}
            // This @tamagui/input version's .d.ts mistypes onChangeText as
            // TextInputProps['onChange'] (an event-object signature), but on
            // native it passes the prop straight through unchanged to RN's
            // TextInput, which calls it with the plain string as always.
            // The cast fixes the type without altering runtime behavior.
            onChangeText={setNewPrompt as any}
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
            backgroundColor={Design.colors.primary}
            borderRadius={8}
            pressStyle={{ scale: 0.95, backgroundColor: Design.colors.primaryDark }}
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
            borderColor={Design.colors.primary}
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
              <Text fontSize={12} color={Design.colors.text.secondary} marginBottom={2}>Default Prompts</Text>
              <Text fontSize={20} fontWeight="bold" color={Design.colors.primary}>
                {filteredDefaultPrompts.length}
              </Text>
            </YStack>
          </Button>
          <Button
            flex={1}
            backgroundColor={showCustom ? "#FFF3E0" : "rgba(255, 193, 7, 0.08)"}
            borderColor={Design.colors.accent.orange}
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
              <Text fontSize={12} color={Design.colors.text.secondary} marginBottom={2}>Custom Prompts</Text>
              <Text fontSize={20} fontWeight="bold" color={Design.colors.accent.orange}>
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
            backgroundColor={Design.colors.accent.orange}
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
              backgroundColor={Design.colors.primary}
              borderRadius={12}
              pressStyle={{ scale: 0.95, backgroundColor: Design.colors.primaryDark }}
              onPress={handleResetToDefaults}
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
