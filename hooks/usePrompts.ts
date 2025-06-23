import AsyncStorage from '@react-native-async-storage/async-storage';
import { useCallback, useEffect, useState } from 'react';
import * as defaultPromptsData from '../assets/prompts.json';
import { useAnalytics } from './useAnalytics';
const defaultPrompts: string[] = (defaultPromptsData as any).default || defaultPromptsData;

const PROMPTS_STORAGE_KEY = 'custom_prompts';

export const usePrompts = () => {
  const [prompts, setPrompts] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const { capture } = useAnalytics();

  useEffect(() => {
    let isMounted = true;
    const loadPrompts = async () => {
      try {
        const stored = await AsyncStorage.getItem(PROMPTS_STORAGE_KEY);
        if (!isMounted) return;
        if (stored) {
          const customPrompts = JSON.parse(stored);
          setPrompts([...defaultPrompts, ...customPrompts]);
        } else {
          setPrompts(prev => {
            if (prev.length === 0) {
              return defaultPrompts;
            }
            return prev;
          });
        }
      } catch (error) {
        if (isMounted) setPrompts(defaultPrompts);
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    loadPrompts();
    return () => { isMounted = false; };
  }, []);

  const saveCustomPrompts = useCallback(async (customPrompts: string[]) => {
    try {
      await AsyncStorage.setItem(PROMPTS_STORAGE_KEY, JSON.stringify(customPrompts));
    } catch (error) {
      console.log('Error saving prompts:', error);
    }
  }, []);

  const addPrompt = useCallback(async (newPrompt: string) => {
    const trimmed = newPrompt.trim();
    if (!trimmed) return false;
    if (prompts.includes(trimmed)) return false;
    const updatedPrompts = [...prompts, trimmed];
    setPrompts(updatedPrompts);
    const customPrompts = updatedPrompts.slice(defaultPrompts.length);
    await saveCustomPrompts(customPrompts);
    capture('prompt_added', {
      prompt: trimmed,
      totalPrompts: updatedPrompts.length,
      customPromptsCount: customPrompts.length,
    });
    return true;
  }, [prompts, capture, saveCustomPrompts]);

  const removePrompt = useCallback(async (index: number) => {
    if (index < defaultPrompts.length) return false;
    const promptToRemove = prompts[index];
    const updatedPrompts = prompts.filter((_, i) => i !== index);
    setPrompts(updatedPrompts);
    const customPrompts = updatedPrompts.slice(defaultPrompts.length);
    await saveCustomPrompts(customPrompts);
    capture('prompt_removed', {
      prompt: promptToRemove,
      totalPrompts: updatedPrompts.length,
      customPromptsCount: customPrompts.length,
    });
    return true;
  }, [prompts, capture, saveCustomPrompts]);

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

  // Memoized, no setState, no prompts dependency (prevents infinite loop)
  const getFilteredPrompts = useCallback(async () => {
    try {
      const storedHidden = await AsyncStorage.getItem('hidden_default_prompts');
      const hiddenDefaults = storedHidden ? JSON.parse(storedHidden) : [];
      const storedCustom = await AsyncStorage.getItem(PROMPTS_STORAGE_KEY);
      const customPrompts = storedCustom ? JSON.parse(storedCustom) : [];
      const filteredDefaults = defaultPrompts.filter((_, index) => !hiddenDefaults.includes(index));
      return [...filteredDefaults, ...customPrompts];
    } catch {
      return defaultPrompts;
    }
  }, []);

  return {
    prompts,
    loading,
    addPrompt,
    removePrompt,
    resetToDefaults,
    getCustomPrompts,
    getFilteredPrompts,
    defaultPromptsCount: defaultPrompts.length,
  };
};
