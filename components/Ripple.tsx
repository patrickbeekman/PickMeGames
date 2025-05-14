import React, { useEffect, useRef } from 'react';
import { Animated, Easing, StyleSheet } from 'react-native';

export const Ripple = ({ x, y, speed }: { x: number; y: number; speed: number }) => {
  const scale = useRef(new Animated.Value(0)).current;
  const opacity = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.parallel([
        Animated.timing(scale, {
          toValue: 3, // 2x scale
          duration: speed,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0,
          duration: speed,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
      ])
    );

    scale.setValue(0);
    opacity.setValue(1);
    loop.start();

    return () => loop.stop();
  }, [speed]);

  return (
    <Animated.View
      pointerEvents="none"
      style={[
        styles.ripple,
        {
          left: x - 25,
          top: y - 25,
          opacity,
          transform: [{ scale }],
        },
      ]}
    />
  );
};

const styles = StyleSheet.create({
  ripple: {
    position: 'absolute',
    width: 60,
    height: 60,
    borderRadius: 25,
    backgroundColor: 'rgba(115, 255, 0, 0.73)', // gold ripple
  },
});
