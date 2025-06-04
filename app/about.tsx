// app/about.tsx
import Constants from 'expo-constants';
import { Linking, Pressable, StyleSheet, Text, View } from 'react-native';

export default function AboutScreen() {
  const openGitHub = () => {
    Linking.openURL('https://github.com/patrickbeekman/PickMeGames/tree/master');
  };

  const openFeedback = () => {
    Linking.openURL('https://airtable.com/appPI2noUjKkmeNWM/pagrjCubfIJqODIOQ/form');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>About This App</Text>
      <Text style={styles.text}>Version: {Constants.expoConfig?.version ?? '1.0.0'}</Text>
      <Text style={styles.text}>Created by Patrick Beekman</Text>
      <Text style={styles.text}>For fun and learning 🎲</Text>
      <Text style={styles.text}>No ads. Just games.</Text>

      <Pressable style={styles.githubButton} onPress={openGitHub}>
        <Text style={styles.githubIcon}>⚙️</Text>
        <Text style={styles.githubText}>View on GitHub</Text>
      </Pressable>
      
      <Pressable style={styles.feedbackButton} onPress={openFeedback}>
        <Text style={styles.feedbackIcon}>💬</Text>
        <Text style={styles.feedbackText}>Send Feedback</Text>
      </Pressable>
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
  githubButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#333',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 20,
  },
  githubIcon: {
    fontSize: 18,
    marginRight: 8,
  },
  githubText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  feedbackButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#4CAF50',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 12,
  },
  feedbackIcon: {
    fontSize: 18,
    marginRight: 8,
  },
  feedbackText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});
