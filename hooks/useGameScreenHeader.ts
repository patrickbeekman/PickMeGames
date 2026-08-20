import { useNavigation } from 'expo-router';
import { useEffect } from 'react';
import { Design } from '../constants/Design';

export function useGameScreenHeader(title: string) {
  const navigation = useNavigation();
  useEffect(() => {
    navigation.setOptions({
      headerTitle: title,
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
  }, [navigation, title]);
}
