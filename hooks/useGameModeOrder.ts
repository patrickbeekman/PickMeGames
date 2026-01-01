import AsyncStorage from '@react-native-async-storage/async-storage';
import { useCallback, useEffect, useState } from 'react';

const GAME_MODE_ORDER_KEY = 'game_mode_order';
const HAS_SEEN_REORDER_TIP_KEY = 'has_seen_reorder_tip';

export interface GameModeOption {
  title: string;
  route: string;
  icon: any;
  gradient: [string, string];
}

export const useGameModeOrder = (defaultOptions: GameModeOption[]) => {
  const [orderedOptions, setOrderedOptions] = useState<GameModeOption[]>(defaultOptions);
  const [loading, setLoading] = useState(true);
  const [hasSeenTip, setHasSeenTip] = useState(false);

  // Load saved order and tip status
  useEffect(() => {
    const loadOrder = async () => {
      try {
        const [savedOrder, seenTip] = await Promise.all([
          AsyncStorage.getItem(GAME_MODE_ORDER_KEY),
          AsyncStorage.getItem(HAS_SEEN_REORDER_TIP_KEY),
        ]);

        if (savedOrder) {
          const orderArray: string[] = JSON.parse(savedOrder);
          // Reorder options based on saved order
          const reordered = orderArray
            .map((route) => defaultOptions.find((opt) => opt.route === route))
            .filter((opt): opt is GameModeOption => opt !== undefined)
            .concat(defaultOptions.filter((opt) => !orderArray.includes(opt.route)));
          setOrderedOptions(reordered);
        } else {
          setOrderedOptions(defaultOptions);
        }

        setHasSeenTip(seenTip === 'true');
      } catch (error) {
        console.log('Error loading game mode order:', error);
        setOrderedOptions(defaultOptions);
      } finally {
        setLoading(false);
      }
    };

    loadOrder();
  }, [defaultOptions]);

  // Save new order
  const saveOrder = useCallback(async (newOrder: GameModeOption[]) => {
    try {
      const routeOrder = newOrder.map((opt) => opt.route);
      await AsyncStorage.setItem(GAME_MODE_ORDER_KEY, JSON.stringify(routeOrder));
      setOrderedOptions(newOrder);
    } catch (error) {
      console.log('Error saving game mode order:', error);
    }
  }, []);

  // Mark tip as seen
  const markTipAsSeen = useCallback(async () => {
    try {
      await AsyncStorage.setItem(HAS_SEEN_REORDER_TIP_KEY, 'true');
      setHasSeenTip(true);
    } catch (error) {
      console.log('Error saving tip status:', error);
    }
  }, []);

  return {
    orderedOptions,
    loading,
    hasSeenTip,
    saveOrder,
    markTipAsSeen,
  };
};

