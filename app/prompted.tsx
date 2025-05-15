import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import prompts from '../assets/prompts.json';

export default function PromptSelector() {
  const [currentIndex, setCurrentIndex] = useState(() =>
    Math.floor(Math.random() * prompts.length)
  );

  const nextPrompt = () => {
    let next;
    do {
        next = Math.floor(Math.random() * prompts.length);
    } while (prompts.length > 1 && next === currentIndex);
    setCurrentIndex(next);
  };

  const currentPrompt = prompts[currentIndex];

  return (
    <View style={styles.container}>
      <View style={styles.promptBox}>
        <Text style={styles.promptText}>{currentPrompt}</Text>
      </View>

      <Pressable style={styles.button} onPress={nextPrompt}>
        <Text style={styles.buttonText}>Next Prompt</Text>
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
  promptBox: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginVertical: 20,
    maxWidth: '90%',
    maxHeight: '60%',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 8,
    elevation: 4,
  },
  promptText: {
    fontSize: 20,
    color: '#333',
    textAlign: 'center',
  },
  button: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 24,
    paddingVertical: 12,
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
