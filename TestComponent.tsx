import React from "react";
import { View, Text } from "react-native";

// Teste simples para verificar se as importações estão funcionando
import ImageViewer from "./src/components/ImageViewer";
import MarkerControl from "./src/components/MarkerControl";
import Joystick from "./src/components/Joystick";

const TestComponent: React.FC = () => {
  return (
    <View>
      <Text>Test Component</Text>
    </View>
  );
};

export default TestComponent;
