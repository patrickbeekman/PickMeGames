// app/about.tsx
import Constants from 'expo-constants';
import { StyleSheet, Text, View } from 'react-native';

export default function AboutScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>About This App</Text>
      <Text style={styles.text}>Version: {Constants.expoConfig?.version ?? '1.0.0'}</Text>
      <Text style={styles.text}>Created by Patrick Beekman for fun and learning 🎲</Text>
      <Text style={styles.text}>No ads. Just games.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3E889',
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  text: {
    fontSize: 16,
    marginBottom: 8,
  },
});
