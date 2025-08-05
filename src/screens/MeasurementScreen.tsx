import React, { useState, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  StatusBar,
  // SafeAreaView é recomendado para garantir que o conteúdo não fique sob notches ou barras
  SafeAreaView,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import ImageViewer, { ImageViewerRef } from "../components/ImageViewer";
import MarkerControl from "../components/MarkerControl";
import {
  ImageData,
  MeasurementPoint,
  MeasurementType,
  Point,
  CalibrationData,
  MeasurementResults,
} from "../types/index";
import {
  calculateMeasurements,
  validateMeasurementPoints,
} from "../utils/measurements";
import { useThemedColors } from "../hooks/useThemedColors";
import { spacing, typography } from "../styles/layout";

interface MeasurementScreenProps {
  imageData: ImageData;
  calibrationData: CalibrationData;
  onMeasurementComplete: (
    results: MeasurementResults,
    points: MeasurementPoint[],
    capturedImageUri?: string
  ) => void;
  onBack: () => void;
}

type MeasurementStep =
  | "leftPupil"
  | "rightPupil"
  | "bridgeCenter"
  | "leftLensBottom"
  | "rightLensBottom"
  | "complete";

const MeasurementScreen: React.FC<MeasurementScreenProps> = ({
  imageData,
  calibrationData,
  onMeasurementComplete,
  onBack,
}) => {
  const colors = useThemedColors();
  const [measurementPoints, setMeasurementPoints] = useState<
    MeasurementPoint[]
  >([]);
  const [currentStep, setCurrentStep] = useState<MeasurementStep>("leftPupil");
  const [isCompleting, setIsCompleting] = useState(false);
  const [selectedMarker, setSelectedMarker] = useState<MeasurementPoint | null>(
    null
  );
  const [showMarkerControl, setShowMarkerControl] = useState(false);
  const imageViewerRef = useRef<ImageViewerRef>(null);

  const stepInfo = {
    leftPupil: {
      title: "Pupila Esquerda (da pessoa)",
      instruction: "Toque no centro da pupila esquerda da pessoa na foto",
      type: MeasurementType.LEFT_PUPIL,
    },
    rightPupil: {
      title: "Pupila Direita (da pessoa)",
      instruction: "Toque no centro da pupila direita da pessoa na foto",
      type: MeasurementType.RIGHT_PUPIL,
    },
    bridgeCenter: {
      title: "Centro da Ponte Nasal",
      instruction: "Toque no centro da ponte nasal ou ponta do nariz",
      type: MeasurementType.BRIDGE_CENTER,
    },
    leftLensBottom: {
      title: "Base da Lente Esquerda (da pessoa)",
      instruction: "Toque na linha inferior da lente esquerda da pessoa",
      type: MeasurementType.LEFT_LENS_BOTTOM,
    },
    rightLensBottom: {
      title: "Base da Lente Direita (da pessoa)",
      instruction: "Toque na linha inferior da lente direita da pessoa",
      type: MeasurementType.RIGHT_LENS_BOTTOM,
    },
    complete: {
      title: "Concluído",
      instruction: "Todas as medições foram coletadas",
      type: MeasurementType.LEFT_PUPIL, // tipo irrelevante aqui
    },
  };

  const stepOrder: MeasurementStep[] = [
    "leftPupil",
    "rightPupil",
    "bridgeCenter",
    "leftLensBottom",
    "rightLensBottom",
    "complete",
  ];

  const handleAddPoint = (point: Point) => {
    if (currentStep === "complete") return;

    const stepData = stepInfo[currentStep];
    const newPoint: MeasurementPoint = {
      id: `${stepData.type}_${Date.now()}`,
      x: point.x,
      y: point.y,
      type: stepData.type,
      label: stepData.title,
    };

    const filteredPoints = measurementPoints.filter(
      (p) => p.type !== stepData.type
    );
    const updatedPoints = [...filteredPoints, newPoint];
    setMeasurementPoints(updatedPoints);

    const currentIndex = stepOrder.indexOf(currentStep);
    if (currentIndex < stepOrder.length - 1) {
      setCurrentStep(stepOrder[currentIndex + 1]);
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

  const handlePreviousStep = () => {
    const currentIndex = stepOrder.indexOf(currentStep);
    if (currentIndex > 0) {
      const prevStep = stepOrder[currentIndex - 1];
      setCurrentStep(prevStep);

      if (currentStep !== "complete") {
        const currentStepData = stepInfo[currentStep];
        const filteredPoints = measurementPoints.filter(
          (p) => p.type !== currentStepData.type
        );
        setMeasurementPoints(filteredPoints);
      }
    }
  };

  const handleCalculateMeasurements = async () => {
    if (!validateMeasurementPoints(measurementPoints)) {
      Alert.alert(
        "Medições Incompletas",
        "Por favor, marque todos os pontos necessários."
      );
      return;
    }

    setIsCompleting(true);

    try {
      const results = calculateMeasurements(measurementPoints, calibrationData);
      if (!results) {
        Alert.alert(
          "Erro no Cálculo",
          "Não foi possível calcular as medições."
        );
        setIsCompleting(false);
        return;
      }

      let capturedImageUri: string | undefined;
      try {
        if (imageViewerRef.current) {
          capturedImageUri = await imageViewerRef.current.captureImage();
        }
      } catch (error) {
        console.warn("Erro ao capturar imagem:", error);
      }

      onMeasurementComplete(results, measurementPoints, capturedImageUri);
    } catch (error) {
      console.error("Erro ao calcular medições:", error);
      Alert.alert("Erro Inesperado", "Ocorreu um erro ao processar os dados.");
      setIsCompleting(false);
    }
  };

  const handleReset = () => {
    Alert.alert(
      "Recomeçar Medições",
      "Tem certeza de que deseja apagar todos os pontos?",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Recomeçar",
          style: "destructive",
          onPress: () => {
            setMeasurementPoints([]);
            setCurrentStep("leftPupil");
            setSelectedMarker(null);
            setShowMarkerControl(false);
          },
        },
      ]
    );
  };

  const styles = StyleSheet.create({
    safeArea: {
      flex: 1,
      backgroundColor: colors.background,
    },
    container: {
      flex: 1,
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
      paddingTop: StatusBar.currentHeight
        ? StatusBar.currentHeight + spacing.sm
        : spacing.xl,
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
    overlayHeaderButtons: {
      flexDirection: "row",
      alignItems: "center",
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
      fontSize: 14,
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
    // **MUDANÇA: Troquei SafeAreaView por View e apliquei o estilo safeArea na View principal.**
    // A SafeAreaView será usada internamente se necessário, mas a View principal
    // controla todo o contêiner.
    <View style={styles.safeArea}>
      <StatusBar
        barStyle="light-content"
        backgroundColor="transparent"
        translucent={true}
        hidden={false}
      />

      <View style={styles.container}>
        {/* Imagem em tela cheia */}
        <View style={styles.fullscreenImageContainer}>
          <ImageViewer
            ref={imageViewerRef}
            imageUri={imageData.uri}
            measurementPoints={measurementPoints}
            onAddPoint={handleAddPoint}
            onUpdatePoint={handleUpdatePoint}
            isPointAddingMode={currentStep !== "complete"}
          />
        </View>

        {/* Header sobreposto */}
        <View style={styles.overlayHeader}>
          <TouchableOpacity style={styles.overlayBackButton} onPress={onBack}>
            <Feather name="arrow-left" size={20} color={colors.white} />
          </TouchableOpacity>

          <View style={styles.overlayHeaderCenter}>
            <Text style={styles.overlayTitle} allowFontScaling={false}>
              Medições
            </Text>
            <Text style={styles.overlaySubtitle} allowFontScaling={false}>
              {stepInfo[currentStep].title}
            </Text>
          </View>

          <View style={styles.overlayHeaderButtons}>
            <TouchableOpacity
              style={styles.overlayResetButton}
              onPress={handleReset}
            >
              <Feather name="refresh-cw" size={20} color={colors.white} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Instruções sobrepostas no topo */}
        {currentStep !== "complete" && (
          <View style={styles.overlayInstructions}>
            <Text
              style={styles.overlayInstructionText}
              allowFontScaling={false}
            >
              {stepInfo[currentStep].instruction}
            </Text>
          </View>
        )}

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
                style={[styles.overlayButtonText, { color: colors.text }]}
                allowFontScaling={false}
              >
                {showMarkerControl ? "Ocultar" : "Precisão"}
              </Text>
            </TouchableOpacity>
          )}

          {currentStep !== "leftPupil" && (
            <TouchableOpacity
              style={[
                styles.overlayButton,
                { backgroundColor: colors.surface + "E6" },
              ]}
              onPress={handlePreviousStep}
            >
              <Feather name="arrow-left" size={16} color={colors.text} />
              <Text
                style={[styles.overlayButtonText, { color: colors.text }]}
                allowFontScaling={false}
              >
                Anterior
              </Text>
            </TouchableOpacity>
          )}

          {currentStep === "leftPupil" && measurementPoints.length === 0 && (
            <TouchableOpacity
              style={[
                styles.overlayButton,
                { backgroundColor: colors.surface + "E6" },
              ]}
              onPress={onBack}
            >
              <Feather name="arrow-left" size={16} color={colors.text} />
              <Text
                style={[styles.overlayButtonText, { color: colors.text }]}
                allowFontScaling={false}
              >
                Voltar
              </Text>
            </TouchableOpacity>
          )}

          {currentStep === "complete" && (
            <TouchableOpacity
              style={[
                styles.overlayCompleteButton,
                {
                  backgroundColor:
                    validateMeasurementPoints(measurementPoints) &&
                    !isCompleting
                      ? colors.primary
                      : colors.border + "E6",
                },
              ]}
              onPress={handleCalculateMeasurements}
              disabled={
                !validateMeasurementPoints(measurementPoints) || isCompleting
              }
            >
              {isCompleting ? (
                <ActivityIndicator size="small" color={colors.white} />
              ) : (
                <>
                  <Feather name="check" size={16} color={colors.white} />
                  <Text
                    style={[styles.overlayButtonText, { color: colors.white }]}
                    allowFontScaling={false}
                  >
                    Calcular
                  </Text>
                </>
              )}
            </TouchableOpacity>
          )}
        </View>

        {/* Indicador de progresso sobreposto */}
        <View style={styles.overlayProgress}>
          <View style={styles.progressDots}>
            {stepOrder.slice(0, -1).map((step, index) => {
              const isCompleted = stepOrder.indexOf(currentStep) > index;
              const isCurrent = stepOrder.indexOf(currentStep) === index;

              return (
                <View
                  key={step}
                  style={[
                    styles.progressDot,
                    {
                      backgroundColor: isCompleted
                        ? colors.success
                        : isCurrent
                        ? colors.primary
                        : colors.surface + "80",
                    },
                  ]}
                />
              );
            })}
          </View>
        </View>
      </View>
    </View>
  );
};

export default MeasurementScreen;
