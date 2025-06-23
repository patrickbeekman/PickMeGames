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

  // Load prompts from storage on mount - FIX: Remove prompts from useEffect deps
  useEffect(() => {
    loadPrompts();
  }, []); // Remove defaultPrompts dependency to prevent loops

  const loadPrompts = async () => {
    try {
      const stored = await AsyncStorage.getItem(PROMPTS_STORAGE_KEY);
      if (stored) {
        const customPrompts = JSON.parse(stored);
        setPrompts([...defaultPrompts, ...customPrompts]);
      } else {
        // Only set if different to prevent unnecessary re-renders
        setPrompts(prev => {
          if (prev.length === 0) {
            return defaultPrompts;
          }
          return prev;
        });
      }
    } catch (error) {
      console.log('Error loading prompts:', error);
      // Fallback to defaults on error
      setPrompts(defaultPrompts);
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
    if (!trimmed) return false;
    
    // Check against current prompts to prevent duplicates
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
  }, [prompts, capture]);

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
  }, [prompts, capture]);

  const resetToDefaults = useCallback(async () => {
    setPrompts(defaultPrompts);
    await AsyncStorage.removeItem(PROMPTS_STORAGE_KEY);
    
    capture('prompts_reset_to_defaults', {
      totalPrompts: defaultPrompts.length,
    });
  }, [capture]); // Remove defaultPrompts dependency

  const getCustomPrompts = useCallback(() => {
    return prompts.slice(defaultPrompts.length);
  }, [prompts]);

  // Helper function to get filtered prompts (for external use)
  const getFilteredPrompts = useCallback(async () => {
    try {
      const storedHidden = await AsyncStorage.getItem('hidden_default_prompts');
      const hiddenDefaults = storedHidden ? JSON.parse(storedHidden) : [];
      
      // Get the actual custom prompts from storage
      const storedCustom = await AsyncStorage.getItem(PROMPTS_STORAGE_KEY);
      const customPrompts = storedCustom ? JSON.parse(storedCustom) : [];
      
      // Filter out hidden defaults but keep all custom prompts
      const filteredDefaults = defaultPrompts.filter((_, index) => !hiddenDefaults.includes(index));
      
      return [...filteredDefaults, ...customPrompts];
    } catch {
      return prompts;
    }
  }, [prompts]);

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
