import { Text } from '@tamagui/core';
import { XStack, YStack } from '@tamagui/stacks';
import { LinearGradient } from 'expo-linear-gradient';
import { useEffect, useRef } from 'react';
import { Animated, Modal, Pressable, StyleSheet } from 'react-native';
import { Design } from '../constants/Design';
import { useAnalytics } from '../hooks/useAnalytics';

interface RatingPromptProps {
  visible: boolean;
  onDismiss: () => void;
  onComplete: () => void;
  onOpenStore: () => void;
}

export function RatingPrompt({ visible, onDismiss, onComplete, onOpenStore }: RatingPromptProps) {
  const { capture } = useAnalytics();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 250,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 50,
          friction: 7,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      fadeAnim.setValue(0);
      scaleAnim.setValue(0.9);
    }
  }, [visible]);

  const handleYes = () => {
    capture('rating_prompt_yes');
    // Close modal first, then show native prompt
    onComplete();
    // Small delay to ensure modal is closed before native prompt appears
    setTimeout(() => {
      onOpenStore();
    }, 200);
  };

  const handleNo = () => {
    capture('rating_prompt_no');
    onDismiss();
  };

  if (!visible) return null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={handleNo}
    >
      <Pressable
        style={styles.overlay}
        onPress={handleNo}
      >
        <Animated.View
          style={[
            styles.container,
            {
              opacity: fadeAnim,
              transform: [{ scale: scaleAnim }],
            },
          ]}
        >
          <Pressable onPress={(e) => e.stopPropagation()}>
            <LinearGradient
              colors={[Design.colors.background.lightest, Design.colors.background.light]}
              style={styles.content}
            >
              <YStack alignItems="center" space={8} padding={12}>
                <Text
                  fontSize={Design.typography.sizes.md}
                  fontWeight={Design.typography.weights.bold}
                  color={Design.colors.text.primary}
                  textAlign="center"
                >
                  Are you enjoying the app?
                </Text>

                {/* Simple Yes/No Buttons */}
                <XStack space={8} marginTop={0} width="100%">
                  <Pressable
                    onPress={handleNo}
                    style={({ pressed }) => [
                      styles.button,
                      styles.secondaryButton,
                      { opacity: pressed ? 0.7 : 1 },
                    ]}
                  >
                    <Text
                      color={Design.colors.text.secondary}
                      fontWeight={Design.typography.weights.semibold}
                      fontSize={Design.typography.sizes.sm}
                    >
                      Not really
                    </Text>
                  </Pressable>
                  <Pressable
                    onPress={handleYes}
                    style={({ pressed }) => [
                      styles.button,
                      styles.primaryButton,
                      { opacity: pressed ? 0.8 : 1 },
                    ]}
                  >
                    <LinearGradient
                      colors={[Design.colors.primary, Design.colors.primaryDark]}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                      style={styles.buttonGradient}
                    >
                      <Text
                        color={Design.colors.text.white}
                        fontWeight={Design.typography.weights.bold}
                        fontSize={Design.typography.sizes.sm}
                      >
                        Yes!
                      </Text>
                    </LinearGradient>
                  </Pressable>
                </XStack>
              </YStack>
            </LinearGradient>
          </Pressable>
        </Animated.View>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  container: {
    width: '65%',
    maxWidth: 240,
    alignSelf: 'center',
  },
  content: {
    borderRadius: Design.borderRadius.lg,
    overflow: 'hidden',
    ...Design.shadows.md,
  },
  button: {
    flex: 1,
    borderRadius: Design.borderRadius.sm,
    overflow: 'hidden',
    minHeight: 32,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 4,
  },
  primaryButton: {
    ...Design.shadows.sm,
  },
  secondaryButton: {
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
  },
  buttonGradient: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
});

