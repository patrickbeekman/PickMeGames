import React, { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

export default function NumberGuesser() {
  const [randomNumber, setRandomNumber] = useState<number | null>(null);
  const [isRevealing, setIsRevealing] = useState(false);
  const [animatedNumber, setAnimatedNumber] = useState('?');

  const revealNumber = () => {
    if (isRevealing) return;
    setIsRevealing(true);
  };

  useEffect(() => {
    if (isRevealing) {
      const interval = setInterval(() => {
        setAnimatedNumber(String(Math.floor(Math.random() * 100) + 1));
      }, 50);

      const timeout = setTimeout(() => {
        clearInterval(interval);
        const final = Math.floor(Math.random() * 100) + 1;
        setRandomNumber(final);
        setAnimatedNumber(String(final));
        setIsRevealing(false);
      }, 1000);

      return () => {
        clearInterval(interval);
        clearTimeout(timeout);
      };
    }
  }, [isRevealing]);

  return (
    <View style={styles.container}>
      <Text style={styles.rules}>Everyone pick a number from 1 to 100.
        Closest guess without going over wins!</Text>
      <View style={styles.revealBox}>
        <Text style={styles.revealText}>
          {isRevealing ? animatedNumber : randomNumber !== null ? randomNumber : '?'}
        </Text>
      </View>
      <Pressable style={styles.button} onPress={revealNumber} disabled={isRevealing}>
        <Text style={styles.buttonText}>{isRevealing ? 'Revealing...' : 'Reveal Number'}</Text>
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
    padding: 20,
  },
  rules: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 30,
    color: '#444',
    textAlign: 'center',
  },
  revealBox: {
    width: 150,
    height: 150,
    borderRadius: 12,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
    marginBottom: 40,
  },
  revealText: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
  },
  button: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 999,
  },
  buttonText: {
    fontSize: 18,
    color: '#fff',
    fontWeight: 'bold',
  },
});
