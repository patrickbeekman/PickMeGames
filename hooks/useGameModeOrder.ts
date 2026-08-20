import AsyncStorage from '@react-native-async-storage/async-storage';
import { useCallback, useEffect, useState } from 'react';
import { ImageSourcePropType } from 'react-native';

const GAME_MODE_ORDER_KEY = 'game_mode_order';
const HAS_SEEN_REORDER_TIP_KEY = 'has_seen_reorder_tip';

export interface GameModeOption {
  title: string;
  route: string;
  icon: ImageSourcePropType;
  gradient: [string, string];
}

export const useGameModeOrder = (defaultOptions: GameModeOption[]) => {
  const [orderedOptions, setOrderedOptions] = useState<GameModeOption[]>(defaultOptions);
  const [loading, setLoading] = useState(true);
  const [hasSeenTip, setHasSeenTip] = useState(false);

  // Load saved order and tip status
  useEffect(() => {
    let isMounted = true;
    const loadOrder = async () => {
      try {
        const [savedOrder, seenTip] = await Promise.all([
          AsyncStorage.getItem(GAME_MODE_ORDER_KEY),
          AsyncStorage.getItem(HAS_SEEN_REORDER_TIP_KEY),
        ]);

        if (!isMounted) return;

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
        if (isMounted) {
          console.log('Error loading game mode order:', error);
          setOrderedOptions(defaultOptions);
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    loadOrder();
    return () => { isMounted = false; };
  }, [defaultOptions]);

  // Save new order
  const saveOrder = useCallback(async (newOrder: GameModeOption[]) => {
    // Keep the session's reordering even if persistence fails below — a
    // snapped-back list with no explanation is worse than an unpersisted
    // (but correct for this session) one.
    setOrderedOptions(newOrder);
    try {
      const routeOrder = newOrder.map((opt) => opt.route);
      await AsyncStorage.setItem(GAME_MODE_ORDER_KEY, JSON.stringify(routeOrder));
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

