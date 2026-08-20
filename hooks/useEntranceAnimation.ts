import { useEffect, useRef } from 'react';
import { Animated } from 'react-native';
import { Design } from '../constants/Design';

export function useEntranceAnimation(options?: { delay?: number; distance?: number; duration?: number }) {
  const { delay = 0, distance = 30, duration = Design.animation.slow } = options ?? {};
  const fade = useRef(new Animated.Value(0)).current;
  const slide = useRef(new Animated.Value(distance)).current;

  useEffect(() => {
    const anim = Animated.parallel([
      Animated.timing(fade, { toValue: 1, duration, delay, useNativeDriver: true }),
      Animated.timing(slide, { toValue: 0, duration, delay, useNativeDriver: true }),
    ]);
    anim.start();
    return () => anim.stop();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { fade, slide };
}
