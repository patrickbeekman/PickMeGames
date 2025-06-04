import { Link, useNavigation } from 'expo-router';
import { usePostHog } from 'posthog-react-native';
import { useEffect, useLayoutEffect } from 'react';
import { Image, Linking, Pressable, SafeAreaView, StatusBar, Text, View } from 'react-native';


export default function HomeScreen() {
  const navigation = useNavigation();

  useLayoutEffect(() => {
    navigation.setOptions({
      title: '',
    });
  }, [navigation]);

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
    <SafeAreaView style={{ flex: 1, backgroundColor: '#F3E889' }}>
      <StatusBar barStyle="dark-content" backgroundColor="#F3E889" />
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
        {/* Logo or App Icon */}
        <Image
          source={require('../assets/images/pickmelogo_transparent.png')} // Add your logo to assets
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
      <View style={{ flexDirection: 'row', justifyContent: 'center', marginTop: 12 }}>
          <Pressable
            onPress={() => Linking.openURL('https://www.buymeacoffee.com/pickmegames')}
            style={{
              flex: 1,
              backgroundColor: '#FFD700',
              paddingVertical: 16,
              borderRadius: 12,
              alignItems: 'center',
              marginRight: 5,
              marginLeft: 20,
              width: 90,
            }}
          >
            <Text style={{ color: '#333', fontWeight: 'bold', fontSize: 16 }}>Buy me a coffee</Text>
        </Pressable>
        <Link href="/about" asChild>
          <Pressable
            style={{
              flex: 1,
              backgroundColor: '#4CAF50',
              paddingVertical: 16,
              borderRadius: 12,
              alignItems: 'center',
              marginLeft: 5,
              marginRight: 20,
              width: 90,
            }}
          >
            <Text style={{ color: 'white', fontWeight: 'bold', fontSize: 16 }}>About</Text>
          </Pressable>
        </Link>
      </View>
    </SafeAreaView>
  );
}
