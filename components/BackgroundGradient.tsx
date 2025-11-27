import { LinearGradient } from 'expo-linear-gradient';
import { StyleSheet } from 'react-native';

/**
 * Enhanced background gradient component with modern, vibrant colors
 * Includes subtle texture effect through multiple gradient stops
 * Fills entire screen including safe areas
 */
export function BackgroundGradient() {
  return (
    <LinearGradient
      colors={[
        '#FFF8DC', // Soft cream (top)
        '#FFE082', // Warm yellow
        '#FFD54F', // Bright yellow
        '#FFC107', // Golden yellow
        '#FFB300', // Deep golden
        '#FFA000', // Rich amber
        '#FF8F00', // Warm orange-yellow
        '#FFE082', // Back to warm yellow
        '#FFF9C4', // Light cream (bottom)
      ]}
      locations={[0, 0.12, 0.25, 0.38, 0.5, 0.62, 0.75, 0.88, 1]}
      start={{ x: 0, y: 0 }}
      end={{ x: 0, y: 1 }}
      style={StyleSheet.absoluteFillObject}
    />
  );
}

/**
 * Alternative radial gradient for special screens
 * Creates a more dynamic, sun-like effect
 */
export function RadialBackgroundGradient() {
  return (
    <LinearGradient
      colors={[
        '#FFF9C4', // Light cream
        '#FFE082', // Warm yellow
        '#FFD54F', // Bright yellow
        '#FFC107', // Golden yellow
        '#FFB300', // Deep golden
      ]}
      locations={[0, 0.3, 0.6, 0.85, 1]}
      start={{ x: 0.5, y: 0 }}
      end={{ x: 0.5, y: 1 }}
      style={StyleSheet.absoluteFillObject}
    />
  );
}

