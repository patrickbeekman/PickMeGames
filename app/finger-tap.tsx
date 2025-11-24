import { Button } from '@tamagui/button';
import { Text } from '@tamagui/core';
import { YStack } from '@tamagui/stacks';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Dimensions,
  Easing,
  StyleSheet,
  NativeTouchEvent,
  GestureResponderEvent,
} from 'react-native';
import ConfettiCannon from 'react-native-confetti-cannon';
import { Ripple } from '../components/Ripple';
import { useAnalytics } from '../hooks/useAnalytics';

// TypeScript interfaces for touch events
interface TouchData {
  identifier: number;
  locationX: number;
  locationY: number;
}

interface TouchEventData {
  nativeEvent: {
    touches: NativeTouchEvent[];
  };
}

const COUNTDOWN_SECONDS = 4;
const PARTICLE_COUNT = 24;
const { width, height } = Dimensions.get('window');

export default function FingerTapScreen() {
  const navigation = useNavigation();
  const { capture, isReady } = useAnalytics();
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
    if (isReady) {
      capture('entered_finger_tap');
    }
  }, [capture, isReady]);

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
  
    const animation = Animated.timing(backgroundColor, {
      toValue,
      duration: 750,
      easing: Easing.inOut(Easing.ease),
      useNativeDriver: false,
    });
    
    animation.start();
    
    return () => {
      animation.stop();
    };
  }, [phase]);

  const onTouchStart = (e: GestureResponderEvent) => {
    if (phase === 'winner' || phase === 'flickering') return;

    const newTouches: TouchData[] = e.nativeEvent.touches.map((t: NativeTouchEvent) => ({
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

  const onTouchMove = (e: GestureResponderEvent) => {
    if (phase === 'winner' || phase === 'flickering') return;

    // Update touch positions when fingers move
    const updatedTouches: TouchData[] = e.nativeEvent.touches.map((t: NativeTouchEvent) => ({
      identifier: t.identifier,
      x: t.locationX,
      y: t.locationY,
    }));
    setTouches(updatedTouches);
  };

  const onTouchEnd = (e: GestureResponderEvent) => {
    const remainingTouches: TouchData[] = e.nativeEvent.touches.map((t: NativeTouchEvent) => ({
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
    
    capture('finger_tap_winner_picked', {
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
      const particleAnimation = Animated.timing(animated, {
        toValue: { x: x + dx, y: y + dy },
        duration: 600,
        useNativeDriver: false,
      });
      particleAnimation.start();
      return animated;
    });
    setParticles(newParticles);
  };

  // Cleanup particles and animations on unmount
  useEffect(() => {
    return () => {
      // Stop all particle animations
      if (particles.length > 0) {
        particles.forEach((particle) => {
          particle.stopAnimation();
        });
      }
      // Stop background color animation
      backgroundColor.stopAnimation();
    };
  }, [particles]);

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
      <LinearGradient
        colors={['#F3E889', '#FFE082', '#FFF9C4']}
        style={{ position: 'absolute', left: 0, right: 0, top: 0, bottom: 0 }}
      />
      
      <Animated.View
        style={[styles.container, { backgroundColor: 'transparent' }]}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
      >

        {/* Enhanced Instructions for waiting phase */}
        {phase === 'waiting' && (
          <YStack
            position="absolute"
            top={height * 0.25}
            left={20}
            right={20}
            alignItems="center"
            zIndex={10}
          >
            <Text fontSize={40} marginBottom={16}>✨👆✨</Text>
            <Text fontSize={20} fontWeight="700" color="#333" textAlign="center" marginBottom={8}>
              Multifinger Challenge!
            </Text>
            <YStack
              backgroundColor="rgba(255, 255, 255, 0.95)"
              borderRadius={16}
              padding={20}
              alignItems="center"
              shadowColor="#000"
              shadowOpacity={0.1}
              shadowOffset={{ width: 0, height: 4 }}
              shadowRadius={8}
            >
              <Text
                fontSize={16}
                fontWeight="600"
                color="#333"
                textAlign="center"
                lineHeight={22}
              >
                Every player touch and hold one finger to the screen. 
                You can move your finger around!
              </Text>
            </YStack>
          </YStack>
        )}

        {/* Enhanced Ripples */}
        {touches.map((touch) => (
          <Ripple
            key={touch.identifier}
            x={touch.x}
            y={touch.y}
            speed={
              phase === 'countdown' && countdown !== null
                ? Math.max(1000, countdown * 150)
                : 1500
            }
          />
        ))}

        {/* Enhanced Countdown */}
        {countdown !== null && (
          <YStack
            position="absolute"
            top={height * 0.15}
            left={width / 2 - 80}
            width={160}
            height={160}
            borderRadius={80}
            justifyContent="center"
            alignItems="center"
            shadowColor="#000"
            shadowOpacity={0.2}
            shadowOffset={{ width: 0, height: 8 }}
            shadowRadius={12}
            zIndex={5}
          >
            <LinearGradient
              colors={['#4CAF50', '#66BB6A', '#81C784']}
              style={{
                width: 160,
                height: 160,
                borderRadius: 80,
                position: 'absolute',
              }}
            />
            <Text fontSize={56} fontWeight="bold" color="white">
              {countdown}
            </Text>
            <Text fontSize={14} color="white" fontWeight="600" marginTop={4}>
              GET READY!
            </Text>
          </YStack>
        )}

        {/* Enhanced Winner Display */}
        {winner && (
          <YStack
            position="absolute"
            left={winner.x - 55}
            top={winner.y - 55}
            width={120}
            height={120}
            borderRadius={60}
            justifyContent="center"
            alignItems="center"
            borderWidth={4}
            borderColor="white"
            shadowColor="#000"
            shadowOffset={{ width: 0, height: 8 }}
            shadowOpacity={0.3}
            shadowRadius={12}
            zIndex={10}
          >
            <LinearGradient
              colors={['#FFD700', '#FFC107', '#FF8F00']}
              style={{
                width: 120,
                height: 120,
                borderRadius: 60,
                position: 'absolute',
              }}
            />
            <Text fontSize={40}>👑</Text>
            <Text fontSize={12} color="white" fontWeight="bold" marginTop={4}>
              WINNER!
            </Text>
          </YStack>
        )}

        {/* Enhanced Particles */}
        {particles.map((p, i) => (
          <Animated.View
            key={i}
            style={{
              position: 'absolute',
              width: 12,
              height: 12,
              borderRadius: 6,
              backgroundColor: '#FFD700',
              shadowColor: '#FFD700',
              shadowOpacity: 0.8,
              shadowRadius: 4,
              transform: [
                { translateX: p.x },
                { translateY: p.y },
              ],
            }}
          />
        ))}

        {/* Enhanced Confetti */}
        {phase === 'winner' && (
          <ConfettiCannon
            count={120}
            origin={{ x: width / 2, y: 0 }}
            fadeOut={true}
            explosionSpeed={350}
            fallSpeed={2800}
            colors={['#FFD700', '#4CAF50', '#FF6B6B', '#4ECDC4', '#9B59B6']}
          />
        )}

        {/* Enhanced Reset Button */}
        <Button
          position="absolute"
          bottom={80}
          alignSelf="center"
          backgroundColor="#FF5722"
          borderRadius={50}
          paddingHorizontal={32}
          paddingVertical={5}
          pressStyle={{ scale: 0.95, backgroundColor: "#E64A19" }}
          shadowColor="#000"
          shadowOpacity={0.2}
          shadowOffset={{ width: 0, height: 6 }}
          shadowRadius={10}
          elevation={8}
          onPress={reset}
          onTouchStart={(e) => e.stopPropagation()}
          onTouchMove={(e) => e.stopPropagation()}
          onTouchEnd={(e) => e.stopPropagation()}
        >
          <Text color="white" fontSize={18} fontWeight="bold">
            🔄 Reset Game
          </Text>
        </Button>

        {/* Players indicator */}
        {phase === 'countdown' && touches.length > 0 && (
          <YStack
            position="absolute"
            bottom={160}
            alignSelf="center"
            backgroundColor="rgba(76, 175, 80, 0.9)"
            borderRadius={20}
            paddingVertical={8}
            paddingHorizontal={16}
          >
            <Text color="white" fontSize={14} fontWeight="600">
              👥 {touches.length} Player{touches.length !== 1 ? 's' : ''} Ready!
            </Text>
          </YStack>
        )}
      </Animated.View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
