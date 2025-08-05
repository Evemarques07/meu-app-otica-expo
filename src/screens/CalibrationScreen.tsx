// calibração
import React, { useState, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Alert,
  StatusBar,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Feather } from "@expo/vector-icons";
import ImageViewer, { ImageViewerRef } from "../components/ImageViewer";
import MarkerControl from "../components/MarkerControl";
import {
  ImageData,
  MeasurementPoint,
  MeasurementType,
  Point,
  CalibrationData,
} from "../types";
import {
  calculatePixelsPerMM,
  validateCalibrationPoints,
} from "../utils/measurements";
import { useThemedColors } from "../hooks/useThemedColors";
import {
  spacing,
  borderRadius,
  typography,
  shadows,
  containers,
} from "../styles/layout";
//continuar
interface CalibrationScreenProps {
  imageData: ImageData;
  onCalibrationComplete: (
    calibrationData: CalibrationData,
    points: MeasurementPoint[]
  ) => void;
  onBack: () => void;
}

const CalibrationScreen: React.FC<CalibrationScreenProps> = ({
  imageData,
  onCalibrationComplete,
  onBack,
}) => {
  const colors = useThemedColors();
  const [measurementPoints, setMeasurementPoints] = useState<
    MeasurementPoint[]
  >([]);
  const [currentStep, setCurrentStep] = useState<"left" | "right">("left");
  const [lastTapFeedback, setLastTapFeedback] = useState<string>("");
  const [selectedMarker, setSelectedMarker] = useState<MeasurementPoint | null>(
    null
  );
  const [showMarkerControl, setShowMarkerControl] = useState(false);
  const imageViewerRef = useRef<ImageViewerRef>(null);

  const handleAddPoint = (point: Point) => {
    const pointType =
      currentStep === "left"
        ? MeasurementType.CARD_LEFT
        : MeasurementType.CARD_RIGHT;
    const label =
      currentStep === "left" ? "Extremidade Esquerda" : "Extremidade Direita";

    const newPoint: MeasurementPoint = {
      id: `card_${currentStep}_${Date.now()}`,
      x: point.x,
      y: point.y,
      type: pointType,
      label,
    };

    const filteredPoints = measurementPoints.filter(
      (p) => p.type !== pointType
    );
    const updatedPoints = [...filteredPoints, newPoint];

    setMeasurementPoints(updatedPoints);
    setLastTapFeedback(`✅ ${label} marcada com sucesso!`);

    setTimeout(() => setLastTapFeedback(""), 2000);

    if (currentStep === "left") {
      setCurrentStep("right");
    }
  };

  const handleUpdatePoint = (pointId: string, newPoint: Point) => {
    setMeasurementPoints((prev) =>
      prev.map((p) =>
        p.id === pointId ? { ...p, x: newPoint.x, y: newPoint.y } : p
      )
    );
  };

  const handleMarkerMove = (
    marker: MeasurementPoint,
    deltaX: number,
    deltaY: number
  ) => {
    if (imageViewerRef.current) {
      imageViewerRef.current.moveMarker(marker.id, deltaX, deltaY);
    }
  };

  const handleReset = () => {
    Alert.alert(
      "Recomeçar Calibração",
      "Tem certeza de que deseja apagar todos os pontos e recomeçar?",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Recomeçar",
          style: "destructive",
          onPress: () => {
            setMeasurementPoints([]);
            setCurrentStep("left");
            setLastTapFeedback("");
          },
        },
      ]
    );
  };

  const handleContinue = () => {
    if (!validateCalibrationPoints(measurementPoints)) {
      Alert.alert(
        "Erro",
        "É necessário marcar ambas as extremidades do cartão."
      );
      return;
    }

    const cardLeftPoint = measurementPoints.find(
      (p) => p.type === MeasurementType.CARD_LEFT
    );
    const cardRightPoint = measurementPoints.find(
      (p) => p.type === MeasurementType.CARD_RIGHT
    );

    if (!cardLeftPoint || !cardRightPoint) {
      Alert.alert("Erro", "Pontos do cartão não encontrados.");
      return;
    }

    const pixelsPerMM = calculatePixelsPerMM(cardLeftPoint, cardRightPoint);

    if (pixelsPerMM <= 0) {
      Alert.alert(
        "Erro",
        "Não foi possível calcular a escala. Verifique os pontos marcados."
      );
      return;
    }

    const calibrationData: CalibrationData = {
      cardLeftPoint,
      cardRightPoint,
      pixelsPerMM,
    };

    onCalibrationComplete(calibrationData, measurementPoints);
  };

  const getStepInfo = () => {
    if (currentStep === "left") {
      return "Passo 1/2 • Marque a extremidade esquerda";
    }
    return "Passo 2/2 • Marque a extremidade direita";
  };

  const getInstructionText = () => {
    if (currentStep === "left") {
      return "Toque na extremidade esquerda do cartão";
    }
    return "Toque na extremidade direita do cartão";
  };

  const getInstructionDetails = () => {
    if (currentStep === "left") {
      return "Marque a extremidade esquerda (quando você olha diretamente para o cartão).";
    }
    return "Marque a extremidade direita (quando você olha diretamente para o cartão).";
  };

  // Estilos dinâmicos baseados no tema
  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    fullscreenImageContainer: {
      flex: 1,
      width: "100%",
      height: "100%",
    },
    overlayHeader: {
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      paddingHorizontal: spacing.lg,
      paddingTop: spacing.xl + 20, // StatusBar height + padding
      paddingBottom: spacing.md,
      backgroundColor: "rgba(0, 0, 0, 0.5)",
      zIndex: 10,
    },
    overlayBackButton: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: "rgba(255, 255, 255, 0.2)",
      justifyContent: "center",
      alignItems: "center",
    },
    overlayHeaderCenter: {
      flex: 1,
      alignItems: "center",
      marginHorizontal: spacing.md,
    },
    overlayTitle: {
      ...typography.title,
      color: colors.white,
      fontSize: 18,
      fontWeight: "bold",
    },
    overlaySubtitle: {
      ...typography.bodySecondary,
      color: colors.white,
      fontSize: 14,
      marginTop: 2,
    },
    overlayResetButton: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: "rgba(255, 255, 255, 0.2)",
      justifyContent: "center",
      alignItems: "center",
    },
    overlayInstructions: {
      position: "absolute",
      top: 120,
      left: spacing.lg,
      right: spacing.lg,
      backgroundColor: "rgba(0, 0, 0, 0.7)",
      padding: spacing.md,
      borderRadius: 8,
      zIndex: 10,
    },
    overlayInstructionText: {
      ...typography.body,
      color: colors.white,
      textAlign: "center",
      fontSize: 16,
      fontWeight: "bold",
    },
    overlayInstructionSubtext: {
      ...typography.bodySecondary,
      color: colors.white,
      textAlign: "center",
      fontSize: 14,
      marginTop: spacing.xs,
    },
    overlayFeedbackText: {
      ...typography.bodySecondary,
      color: colors.success,
      textAlign: "center",
      fontSize: 14,
      fontWeight: "bold",
      marginTop: spacing.sm,
    },
    overlayMarkerControl: {
      position: "absolute",
      bottom: 120,
      left: spacing.sm,
      right: spacing.sm,
      zIndex: 10,
    },
    overlayBottomControls: {
      position: "absolute",
      bottom: 0,
      left: 0,
      right: 0,
      flexDirection: "row",
      justifyContent: "space-around",
      alignItems: "center",
      paddingHorizontal: spacing.lg,
      paddingVertical: spacing.lg,
      paddingBottom: spacing.xl,
      backgroundColor: "rgba(0, 0, 0, 0.5)",
      zIndex: 10,
    },
    overlayButton: {
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.sm,
      borderRadius: 20,
      minWidth: 80,
    },
    overlayButtonText: {
      ...typography.button,
      fontSize: 12,
      marginLeft: spacing.xs,
    },
    overlayCompleteButton: {
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: spacing.lg,
      paddingVertical: spacing.md,
      borderRadius: 25,
      minWidth: 120,
    },
    overlayProgress: {
      position: "absolute",
      bottom: 80,
      left: 0,
      right: 0,
      alignItems: "center",
      zIndex: 10,
    },
    progressDots: {
      flexDirection: "row",
      backgroundColor: "rgba(0, 0, 0, 0.5)",
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.sm,
      borderRadius: 20,
    },
    progressDot: {
      width: 12,
      height: 12,
      borderRadius: 6,
      marginHorizontal: 4,
    },
  });

  return (
    <View style={styles.container}>
      <StatusBar
        barStyle="light-content"
        backgroundColor="transparent"
        translucent={true}
        hidden={false}
      />

      {/* Imagem em tela cheia */}
      <View style={styles.fullscreenImageContainer}>
        <ImageViewer
          ref={imageViewerRef}
          imageUri={imageData.uri}
          measurementPoints={measurementPoints}
          onAddPoint={handleAddPoint}
          onUpdatePoint={handleUpdatePoint}
          isPointAddingMode={true}
        />
      </View>

      {/* Header sobreposto */}
      <View style={styles.overlayHeader}>
        <TouchableOpacity style={styles.overlayBackButton} onPress={onBack}>
          <Feather name="arrow-left" size={20} color={colors.white} />
        </TouchableOpacity>

        <View style={styles.overlayHeaderCenter}>
          <Text style={styles.overlayTitle} allowFontScaling={false}>
            Calibração
          </Text>
          <Text style={styles.overlaySubtitle} allowFontScaling={false}>
            {getStepInfo()}
          </Text>
        </View>

        <TouchableOpacity
          style={styles.overlayResetButton}
          onPress={handleReset}
        >
          <Feather name="refresh-cw" size={20} color={colors.white} />
        </TouchableOpacity>
      </View>

      {/* Instruções sobrepostas no topo */}
      <View style={styles.overlayInstructions}>
        <Text style={styles.overlayInstructionText} allowFontScaling={false}>
          {getInstructionText()}
        </Text>
        <Text style={styles.overlayInstructionSubtext} allowFontScaling={false}>
          {getInstructionDetails()}
        </Text>
        {lastTapFeedback ? (
          <Text style={styles.overlayFeedbackText} allowFontScaling={false}>
            {lastTapFeedback}
          </Text>
        ) : null}
      </View>

      {/* Controle de Marcadores sobreposto */}
      {showMarkerControl && (
        <View style={styles.overlayMarkerControl}>
          <MarkerControl
            selectedMarker={selectedMarker}
            onMarkerMove={handleMarkerMove}
            onMarkerSelect={setSelectedMarker}
            measurementPoints={measurementPoints}
            visible={showMarkerControl}
          />
        </View>
      )}

      {/* Botões de ação sobrepostos na parte inferior */}
      <View style={styles.overlayBottomControls}>
        {/* Botão de controle preciso */}
        {measurementPoints.length > 0 && (
          <TouchableOpacity
            style={[
              styles.overlayButton,
              {
                backgroundColor: showMarkerControl
                  ? colors.primary
                  : colors.surface + "E6",
              },
            ]}
            onPress={() => setShowMarkerControl(!showMarkerControl)}
          >
            <Feather
              name={showMarkerControl ? "eye-off" : "target"}
              size={16}
              color={showMarkerControl ? colors.white : colors.text}
            />
            <Text
              style={[
                styles.overlayButtonText,
                { color: showMarkerControl ? colors.white : colors.text },
              ]}
              allowFontScaling={false}
            >
              {showMarkerControl ? "Ocultar" : "Precisão"}
            </Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity
          style={[
            styles.overlayButton,
            {
              backgroundColor:
                measurementPoints.length === 0
                  ? colors.border + "E6"
                  : colors.surface + "E6",
            },
          ]}
          onPress={handleReset}
          disabled={measurementPoints.length === 0}
        >
          <Feather name="refresh-cw" size={16} color={colors.text} />
          <Text
            style={[styles.overlayButtonText, { color: colors.text }]}
            allowFontScaling={false}
          >
            Recomeçar
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.overlayCompleteButton,
            {
              backgroundColor: validateCalibrationPoints(measurementPoints)
                ? colors.primary
                : colors.border + "E6",
            },
          ]}
          onPress={handleContinue}
          disabled={!validateCalibrationPoints(measurementPoints)}
        >
          <Feather name="arrow-right" size={16} color={colors.white} />
          <Text
            style={[styles.overlayButtonText, { color: colors.white }]}
            allowFontScaling={false}
          >
            Continuar
          </Text>
        </TouchableOpacity>
      </View>

      {/* Indicador de progresso sobreposto */}
      <View style={styles.overlayProgress}>
        <View style={styles.progressDots}>
          <View
            style={[
              styles.progressDot,
              {
                backgroundColor: measurementPoints.some(
                  (p) => p.type === MeasurementType.CARD_LEFT
                )
                  ? colors.success
                  : currentStep === "left"
                  ? colors.primary
                  : colors.surface + "80",
              },
            ]}
          />
          <View
            style={[
              styles.progressDot,
              {
                backgroundColor: measurementPoints.some(
                  (p) => p.type === MeasurementType.CARD_RIGHT
                )
                  ? colors.success
                  : currentStep === "right"
                  ? colors.primary
                  : colors.surface + "80",
              },
            ]}
          />
        </View>
      </View>
    </View>
  );
};

export default CalibrationScreen;
