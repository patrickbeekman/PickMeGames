import AsyncStorage from '@react-native-async-storage/async-storage';
import { useCallback, useEffect, useState } from 'react';
import defaultPrompts from '../assets/prompts.json';
import { useAnalytics } from './useAnalytics';

const PROMPTS_STORAGE_KEY = 'custom_prompts';

export const usePrompts = () => {
  const [prompts, setPrompts] = useState<string[]>(defaultPrompts);
  const [loading, setLoading] = useState(true);
  const { capture } = useAnalytics();

  // Load prompts from storage on mount
  useEffect(() => {
    loadPrompts();
  }, []);

  const loadPrompts = async () => {
    try {
      const stored = await AsyncStorage.getItem(PROMPTS_STORAGE_KEY);
      if (stored) {
        const customPrompts = JSON.parse(stored);
        setPrompts([...defaultPrompts, ...customPrompts]);
      }
    } catch (error) {
      console.log('Error loading prompts:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveCustomPrompts = async (customPrompts: string[]) => {
    try {
      await AsyncStorage.setItem(PROMPTS_STORAGE_KEY, JSON.stringify(customPrompts));
    } catch (error) {
      console.log('Error saving prompts:', error);
    }
  };

  const addPrompt = useCallback(async (newPrompt: string) => {
    const trimmed = newPrompt.trim();
    if (!trimmed || prompts.includes(trimmed)) return false;

    const updatedPrompts = [...prompts, trimmed];
    setPrompts(updatedPrompts);
    
    // Save only custom prompts (exclude defaults)
    const customPrompts = updatedPrompts.slice(defaultPrompts.length);
    await saveCustomPrompts(customPrompts);
    
    // Log to analytics
    capture('prompt_added', {
      prompt: trimmed,
      totalPrompts: updatedPrompts.length,
      customPromptsCount: customPrompts.length,
    });
    
    return true;
  }, [prompts, capture]);

  const removePrompt = useCallback(async (index: number) => {
    if (index < defaultPrompts.length) return false; // Can't remove default prompts
    
    const promptToRemove = prompts[index];
    const updatedPrompts = prompts.filter((_, i) => i !== index);
    setPrompts(updatedPrompts);
    
    // Save only custom prompts
    const customPrompts = updatedPrompts.slice(defaultPrompts.length);
    await saveCustomPrompts(customPrompts);
    
    // Log to analytics
    capture('prompt_removed', {
      prompt: promptToRemove,
      totalPrompts: updatedPrompts.length,
      customPromptsCount: customPrompts.length,
    });
    
    return true;
  }, [prompts, capture]);

  const resetToDefaults = useCallback(async () => {
    setPrompts(defaultPrompts);
    await AsyncStorage.removeItem(PROMPTS_STORAGE_KEY);
    
    capture('prompts_reset_to_defaults', {
      totalPrompts: defaultPrompts.length,
    });
  }, [capture]);

  const getCustomPrompts = useCallback(() => {
    return prompts.slice(defaultPrompts.length);
  }, [prompts]);

  return {
    prompts,
    loading,
    addPrompt,
    removePrompt,
    resetToDefaults,
    getCustomPrompts,
    defaultPromptsCount: defaultPrompts.length,
  };
};
