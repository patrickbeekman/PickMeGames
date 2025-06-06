import { Button } from '@tamagui/button';
import { Text } from '@tamagui/core';
import { Input } from '@tamagui/input';
import { XStack, YStack } from '@tamagui/stacks';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from 'expo-router';
import { useEffect, useState } from 'react';
import { Alert, FlatList, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAnalytics } from '../hooks/useAnalytics';
import { usePrompts } from '../hooks/usePrompts';

export default function PromptSettings() {
  const navigation = useNavigation();
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

  useEffect(() => {
    navigation.setOptions({
      headerTitle: 'Prompt Settings',
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
    capture('entered_prompt_settings');
  }, [capture]);

  const handleAddPrompt = async () => {
    if (!newPrompt.trim()) return;
    
    const success = await addPrompt(newPrompt);
    if (success) {
      setNewPrompt('');
      Alert.alert('Success', 'Prompt added successfully!');
    } else {
      Alert.alert('Error', 'Prompt already exists or is invalid.');
    }
  };

  const handleRemovePrompt = (index: number, prompt: string) => {
    if (index < defaultPromptsCount) {
      Alert.alert('Cannot Delete', 'Default prompts cannot be removed.');
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

  const renderPromptItem = ({ item, index }: { item: string; index: number }) => {
    const isDefault = index < defaultPromptsCount;
    
    return (
      <YStack
        backgroundColor={isDefault ? "rgba(255,255,255,0.7)" : "rgba(255,255,255,0.95)"}
        borderRadius={12}
        padding={16}
        marginVertical={4}
        marginHorizontal={16}
        borderWidth={isDefault ? 1 : 2}
        borderColor={isDefault ? "#E0E0E0" : "#4CAF50"}
      >
        <XStack alignItems="center" justifyContent="space-between">
          <YStack flex={1} marginRight={12}>
            <Text fontSize={16} color="#333" lineHeight={22}>
              {item}
            </Text>
            <Text fontSize={12} color="#666" marginTop={4}>
              {isDefault ? '📱 Default prompt' : '✨ Custom prompt'}
            </Text>
          </YStack>
          
          {!isDefault && (
            <Button
              size="$2"
              backgroundColor="#FF5722"
              borderRadius={20}
              pressStyle={{ scale: 0.95, backgroundColor: "#E64A19" }}
              onPress={() => handleRemovePrompt(index, item)}
            >
              <Text color="white" fontSize={12} fontWeight="bold">
                🗑️ Remove
              </Text>
            </Button>
          )}
        </XStack>
      </YStack>
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <YStack flex={1} backgroundColor="#F3E889" alignItems="center" justifyContent="center">
          <Text fontSize={18} color="#333">Loading prompts...</Text>
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
          <Text fontSize={20} fontWeight="700" color="#333" textAlign="center" marginBottom={8}>
            Manage Your Prompts
          </Text>
          <Text fontSize={14} color="#666" textAlign="center" maxWidth={300}>
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
          <Text fontSize={16} fontWeight="600" color="#333" marginBottom={12}>
            ✨ Add New Prompt
          </Text>
          
          <Input
            placeholder="Enter your custom prompt..."
            value={newPrompt}
            onChangeText={setNewPrompt}
            backgroundColor="white"
            borderRadius={8}
            borderWidth={1}
            borderColor="#E0E0E0"
            padding={12}
            marginBottom={12}
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

        {/* Stats */}
        <XStack justifyContent="center" marginHorizontal={16} marginBottom={16}>
          <YStack
            backgroundColor="rgba(76, 175, 80, 0.1)"
            borderRadius={12}
            padding={12}
            alignItems="center"
            flex={1}
            marginRight={8}
          >
            <Text fontSize={18} fontWeight="bold" color="#4CAF50">
              {prompts.length}
            </Text>
            <Text fontSize={12} color="#666">Total Prompts</Text>
          </YStack>
          
          <YStack
            backgroundColor="rgba(255, 193, 7, 0.1)"
            borderRadius={12}
            padding={12}
            alignItems="center"
            flex={1}
            marginLeft={8}
          >
            <Text fontSize={18} fontWeight="bold" color="#FF9800">
              {getCustomPrompts().length}
            </Text>
            <Text fontSize={12} color="#666">Custom Prompts</Text>
          </YStack>
        </XStack>

        {/* Prompts List */}
        <FlatList
          data={prompts}
          renderItem={renderPromptItem}
          keyExtractor={(item, index) => `${index}-${item}`}
          showsVerticalScrollIndicator={false}
          style={{ flex: 1 }}
          contentContainerStyle={{ paddingBottom: 100 }}
        />

        {/* Reset Button */}
        {getCustomPrompts().length > 0 && (
          <YStack margin={16}>
            <Button
              backgroundColor="#FF5722"
              borderRadius={12}
              pressStyle={{ scale: 0.95, backgroundColor: "#E64A19" }}
              onPress={handleResetToDefaults}
            >
              <Text color="white" fontWeight="bold">
                🔄 Reset to Default Prompts
              </Text>
            </Button>
          </YStack>
        )}
      </YStack>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
