import React, { forwardRef, useImperativeHandle, useRef } from "react";
import {
  View,
  Image,
  StyleSheet,
  Dimensions,
  TouchableWithoutFeedback,
} from "react-native";
import {
  PanGestureHandler,
  PinchGestureHandler,
  PanGestureHandlerGestureEvent,
  PinchGestureHandlerGestureEvent,
} from "react-native-gesture-handler";
import Animated, {
  useAnimatedGestureHandler,
  useAnimatedStyle,
  useSharedValue,
  runOnJS,
} from "react-native-reanimated";
import Svg, { Circle, Line, G } from "react-native-svg";
import { captureRef } from "react-native-view-shot";
import { Point, MeasurementType } from "../types";

interface ImageViewerProps {
  imageUri: string;
  measurementPoints: (Point & { id: string; type?: MeasurementType })[];
  onAddPoint: (point: Point) => void;
  isPointAddingMode: boolean;
}

export interface ImageViewerRef {
  captureImage: () => Promise<string>;
}

const ImageViewer = forwardRef<ImageViewerRef, ImageViewerProps>(
  ({ imageUri, measurementPoints, onAddPoint, isPointAddingMode }, ref) => {
    const { width: screenWidth } = Dimensions.get("window");
    const viewRef = useRef<View>(null);

    // Assume um aspect ratio 4:5 para a imagem
    const imageAspectRatio = 4 / 4.4;
    const displayWidth = screenWidth * 0.98; // Aumentado de 0.9 para 0.98
    const displayHeight = displayWidth / imageAspectRatio;

    // Dimensões reais da imagem (será ajustado quando soubermos as dimensões reais)
    const imageWidth = displayWidth;
    const imageHeight = displayHeight;

    // Valores compartilhados para animações
    const scale = useSharedValue(1);
    const translateX = useSharedValue(0);
    const translateY = useSharedValue(0);

    // Gesture handler para pinch (zoom)
    const pinchGestureHandler =
      useAnimatedGestureHandler<PinchGestureHandlerGestureEvent>({
        onStart: (_, context: any) => {
          context.startScale = scale.value;
        },
        onActive: (event, context: any) => {
          scale.value = Math.max(
            1,
            Math.min(6, context.startScale * event.scale)
          ); // Aumentado de 5 para 6
        },
      });

    // Gesture handler para pan (arrastar) e tap
    const panGestureHandler =
      useAnimatedGestureHandler<PanGestureHandlerGestureEvent>({
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
          if (
            Math.abs(event.translationX) > 10 ||
            Math.abs(event.translationY) > 10
          ) {
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
                y: (locationY / displayHeight) * imageHeight,
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
    const screenToImageCoordinates = (
      screenX: number,
      screenY: number
    ): Point => {
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
    const renderCrosshair = (
      point: Point & { id: string; type?: MeasurementType },
      index: number
    ) => {
      const screenPoint = imageToScreenCoordinates(point);

      // Tamanho base da mira que diminui com o zoom - agora mais fino
      const baseSize = 10; // Reduzido de 12 para 10
      const crosshairSize = baseSize / Math.max(1, scale.value * 0.8); // Aumentado multiplicador para diminuir mais com zoom
      const circleRadius = crosshairSize * 0.7; // Reduzido de 0.8 para 0.7
      const crossLength = crosshairSize * 1.4; // Aumentado de 1.2 para 1.4 (cruz mais longa)

      // Cores baseadas no tipo do ponto
      let strokeColor = "#666";
      let fillColor = "#66666620";

      if (point.type) {
        switch (point.type) {
          case MeasurementType.LEFT_PUPIL:
            strokeColor = "#ff4444";
            fillColor = "#ff444420";
            break;
          case MeasurementType.RIGHT_PUPIL:
            strokeColor = "#4444ff";
            fillColor = "#4444ff20";
            break;
          case MeasurementType.BRIDGE_CENTER:
            strokeColor = "#FF6600";
            fillColor = "#FF660020";
            break;
          case MeasurementType.LEFT_LENS_BOTTOM:
            strokeColor = "#9966CC";
            fillColor = "#9966CC20";
            break;
          case MeasurementType.RIGHT_LENS_BOTTOM:
            strokeColor = "#CC6699";
            fillColor = "#CC669920";
            break;
          case MeasurementType.CARD_LEFT:
            strokeColor = "#ff4444";
            fillColor = "#ff444420";
            break;
          case MeasurementType.CARD_RIGHT:
            strokeColor = "#4444ff";
            fillColor = "#4444ff20";
            break;
          default:
            // Cores diferentes para pontos esquerdo e direito (fallback)
            strokeColor = index === 0 ? "#ff4444" : "#4444ff";
            fillColor = index === 0 ? "#ff444420" : "#4444ff20";
        }
      } else {
        // Cores diferentes para pontos esquerdo e direito (fallback)
        strokeColor = index === 0 ? "#ff4444" : "#4444ff";
        fillColor = index === 0 ? "#ff444420" : "#4444ff20";
      }

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

    // Renderiza uma linha horizontal conectando os pontos da DP (distância pupilar)
    const renderDPLine = () => {
      const leftPupil = measurementPoints.find(
        (p) => p.type === MeasurementType.LEFT_PUPIL
      );
      const rightPupil = measurementPoints.find(
        (p) => p.type === MeasurementType.RIGHT_PUPIL
      );

      if (!leftPupil || !rightPupil) return null;

      const leftScreen = imageToScreenCoordinates(leftPupil);
      const rightScreen = imageToScreenCoordinates(rightPupil);

      return (
        <Line
          x1={leftScreen.x}
          y1={leftScreen.y}
          x2={rightScreen.x}
          y2={rightScreen.y}
          stroke="#00AA00"
          strokeWidth={2}
          strokeDasharray="5,3"
          opacity={0.8}
        />
      );
    };

    // Renderiza uma linha vertical passando pelo centro nasal
    const renderNasalCenterLine = () => {
      const bridgeCenter = measurementPoints.find(
        (p) => p.type === MeasurementType.BRIDGE_CENTER
      );

      if (!bridgeCenter) return null;

      const centerScreen = imageToScreenCoordinates(bridgeCenter);

      return (
        <Line
          x1={centerScreen.x}
          y1={0}
          x2={centerScreen.x}
          y2={displayHeight}
          stroke="#FF6600"
          strokeWidth={2}
          strokeDasharray="8,4"
          opacity={0.7}
        />
      );
    };

    // Função para capturar a imagem como screenshot
    useImperativeHandle(ref, () => ({
      captureImage: async (): Promise<string> => {
        try {
          if (viewRef.current) {
            const uri = await captureRef(viewRef.current, {
              format: "png",
              quality: 0.8,
            });
            return uri;
          }
          throw new Error("Referência da view não encontrada");
        } catch (error) {
          console.error("Erro ao capturar imagem:", error);
          throw error;
        }
      },
    }));

    // Função simplificada para tap usando TouchableWithoutFeedback
    const handleSimpleTap = (event: any) => {
      if (!isPointAddingMode) return;

      const { locationX, locationY } = event.nativeEvent;

      console.log("Touch event received:", { locationX, locationY });

      // Converter coordenadas do toque para coordenadas da imagem
      const imagePoint: Point = {
        x: (locationX / displayWidth) * imageWidth,
        y: (locationY / displayHeight) * imageHeight,
      };

      console.log("ImageViewer - Converted to image coordinates:", imagePoint);
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
                    <View ref={viewRef}>
                      <Image
                        source={{ uri: imageUri }}
                        style={[
                          styles.image,
                          { width: displayWidth, height: displayHeight },
                        ]}
                      />

                      {/* SVG para desenhar os pontos de mira e linhas */}
                      <Svg
                        style={StyleSheet.absoluteFill}
                        width={displayWidth}
                        height={displayHeight}
                        pointerEvents="none"
                      >
                        {/* Linha vertical do centro nasal (renderizada primeiro para ficar atrás) */}
                        {renderNasalCenterLine()}

                        {/* Linha horizontal da DP (renderizada em segundo para ficar atrás dos pontos) */}
                        {renderDPLine()}

                        {/* Pontos de mira (renderizados por último para ficarem na frente) */}
                        {measurementPoints.map((point, index) =>
                          renderCrosshair(point, index)
                        )}
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
  }
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f8f8f8",
  },
  imageContainer: {
    overflow: "hidden",
    borderRadius: 8,
  },
  image: {
    resizeMode: "contain",
  },
});

export default ImageViewer;
