import React, { useEffect } from "react";
import { View, StyleSheet, Dimensions } from "react-native";
import {
  PanGestureHandler,
  PanGestureHandlerGestureEvent,
} from "react-native-gesture-handler";
import Animated, {
  useAnimatedGestureHandler,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  runOnJS,
  interpolate,
  Extrapolate,
} from "react-native-reanimated";
import Svg, { Circle } from "react-native-svg";

interface JoystickProps {
  onMove: (deltaX: number, deltaY: number, intensity: number) => void;
  size?: number;
  knobSize?: number;
  backgroundColor?: string;
  knobColor?: string;
  borderColor?: string;
  sensitivity?: number;
}

const Joystick: React.FC<JoystickProps> = ({
  onMove,
  size = 80,
  knobSize = 32,
  backgroundColor = "#f0f0f0",
  knobColor = "#007AFF",
  borderColor = "#cccccc",
  sensitivity = 1,
}) => {
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const isActive = useSharedValue(false);

  const maxDistance = (size - knobSize) / 2;

  const panGestureHandler =
    useAnimatedGestureHandler<PanGestureHandlerGestureEvent>({
      onStart: () => {
        isActive.value = true;
      },
      onActive: (event) => {
        const distance = Math.sqrt(
          event.translationX * event.translationX +
            event.translationY * event.translationY
        );

        if (distance <= maxDistance) {
          translateX.value = event.translationX;
          translateY.value = event.translationY;
        } else {
          // Limitar à borda do círculo
          const angle = Math.atan2(event.translationY, event.translationX);
          translateX.value = Math.cos(angle) * maxDistance;
          translateY.value = Math.sin(angle) * maxDistance;
        }

        // Calcular valores normalizados (-1 a 1)
        const normalizedX = translateX.value / maxDistance;
        const normalizedY = translateY.value / maxDistance;
        const intensity = Math.min(
          Math.sqrt(normalizedX * normalizedX + normalizedY * normalizedY),
          1
        );

        // Aplicar sensibilidade
        const deltaX = normalizedX * sensitivity;
        const deltaY = normalizedY * sensitivity;

        runOnJS(onMove)(deltaX, deltaY, intensity);
      },
      onEnd: () => {
        isActive.value = false;
        translateX.value = withSpring(0);
        translateY.value = withSpring(0);
        runOnJS(onMove)(0, 0, 0);
      },
    });

  const animatedKnobStyle = useAnimatedStyle(() => {
    const scale = interpolate(
      isActive.value ? 1 : 0,
      [0, 1],
      [1, 1.1],
      Extrapolate.CLAMP
    );

    return {
      transform: [
        { translateX: translateX.value },
        { translateY: translateY.value },
        { scale },
      ],
    };
  });

  const animatedBaseStyle = useAnimatedStyle(() => {
    const scale = interpolate(
      isActive.value ? 1 : 0,
      [0, 1],
      [1, 1.05],
      Extrapolate.CLAMP
    );

    return {
      transform: [{ scale }],
    };
  });

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      <Animated.View
        style={[
          styles.base,
          {
            width: size,
            height: size,
            backgroundColor,
            borderColor,
            borderRadius: size / 2,
          },
          animatedBaseStyle,
        ]}
      >
        <PanGestureHandler onGestureEvent={panGestureHandler}>
          <Animated.View
            style={[
              styles.knob,
              {
                width: knobSize,
                height: knobSize,
                backgroundColor: knobColor,
                borderRadius: knobSize / 2,
              },
              animatedKnobStyle,
            ]}
          />
        </PanGestureHandler>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: "center",
    alignItems: "center",
  },
  base: {
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  knob: {
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
});

export default Joystick;
