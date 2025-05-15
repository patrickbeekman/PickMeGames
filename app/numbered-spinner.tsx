import Slider from '@react-native-community/slider';
import React, { useRef, useState } from 'react';
import { Animated, Easing, Pressable, StyleSheet, Text, View } from 'react-native';
import Svg, { G, Path, Text as SvgText } from 'react-native-svg';

const SPINNER_SIZE = 300;

export default function SpinnerSelector() {
  const [playerCount, setPlayerCount] = useState(6);
  const [spinning, setSpinning] = useState(false);
  const rotation = useRef(new Animated.Value(0)).current;

  const spin = () => {
    if (spinning) return;

    const fullRotation = 5 * 360;
    const randomOffset = Math.floor(Math.random() * 360);
    const targetRotation = fullRotation + randomOffset;

    rotation.setValue(0);
    setSpinning(true);

    Animated.timing(rotation, {
      toValue: targetRotation,
      duration: 3000,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start(() => {
    setSpinning(false);
    
    // const normalizedRotation = targetRotation % 360;
    // const pointerAngle = 180; // The arrow is pointing downwards at 180°
    // const effectiveAngle = (normalizedRotation - pointerAngle + 360) % 360;

    // const segmentSize = 360 / playerCount;

    });
  };

  const renderWheel = () => {
    const angleStep = 360 / playerCount;
    const radius = SPINNER_SIZE / 2;
    const paths = [];

    for (let i = 0; i < playerCount; i++) {
      const startAngle = (i * angleStep * Math.PI) / 180;
      const endAngle = ((i + 1) * angleStep * Math.PI) / 180;

      const x1 = radius + radius * Math.cos(startAngle);
      const y1 = radius + radius * Math.sin(startAngle);
      const x2 = radius + radius * Math.cos(endAngle);
      const y2 = radius + radius * Math.sin(endAngle);

      const largeArc = angleStep > 180 ? 1 : 0;

      const pathData = `
        M ${radius} ${radius}
        L ${x1} ${y1}
        A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2}
        Z
      `;

      const midAngle = (startAngle + endAngle) / 2;
      const labelX = radius + (radius * 0.6) * Math.cos(midAngle);
      const labelY = radius + (radius * 0.6) * Math.sin(midAngle);

      paths.push(
        <G key={i}>
          <Path d={pathData} fill={`hsl(${(i * 360) / playerCount}, 80%, 60%)`} />
          <SvgText
            x={labelX}
            y={labelY}
            fontSize="16"
            fontWeight="bold"
            fill="#fff"
            textAnchor="middle"
            alignmentBaseline="middle"
          >
            {i + 1}
          </SvgText>
        </G>
      );
    }

    return paths;
  };

  const rotate = rotation.interpolate({
    inputRange: [0, 360],
    outputRange: ['0deg', '360deg'],
    extrapolate: 'extend',
  });

  return (
    <View style={styles.container}>

      {/* Arrow Pointer */}
      <View style={styles.arrow} />

      {/* Spinner */}
      <Animated.View style={{ transform: [{ rotate }] }}>
        <Svg width={SPINNER_SIZE} height={SPINNER_SIZE}>
          {renderWheel()}
        </Svg>
      </Animated.View>

      {/* Player Count Slider */}
      <View style={styles.sliderContainer}>
        <Text style={styles.sliderLabel}>Players: {playerCount}</Text>
        <Slider
          minimumValue={2}
          maximumValue={15}
          step={1}
          value={playerCount}
          onValueChange={setPlayerCount}
          disabled={spinning}
          style={{ width: 250 }}
        />
      </View>

      {/* Spin Button */}
      <Pressable style={styles.button} onPress={spin} disabled={spinning}>
        <Text style={styles.buttonText}>{spinning ? 'Spinning...' : 'Spin!'}</Text>
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
  },
arrow: {
  position: 'absolute',
  top: '20%',
  transform: [{ rotate: '0deg' }], // <-- now points down
  width: 0,
  height: 0,
  borderLeftWidth: 12,
  borderRightWidth: 12,
  borderTopWidth: 30,
  borderLeftColor: 'transparent',
  borderRightColor: 'transparent',
  borderTopColor: '#D32F2F',
  zIndex: 10,
},
  sliderContainer: {
    marginTop: 20,
    alignItems: 'center',
  },
  sliderLabel: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 8,
  },
  button: {
    position: 'absolute',
    bottom: 80,
    alignSelf: 'center',
    backgroundColor: '#F57C00',
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
