import { Button } from '@tamagui/button';
import { Text, View } from '@tamagui/core';
import { YStack } from '@tamagui/stacks';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Dimensions,
  Easing,
  StyleSheet,
} from 'react-native';
import ConfettiCannon from 'react-native-confetti-cannon';
import { useAnalytics } from '../hooks/useAnalytics';
import { Design } from '../constants/Design';

const { width, height } = Dimensions.get('window');
const SPINNER_SIZE = width * 0.8;
const SPINS_PER_TURN = 4; // Number of full spins before stopping
const ARROW_LENGTH = SPINNER_SIZE / 2 - 10;
const SPINNER_CENTER_X = width / 2;
const SPINNER_CENTER_Y = height / 2;

const TwisterSpinner = () => {
  const navigation = useNavigation();
  const { capture, isReady } = useAnalytics();
  const rotation = useRef(new Animated.Value(0)).current;
  const [spinning, setSpinning] = useState(false);
  const [baseRotation, setBaseRotation] = useState(0);
  const [showConfetti, setShowConfetti] = useState(false);
  const isMounted = useRef(true);
  const animationRef = useRef<Animated.CompositeAnimation | null>(null);

  useEffect(() => {
    navigation.setOptions({
      headerTitle: 'Spinner',
      headerStyle: {
        backgroundColor: Design.colors.background.light,
        borderBottomWidth: 0,
        shadowOpacity: 0,
        elevation: 0,
      },
      headerTintColor: Design.colors.text.primary,
      headerTitleStyle: {
        fontWeight: Design.typography.weights.bold,
        fontSize: Design.typography.sizes.xl,
      },
    });
  }, [navigation]);

  useEffect(() => {
    if (isReady) {
      capture('entered_spinner');
    }
  }, [capture, isReady]);

  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
      // Stop any running animation on unmount
      if (animationRef.current) {
        animationRef.current.stop();
      }
    };
  }, []);

  const spin = () => {
    if (spinning) return;
    
    setShowConfetti(false);
  
    const randomOffset = Math.random() * 360;
    const fullSpins = SPINS_PER_TURN * 360;
    const targetRotation = baseRotation + fullSpins + randomOffset;
  
    setSpinning(true);
  
    // Save animation ref so we can stop it on unmount
    animationRef.current = Animated.timing(rotation, {
      toValue: targetRotation,
      duration: 3500,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    });

    animationRef.current.start(() => {
      if (isMounted.current) {
        setSpinning(false);
        setBaseRotation(targetRotation);
        setShowConfetti(true);
        // Hide confetti after 3 seconds
        setTimeout(() => setShowConfetti(false), 3000);
      }
    });

    // capture the spin event
    capture('spun_empty_spinner', {
      finalAngle: randomOffset,
      totalRotation: targetRotation,
    });
  };
  
  const rotate = rotation.interpolate({
    inputRange: [0, 360],
    outputRange: ['0deg', '360deg'],
    extrapolate: 'extend',
  });


  return (
    <YStack flex={1} backgroundColor="#F3E889" alignItems="center" justifyContent="center">
      <LinearGradient
        colors={['#F3E889', '#FFE082', '#FFF9C4']}
        style={{ position: 'absolute', left: 0, right: 0, top: 0, bottom: 0 }}
      />
      
      {/* Header with emojis - matching other pages */}
      {
        <YStack 
          position="absolute"
          top={60}
          left={20}
          right={20}
          alignItems="center"
          zIndex={10}
        >
          <Text fontSize={32} marginBottom={8}>🎯</Text>
          <Text fontSize={18} fontWeight="600" color="#333" textAlign="center" marginBottom={8}>
            Classic Spinner!
          </Text>
          <Text fontSize={14} color="#666" textAlign="center" maxWidth={280} lineHeight={20}>
            Place your phone in the center of your group so everyone is equidistant from the spinner!
          </Text>
        </YStack>
      }

      {/* Enhanced spinner circle with gradient */}
      <View style={styles.circleContainer}>
        <LinearGradient
          colors={['#FFE082', '#FFD54F', '#FFC107']}
          style={styles.gradientCircle}
        />
        <View style={styles.innerCircle} />
        
        {/* Center dot */}
        <View style={styles.centerDot} />
      </View>

      {/* Rotating arrow with enhanced styling */}
      <Animated.View style={[styles.arrowContainer, { transform: [{ rotate }] }]}>
        <View style={styles.arrowShadow} />
        <View style={styles.arrow} />
      </Animated.View>

      {/* Enhanced button */}
      <Button
        position="absolute"
        bottom={100}
        alignSelf="center"
        backgroundColor={spinning ? "#FF9800" : "#4CAF50"}
        borderRadius={50}
        paddingHorizontal={40}
        paddingVertical={5}
        pressStyle={{ scale: 0.95, backgroundColor: spinning ? "#F57C00" : "#45a049" }}
        shadowColor="#000"
        shadowOpacity={0.2}
        shadowOffset={{ width: 0, height: 6 }}
        shadowRadius={10 }
        elevation={8}
        onPress={spin}
        disabled={spinning}
      >
        <Text color="white" fontWeight="bold" fontSize={20}>
          {spinning ? '🌀 Spinning...' : '🎯 SPIN!'}
        </Text>
      </Button>

      {/* Result indicator */}
      {!spinning}

      {/* Confetti celebration */}
      {showConfetti && (
        <ConfettiCannon
          count={60}
          origin={{ x: width / 2, y: height / 2 }}
          fadeOut={true}
          explosionSpeed={300}
          fallSpeed={2500}
          colors={['#4CAF50', '#FFD700', '#FF6B6B', '#4ECDC4', '#9B59B6']}
        />
      )}
    </YStack>
  );
};

