import React from 'react';
import {
  View,
  Image,
  StyleSheet,
  Dimensions,
  TouchableWithoutFeedback,
} from 'react-native';
import {
  PanGestureHandler,
  PinchGestureHandler,
  PanGestureHandlerGestureEvent,
  PinchGestureHandlerGestureEvent,
} from 'react-native-gesture-handler';
import Animated, {
  useAnimatedGestureHandler,
  useAnimatedStyle,
  useSharedValue,
  runOnJS,
} from 'react-native-reanimated';
import Svg, { Circle, Line, G } from 'react-native-svg';
import { Point } from '../types';

interface ImageViewerProps {
  imageUri: string;
  measurementPoints: (Point & { id: string })[];
  onAddPoint: (point: Point) => void;
  isPointAddingMode: boolean;
}

const ImageViewer: React.FC<ImageViewerProps> = ({
  imageUri,
  measurementPoints,
  onAddPoint,
  isPointAddingMode,
}) => {
  const { width: screenWidth } = Dimensions.get('window');
  
  // Assume um aspect ratio 4:3 para a imagem
  const imageAspectRatio = 4 / 3;
  const displayWidth = screenWidth * 0.95; // Aumentado de 0.9 para 0.95
  const displayHeight = displayWidth / imageAspectRatio;
  
  // Dimensões reais da imagem (será ajustado quando soubermos as dimensões reais)
  const imageWidth = displayWidth;
  const imageHeight = displayHeight;

  // Valores compartilhados para animações
  const scale = useSharedValue(1);
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);

  // Gesture handler para pinch (zoom)
  const pinchGestureHandler = useAnimatedGestureHandler<PinchGestureHandlerGestureEvent>({
    onStart: (_, context: any) => {
      context.startScale = scale.value;
    },
    onActive: (event, context: any) => {
      scale.value = Math.max(1, Math.min(5, context.startScale * event.scale)); // Aumentado de 3 para 5
    },
  });

  // Gesture handler para pan (arrastar) e tap
  const panGestureHandler = useAnimatedGestureHandler<PanGestureHandlerGestureEvent>({
    onStart: (event, context: any) => {
      context.startX = translateX.value;
      context.startY = translateY.value;
      context.startTime = Date.now();
      context.moved = false;
      context.initialX = event.absoluteX;
      context.initialY = event.absoluteY;
    },
    onActive: (event, context: any) => {
      // Se o usuário mover mais de 10 pixels, considera como pan
      if (Math.abs(event.translationX) > 10 || Math.abs(event.translationY) > 10) {
        context.moved = true;
        
        const maxTranslateX = (displayWidth * (scale.value - 1)) / 2;
        const maxTranslateY = (displayHeight * (scale.value - 1)) / 2;
        
        translateX.value = Math.max(
          -maxTranslateX,
          Math.min(maxTranslateX, context.startX + event.translationX)
        );
        translateY.value = Math.max(
          -maxTranslateY,
          Math.min(maxTranslateY, context.startY + event.translationY)
        );
      }
    },
    onEnd: (event, context: any) => {
      // Se não moveu e foi um toque rápido, trata como tap
      const duration = Date.now() - context.startTime;
      if (!context.moved && duration < 300 && isPointAddingMode) {
        // Usar handleSimpleTap em vez de handleImageTap
        const locationX = context.initialX;
        const locationY = context.initialY;
        runOnJS(() => {
          const imagePoint: Point = {
            x: (locationX / displayWidth) * imageWidth,
            y: (locationY / displayHeight) * imageHeight
          };
          onAddPoint(imagePoint);
        })();
      }
    },
  });

  // Estilo animado para a imagem
  const animatedImageStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { translateX: translateX.value },
        { translateY: translateY.value },
        { scale: scale.value },
      ],
    };
  });

  // Converte coordenadas da tela para coordenadas da imagem
  const screenToImageCoordinates = (screenX: number, screenY: number): Point => {
    const imageX = (screenX / displayWidth) * imageWidth;
    const imageY = (screenY / displayHeight) * imageHeight;
    return { x: imageX, y: imageY };
  };

  // Converte coordenadas da imagem para coordenadas da tela
  const imageToScreenCoordinates = (imagePoint: Point): Point => {
    const screenX = (imagePoint.x / imageWidth) * displayWidth;
    const screenY = (imagePoint.y / imageHeight) * displayHeight;
    return { x: screenX, y: screenY };
  };

  // Renderiza um ponto de mira (círculo + cruz)
  const renderCrosshair = (point: Point & { id: string }, index: number) => {
    const screenPoint = imageToScreenCoordinates(point);
    
    // Tamanho base da mira que diminui com o zoom - agora mais fino
    const baseSize = 10; // Reduzido de 12 para 10
    const crosshairSize = baseSize / Math.max(1, scale.value * 0.8); // Aumentado multiplicador para diminuir mais com zoom
    const circleRadius = crosshairSize * 0.7; // Reduzido de 0.8 para 0.7
    const crossLength = crosshairSize * 1.4; // Aumentado de 1.2 para 1.4 (cruz mais longa)
    
    // Cores diferentes para pontos esquerdo e direito
    const strokeColor = index === 0 ? '#ff4444' : '#4444ff';
    const fillColor = index === 0 ? '#ff444420' : '#4444ff20'; // Mais transparente
    
    return (
      <G key={point.id}>
        {/* Círculo externo */}
        <Circle
          cx={screenPoint.x}
          cy={screenPoint.y}
          r={circleRadius}
          fill={fillColor}
          stroke={strokeColor}
          strokeWidth={1} // Reduzido de 2 para 1
        />
        
        {/* Cruz horizontal */}
        <Line
          x1={screenPoint.x - crossLength}
          y1={screenPoint.y}
          x2={screenPoint.x + crossLength}
          y2={screenPoint.y}
          stroke={strokeColor}
          strokeWidth={1} // Reduzido de 2 para 1
        />
        
        {/* Cruz vertical */}
        <Line
          x1={screenPoint.x}
          y1={screenPoint.y - crossLength}
          x2={screenPoint.x}
          y2={screenPoint.y + crossLength}
          stroke={strokeColor}
          strokeWidth={1} // Reduzido de 2 para 1
        />
        
        {/* Ponto central */}
        <Circle
          cx={screenPoint.x}
          cy={screenPoint.y}
          r={1} // Reduzido de 1.5 para 1
          fill={strokeColor}
        />
      </G>
    );
  };

  // Função simplificada para tap usando TouchableWithoutFeedback
  const handleSimpleTap = (event: any) => {
    if (!isPointAddingMode) return;
    
    const { locationX, locationY } = event.nativeEvent;
    
    console.log('Touch event received:', { locationX, locationY });
    
    // Converter coordenadas do toque para coordenadas da imagem
    const imagePoint: Point = {
      x: (locationX / displayWidth) * imageWidth,
      y: (locationY / displayHeight) * imageHeight
    };
    
    console.log('ImageViewer - Converted to image coordinates:', imagePoint);
    onAddPoint(imagePoint);
  };

  return (
    <View style={styles.container}>
      <PinchGestureHandler onGestureEvent={pinchGestureHandler}>
        <Animated.View>
          <PanGestureHandler
            onGestureEvent={panGestureHandler}
            shouldCancelWhenOutside={true}
            minPointers={1}
            maxPointers={1}
          >
            <Animated.View style={styles.imageContainer}>
              <Animated.View style={animatedImageStyle}>
                <TouchableWithoutFeedback onPress={handleSimpleTap}>
                  <View>
                    <Image
                      source={{ uri: imageUri }}
                      style={[
                        styles.image,
                        { width: displayWidth, height: displayHeight },
                      ]}
                    />
                    
                    {/* SVG para desenhar os pontos de mira */}
                    <Svg
                      style={StyleSheet.absoluteFill}
                      width={displayWidth}
                      height={displayHeight}
                      pointerEvents="none"
                    >
                      {measurementPoints.map((point, index) => renderCrosshair(point, index))}
                    </Svg>
                  </View>
                </TouchableWithoutFeedback>
              </Animated.View>
            </Animated.View>
          </PanGestureHandler>
        </Animated.View>
      </PinchGestureHandler>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f8f8',
  },
  imageContainer: {
    overflow: 'hidden',
    borderRadius: 8,
  },
  image: {
    resizeMode: 'contain',
  },
});

export default ImageViewer;
