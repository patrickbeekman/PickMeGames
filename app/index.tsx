import { Link } from 'expo-router';
import { usePostHog } from 'posthog-react-native';
import { useEffect } from 'react';
import { Image, Pressable, SafeAreaView, StatusBar, Text, View } from 'react-native';


export default function HomeScreen() {
  const posthog = usePostHog();
  const options = [
    { title: 'Multifinger Tap', route: '/finger-tap' },
    { title: 'Spinner', route: '/spinner' },
    { title: 'Numbered Spinner', route: '/numbered-spinner' },
    { title: 'Random Number', route: '/random-number' },
    { title: 'Prompted', route: '/prompted' },
  ];

  useEffect(() => {
      posthog.capture('entered_finger_tap');
    }, []);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#CCCB85' }}>
      <StatusBar barStyle="dark-content" backgroundColor="#CCCB85" />
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
        {/* Logo or App Icon */}
        <Image
          source={require('../assets/images/pickmelogo.png')} // Add your logo to assets
          style={{ width: 200, height: 200, marginBottom: 24 }}
          resizeMode="contain"
        />
        <Text style={{ fontSize: 28, color: '#555', fontWeight: "bold", textAlign: 'center', marginBottom: 32 }}>
          Select a method to pick Player 1
        </Text>
      {options.map((opt) => (
        <Link href={opt.route as any} asChild key={opt.route}>
          <Pressable
            style={{
              paddingVertical: 18,
              paddingHorizontal: 32,
              borderRadius: 12,
              width: 280,
              backgroundColor: '#4CAF50',
              marginBottom: 20,
              alignItems: 'center',
              shadowColor: '#000123',
              shadowOpacity: 0.12,
              shadowOffset: { width: 0, height: 10 },
              shadowRadius: 8,
              elevation: 3,
            }}
          >
            <Text style={{ color: 'white', fontSize: 18 }}>{opt.title}</Text>
          </Pressable>
        </Link>
      ))}
      </View>
    </SafeAreaView>
  );
}
