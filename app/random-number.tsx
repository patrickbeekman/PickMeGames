import React, { useState } from 'react';
import { Animated, Easing, Pressable, StyleSheet, Text, View } from 'react-native';

export default function RandomNumberGuesser() {
  const [randomNumber, setRandomNumber] = useState<number | null>(null);
  const [animatedValue] = useState(new Animated.Value(0));
  const [showingNumber, setShowingNumber] = useState(false);

  const revealNumber = () => {
    const number = Math.floor(Math.random() * 100) + 1;
    setRandomNumber(number);
    setShowingNumber(true);
    animatedValue.setValue(0);

    Animated.timing(animatedValue, {
      toValue: 1,
      duration: 1500,
      easing: Easing.out(Easing.exp),
      useNativeDriver: true,
    }).start();
  };

  const scale = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 1],
  });

  const opacity = animatedValue;

  return (
    <View style={styles.container}>
      <Text style={styles.ruleText}>Closest guess without going over wins!</Text>

      {showingNumber && randomNumber !== null && (
        <Animated.Text style={[styles.number, { opacity, transform: [{ scale }] }]}>
          {randomNumber}
        </Animated.Text>
      )}

      <Pressable style={styles.button} onPress={revealNumber}>
        <Text style={styles.buttonText}>Reveal Number</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3E889',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  ruleText: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 40,
    textAlign: 'center',
  },
  number: {
    fontSize: 72,
    fontWeight: 'bold',
    color: 'rgba(70, 187, 24, 0.6)',
    marginBottom: 40,
  },
  button: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 999,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
  },
  buttonText: {
    fontSize: 18,
    color: '#fff',
    fontWeight: 'bold',
  },
});
