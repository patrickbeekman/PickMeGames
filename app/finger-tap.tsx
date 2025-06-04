import { useNavigation } from 'expo-router';
import { usePostHog } from 'posthog-react-native';
import React, { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Dimensions,
  Easing,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import ConfettiCannon from 'react-native-confetti-cannon';
import { Ripple } from '../components/Ripple';


const COUNTDOWN_SECONDS = 4;
const PARTICLE_COUNT = 24;
const { width, height } = Dimensions.get('window');

export default function FingerTapScreen() {
  const navigation = useNavigation();
  const posthog = usePostHog()
  const [touches, setTouches] = useState<{ identifier: number; x: number; y: number }[]>([]);
  const [winner, setWinner] = useState<{ x: number; y: number } | null>(null);
  const [particles, setParticles] = useState<Animated.ValueXY[]>([]);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [phase, setPhase] = useState<'waiting' | 'countdown' | 'flickering' | 'winner'>('waiting');

  const backgroundColor = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    navigation.setOptions({
      headerTitle: 'Finger Tap',
      headerStyle: {
        backgroundColor: '#F3E889',
      },
      headerTintColor: '#333',
      headerTitleStyle: {
        fontWeight: 'bold',
      },
    });
  }, [navigation]);

  useEffect(() => {
    posthog.capture('entered_finger_tap');
  }, []);

  useEffect(() => {
    if (countdown !== null && countdown > 0) {
      const timer = setTimeout(() => {
        setCountdown((prev) => (prev !== null ? prev - 1 : null));
      }, 1000);
      return () => clearTimeout(timer);
    } else if (countdown === 0) {
      setCountdown(null);
      setPhase('flickering');
      chooseWinner()
    }
  }, [countdown]);

  useEffect(() => {
    let toValue = 0;
    switch (phase) {
      case 'waiting':
        toValue = 0;
        break;
      case 'countdown':
        toValue = 1;
        break;
      case 'flickering':
        toValue = 2;
        break;
      case 'winner':
        toValue = 3;
        break;
    }
  
    Animated.timing(backgroundColor, {
      toValue,
      duration: 750,
      easing: Easing.inOut(Easing.ease),
      useNativeDriver: false,
    }).start();
  }, [phase]);

  const onTouchStart = (e: any) => {
    if (phase === 'winner' || phase === 'flickering') return;

    const newTouches = e.nativeEvent.touches.map((t: any) => ({
      identifier: t.identifier,
      x: t.locationX,
      y: t.locationY,
    }));
    setTouches(newTouches);

    if (phase === 'waiting' && newTouches.length > 0) {
      setPhase('countdown');
      setCountdown(COUNTDOWN_SECONDS);
    }
  };

  const onTouchEnd = (e: any) => {
    const remainingTouches = e.nativeEvent.touches.map((t: any) => ({
      identifier: t.identifier,
      x: t.locationX,
      y: t.locationY,
    }));
  
    setTouches(remainingTouches);
  
    if (phase === 'countdown' && remainingTouches.length === 0) {
      reset();
    }
  };

  const chooseWinner = () => {
    if (touches.length < 1) {
      setPhase('waiting');
      return;
    }
    const chosen = touches[Math.floor(Math.random() * touches.length)];
    setWinner({ x: chosen.x, y: chosen.y });
    triggerParticles(chosen.x, chosen.y);
    setPhase('winner');
    // Track winner picked
    posthog.capture('finger_tap_winner_picked', {
      winner_x: chosen.x,
      winner_y: chosen.y,
      total_touches: touches.length,
    });
  };

  const triggerParticles = (x: number, y: number) => {
    const newParticles = Array.from({ length: PARTICLE_COUNT }).map((_, i) => {
      const angle = (2 * Math.PI * i) / PARTICLE_COUNT;
      const dx = Math.cos(angle) * 100;
      const dy = Math.sin(angle) * 100;
      const animated = new Animated.ValueXY({ x, y });
      Animated.timing(animated, {
        toValue: { x: x + dx, y: y + dy },
        duration: 600,
        useNativeDriver: false,
      }).start();
      return animated;
    });
    setParticles(newParticles);
  };

  const reset = () => {
    setTouches([]);
    setWinner(null);
    setParticles([]);
    setCountdown(null);
    setPhase('waiting');
  };

  const bgColor = backgroundColor.interpolate({
    inputRange: [0, 1, 2, 3],
    outputRange: ['#F3E889', '#FBF272', '#E0FF4F', '#C4EF5F'],
  });

  return (
    <Animated.View style={[styles.container, { backgroundColor: bgColor }]}>
    <Animated.View
      style={[styles.container, { backgroundColor: bgColor || '#F3E889' }]}
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
    >

    {/* Instructions for waiting phase */}
    {phase === 'waiting' && (
      <View style={styles.instructionsContainer}>
        <Text style={styles.instructionsText}>
          Every player touch and hold one finger to the screen
        </Text>
      </View>
    )}

    {touches.map((touch, index) => (
        <Ripple
            key={touch.identifier}
            x={touch.x}
            y={touch.y}
            speed={
                phase === 'countdown' && countdown !== null
                  ? Math.max(1000, countdown * 150) // slower ripple ramp-up
                  : 1500 // idle or post-winner
              }
        />
    ))}

    {touches.map((touch, index) => (
        <Ripple
            key={touch.identifier}
            x={touch.x}
            y={touch.y}
            speed={
                phase === 'countdown' && countdown !== null
                  ? Math.max(1000, countdown * 150) // slower ripple ramp-up
                  : 1500 // idle or post-winner
              }
        />
    ))}

      {countdown !== null && (
        <View style={styles.centerCountdown}>
          <Text style={styles.countdownText}>{countdown}</Text>
        </View>
      )}

      {winner && (
        <View
          style={{
            position: 'absolute',
            left: winner.x - 50,
            top: winner.y - 50,
            width: 100,
            height: 100,
            borderRadius: 50,
            backgroundColor: 'rgba(255, 215, 0, 0.9)',
            justifyContent: 'center',
            alignItems: 'center',
            borderWidth: 3,
            borderColor: 'white',
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.3,
            shadowRadius: 4,
          }}
        >
          <Text style={{ fontSize: 30 }}>👑</Text>
        </View>
      )}

      {particles.map((p, i) => (
        <Animated.View
          key={i}
          style={{
            position: 'absolute',
            width: 10,
            height: 10,
            borderRadius: 5,
            backgroundColor: '#FFEB3B',
            transform: [
              { translateX: p.x },
              { translateY: p.y },
            ],
          }}
        />
      ))}

        {phase === 'winner' && (
        <ConfettiCannon
            count={100}
            origin={{ x: width / 2, y: 0 }}
            fadeOut={true}
            explosionSpeed={300}
            fallSpeed={3000}
        />
        )}


      <TouchableOpacity style={styles.resetButton} onPress={reset}>
        <Text style={styles.resetText}>Reset</Text>
      </TouchableOpacity>
    </Animated.View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  instructionsContainer: {
    position: 'absolute',
    top: height * 0.3,
    left: 20,
    right: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
  },
  instructionsText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    textAlign: 'center',
    lineHeight: 24,
  },
  centerCountdown: {
    position: 'absolute',
    top: height * 0.2,
    left: width / 2 - 60,
    width: 120,
    height: 120,
    backgroundColor: 'rgba(70, 187, 24, 0.6)',
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
  },
  countdownText: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '3adc3e',
  },
  resetButton: {
    position: 'absolute',
    bottom: 60,
    alignSelf: 'center',
    backgroundColor: '#f44336',
    padding: 16,
    borderRadius: 10,
  },
  resetText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