const styles = StyleSheet.create({
  circleContainer: {
    width: SPINNER_SIZE,
    height: SPINNER_SIZE,
    position: 'absolute',
    top: SPINNER_CENTER_Y - SPINNER_SIZE / 2,
    left: SPINNER_CENTER_X - SPINNER_SIZE / 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  gradientCircle: {
    width: SPINNER_SIZE,
    height: SPINNER_SIZE,
    borderRadius: SPINNER_SIZE / 2,
    position: 'absolute',
  },
  innerCircle: {
    width: SPINNER_SIZE - 20,
    height: SPINNER_SIZE - 20,
    borderRadius: (SPINNER_SIZE - 20) / 2,
    backgroundColor: '#FFF8E1',
    borderWidth: 3,
    borderColor: '#FFB300',
    position: 'absolute',
  },
  centerDot: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#4CAF50',
    borderWidth: 3,
    borderColor: 'white',
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 5,
  },
  arrowContainer: {
    position: 'absolute',
    width: SPINNER_SIZE,
    height: SPINNER_SIZE,
    top: SPINNER_CENTER_Y - SPINNER_SIZE / 2,
    left: SPINNER_CENTER_X - SPINNER_SIZE / 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  arrowShadow: {
    width: 0,
    height: 0,
    borderLeftWidth: 12,
    borderRightWidth: 12,
    borderBottomWidth: ARROW_LENGTH + 2,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderBottomColor: 'rgba(0,0,0,0.2)',
    position: 'absolute',
    top: SPINNER_SIZE / 2 - ARROW_LENGTH - 2,
    left: SPINNER_SIZE / 2 - 12,
  },
  arrow: {
    width: 0,
    height: 0,
    borderLeftWidth: 10,
    borderRightWidth: 10,
    borderBottomWidth: ARROW_LENGTH,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderBottomColor: '#4CAF50',
    position: 'absolute',
    top: SPINNER_SIZE / 2 - ARROW_LENGTH,
    left: SPINNER_SIZE / 2 - 10,
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 5,
  },
});

export default TwisterSpinner;
