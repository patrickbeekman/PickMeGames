import { Link } from 'expo-router';
import { Pressable, Text, View } from 'react-native';

export default function HomeScreen() {
  const options = [
    { title: 'Multifinger Tap', route: '/finger-tap' },
    { title: 'Spinner', route: '/spinner' },
  ];

  return (
    <View style={{ flex: 1, justifyContent: 'center', padding: 20, backgroundColor: '#F3E889' }}>
      <Text style={{ fontSize: 24, fontWeight: 'bold', textAlign: 'center', marginBottom: 40 }}>
        Select a Method to Pick Player 1
      </Text>
      {options.map((opt) => (
        <Link href={opt.route as any} asChild key={opt.route}>
          <Pressable
            style={{
              padding: 20,
              borderRadius: 12,
              backgroundColor: '#4CAF50',
              marginBottom: 20,
              alignItems: 'center',
            }}
          >
            <Text style={{ color: 'white', fontSize: 18 }}>{opt.title}</Text>
          </Pressable>
        </Link>
      ))}
    </View>
  );
}
