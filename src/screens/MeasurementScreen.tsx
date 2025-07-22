import React, { useState, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Alert,
  ActivityIndicator,
} from "react-native";
import { LinearGradient } from 'expo-linear-gradient';
import { Feather } from '@expo/vector-icons';
import ImageViewer, { ImageViewerRef } from "../components/ImageViewer";
import {
  ImageData,
  MeasurementPoint,
  MeasurementType,
  Point,
  CalibrationData,
  MeasurementResults,
} from "../types";
import {
  calculateMeasurements,
  validateMeasurementPoints,
} from "../utils/measurements";
import { useThemedColors } from '../hooks/useThemedColors';
import { spacing, typography } from '../styles/layout';

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
  const [measurementPoints, setMeasurementPoints] = useState<MeasurementPoint[]>([]);
  const [currentStep, setCurrentStep] = useState<MeasurementStep>("leftPupil");
  const [isCompleting, setIsCompleting] = useState(false);
  const imageViewerRef = useRef<ImageViewerRef>(null);

  const stepInfo = {
    leftPupil: {
      title: "Pupila Esquerda",
      instruction: "Toque no centro da pupila esquerda",
      type: MeasurementType.LEFT_PUPIL,
    },
    rightPupil: {
      title: "Pupila Direita",
      instruction: "Toque no centro da pupila direita",
      type: MeasurementType.RIGHT_PUPIL,
    },
    bridgeCenter: {
      title: "Centro da Ponte",
      instruction: "Toque no centro da ponte nasal (meio da armação)",
      type: MeasurementType.BRIDGE_CENTER,
    },
    leftLensBottom: {
      title: "Base da Lente Esquerda",
      instruction: "Toque na linha inferior da lente esquerda",
      type: MeasurementType.LEFT_LENS_BOTTOM,
    },
    rightLensBottom: {
      title: "Base da Lente Direita",
      instruction: "Toque na linha inferior da lente direita",
      type: MeasurementType.RIGHT_LENS_BOTTOM,
    },
    complete: {
      title: "Concluído",
      instruction: "Todas as medições foram coletadas",
      type: MeasurementType.LEFT_PUPIL, // Valor dummy
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

    // Remove ponto anterior do mesmo tipo se existir
    const filteredPoints = measurementPoints.filter(
      (p) => p.type !== stepData.type
    );
    const updatedPoints = [...filteredPoints, newPoint];

    setMeasurementPoints(updatedPoints);

    // Avança para o próximo passo
    const currentIndex = stepOrder.indexOf(currentStep);
    if (currentIndex < stepOrder.length - 1) {
      setCurrentStep(stepOrder[currentIndex + 1]);
    }
  };

  const handlePreviousStep = () => {
    const currentIndex = stepOrder.indexOf(currentStep);
    if (currentIndex > 0) {
      setCurrentStep(stepOrder[currentIndex - 1]);
    }
  };

  const handleCalculateMeasurements = async () => {
    if (!validateMeasurementPoints(measurementPoints)) {
      Alert.alert(
        "Medições Incompletas",
        "Por favor, marque todos os pontos necessários antes de continuar."
      );
      return;
    }

    setIsCompleting(true);

    try {
      const results = calculateMeasurements(measurementPoints, calibrationData);

      if (!results) {
        Alert.alert(
          "Erro no Cálculo",
          "Não foi possível calcular as medições. Verifique se todos os pontos foram marcados corretamente."
        );
        return;
      }

      // Capturar a imagem com os marcadores
      let capturedImageUri: string | undefined;
      try {
        if (imageViewerRef.current) {
          capturedImageUri = await imageViewerRef.current.captureImage();
          console.log("Imagem capturada:", capturedImageUri);
        }
      } catch (error) {
        console.warn("Erro ao capturar imagem:", error);
        // Continuar mesmo se a captura falhar
      }

      onMeasurementComplete(results, measurementPoints, capturedImageUri);
    } finally {
      setIsCompleting(false);
    }
  };

  const handleReset = () => {
    Alert.alert(
      "Recomeçar Medições",
      "Tem certeza de que deseja apagar todos os pontos e recomeçar?",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Recomeçar",
          style: "destructive",
          onPress: () => {
            setMeasurementPoints([]);
            setCurrentStep("leftPupil");
          },
        },
      ]
    );
  };

  const getCurrentStepNumber = () => {
    const currentIndex = stepOrder.indexOf(currentStep);
    return currentStep === "complete" ? 5 : currentIndex + 1;
  };

  const getPointColor = (pointType: MeasurementType) => {
    const hasPoint = measurementPoints.some((p) => p.type === pointType);
    const currentStepType = stepInfo[currentStep]?.type;

    if (pointType === currentStepType) return colors.error;
    if (hasPoint) return colors.success;
    return colors.textMuted;
  };

  // Estilos dinâmicos baseados no tema
  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    gradient: {
      paddingBottom: spacing.md,
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: spacing.lg,
      paddingVertical: spacing.md,
    },
    safeArea: {
      flex: 1,
    },
    backButton: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: 'rgba(255, 255, 255, 0.1)',
      justifyContent: 'center',
      alignItems: 'center',
    },
    title: {
      ...typography.title,
      color: colors.text,
      textAlign: 'center',
      flex: 1,
    },
    resetButton: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: 'rgba(255, 255, 255, 0.1)',
      justifyContent: 'center',
      alignItems: 'center',
    },
    progressIndicator: {
      paddingHorizontal: spacing.lg,
      paddingBottom: spacing.md,
    },
    stepInfo: {
      ...typography.caption,
      color: colors.text,
      textAlign: 'center',
      marginBottom: spacing.xs,
    },
    progressBar: {
      height: 4,
      backgroundColor: 'rgba(255, 255, 255, 0.3)',
      borderRadius: 2,
    },
    progressFill: {
      height: '100%',
      backgroundColor: colors.text,
      borderRadius: 2,
    },
    instructionContainer: {
      backgroundColor: colors.surface,
      padding: spacing.md,
      marginHorizontal: spacing.md,
      marginBottom: spacing.sm,
      borderRadius: 12,
    },
    instruction: {
      ...typography.subtitle,
      marginBottom: spacing.xs,
      color: colors.text,
    },
    subInstruction: {
      ...typography.body,
      color: colors.textMuted,
    },
    bottomContainer: {
      backgroundColor: colors.surface,
      borderTopLeftRadius: 20,
      borderTopRightRadius: 20,
      paddingTop: spacing.md,
    },
    progressContainer: {
      paddingHorizontal: spacing.md,
      paddingBottom: spacing.md,
    },
    pointsTitle: {
      ...typography.subtitle,
      marginBottom: spacing.sm,
      textAlign: 'center',
      color: colors.text,
    },
    progressGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'space-between',
      gap: spacing.xs,
    },
    progressIcon: {
      width: 24,
      height: 24,
      borderRadius: 12,
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: spacing.xs / 2,
    },
    progressLabel: {
      ...typography.caption,
      textAlign: 'center',
      color: colors.textMuted,
      fontSize: 10,
    },
    buttonsContainer: {
      flexDirection: 'row',
      paddingHorizontal: spacing.md,
      paddingBottom: spacing.md,
      gap: spacing.sm,
    },
    previousButton: {
      flex: 1,
      backgroundColor: colors.border,
      paddingVertical: spacing.sm,
      borderRadius: 8,
      alignItems: 'center',
    },
    previousButtonText: {
      ...typography.button,
      color: colors.textMuted,
    },
    calculateButton: {
      flex: 2,
      backgroundColor: colors.primary,
      paddingVertical: spacing.sm,
      borderRadius: 8,
      alignItems: 'center',
    },
    calculateButtonText: {
      ...typography.button,
      color: colors.text,
    },
    headerButton: {
      width: 44,
      height: 44,
      borderRadius: 22,
      backgroundColor: 'rgba(255,255,255,0.2)',
      justifyContent: 'center',
      alignItems: 'center',
    },
    headerTitle: {
      ...typography.title,
      color: colors.text,
      textAlign: 'center',
    },
    content: {
      flex: 1,
      backgroundColor: colors.background,
      borderTopLeftRadius: 24,
      borderTopRightRadius: 24,
      marginTop: -24,
      paddingTop: spacing.lg,
    },
    instructionCard: {
      backgroundColor: colors.surface,
      marginHorizontal: spacing.lg,
      padding: spacing.lg,
      borderRadius: 16,
      ...typography.body,
    },
    stepProgress: {
      ...typography.label,
      color: colors.text,
      marginBottom: spacing.sm,
    },
    stepTitle: {
      ...typography.subtitle,
      color: colors.textMuted,
      marginBottom: spacing.xs,
    },
    imageContainer: {
      flex: 1,
      marginHorizontal: spacing.lg,
      marginVertical: spacing.lg,
      borderRadius: 12,
      overflow: 'hidden',
      backgroundColor: colors.surface,
    },
    bottomPanel: {
      backgroundColor: colors.surface,
      paddingTop: spacing.lg,
    },
    progressSection: {
      flexDirection: 'row',
      justifyContent: 'space-around',
      paddingHorizontal: spacing.lg,
      paddingBottom: spacing.lg,
      backgroundColor: colors.surface,
    },
    progressItem: {
      alignItems: 'center',
    },
    completeButton: {
      backgroundColor: colors.primary,
      marginHorizontal: spacing.lg,
      marginBottom: spacing.lg,
      paddingVertical: spacing.md,
      borderRadius: 12,
      alignItems: 'center',
    },
    completeButtonText: {
      ...typography.button,
      color: colors.text,
    },
    disabledButton: {
      backgroundColor: colors.border,
    },
    disabledButtonText: {
      color: colors.textMuted,
    },
  });

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[colors.primary, colors.primaryMuted]}
        style={styles.gradient}
      >
        <SafeAreaView style={styles.safeArea}>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity style={styles.backButton} onPress={onBack}>
              <Feather name="arrow-left" size={24} color={colors.white} />
            </TouchableOpacity>
            <Text style={styles.title}>Medições</Text>
            <TouchableOpacity style={styles.resetButton} onPress={handleReset}>
              <Feather name="refresh-cw" size={24} color={colors.white} />
            </TouchableOpacity>
          </View>

          {/* Progress Indicator */}
          <View style={styles.progressIndicator}>
            <Text style={styles.stepInfo}>
              Passo {getCurrentStepNumber()}/5 • {measurementPoints.length}/5 pontos
            </Text>
            <View style={styles.progressBar}>
              <View 
                style={[
                  styles.progressFill, 
                  { width: `${(measurementPoints.length / 5) * 100}%` }
                ]} 
              />
            </View>
          </View>
        </SafeAreaView>
      </LinearGradient>

      {/* Instructions */}
      <View style={styles.instructionContainer}>
        <Text style={styles.instruction}>
          {stepInfo[currentStep].instruction}
        </Text>
        <Text style={styles.subInstruction}>
          Use zoom (até 6x) e pan para posicionar com máxima precisão
        </Text>
      </View>

      {/* Image Container */}
      <View style={styles.imageContainer}>
        <ImageViewer
          ref={imageViewerRef}
          imageUri={imageData.uri}
          measurementPoints={measurementPoints}
          onAddPoint={handleAddPoint}
          isPointAddingMode={currentStep !== "complete"}
        />
      </View>

      {/* Bottom Controls */}
      <View style={styles.bottomContainer}>
        {/* Progress Grid */}
        <View style={styles.progressContainer}>
          <Text style={styles.pointsTitle}>Progresso das Medições</Text>
          <View style={styles.progressGrid}>
            {Object.entries(stepInfo)
              .filter(([key]) => key !== "complete")
              .map(([key, info]) => {
                const hasPoint = measurementPoints.some((p) => p.type === info.type);
                const isCurrent = key === currentStep;

                return (
                  <View key={key} style={styles.progressItem}>
                    <View
                      style={[
                        styles.progressIcon,
                        { backgroundColor: getPointColor(info.type) },
                      ]}
                    />
                    <Text style={styles.progressLabel}>
                      {info.title}
                    </Text>
                    {hasPoint && (
                      <Feather name="check" size={16} color={colors.success} />
                    )}
                  </View>
                );
              })}
          </View>
        </View>

        {/* Buttons */}
        <View style={styles.buttonsContainer}>
          {currentStep !== "leftPupil" && currentStep !== "complete" && (
            <TouchableOpacity
              style={styles.previousButton}
              onPress={handlePreviousStep}
            >
              <Text style={styles.previousButtonText}>Anterior</Text>
            </TouchableOpacity>
          )}

          {currentStep === "complete" && (
            <TouchableOpacity
              style={[
                styles.calculateButton,
                (!validateMeasurementPoints(measurementPoints) || isCompleting) &&
                  styles.disabledButton,
              ]}
              onPress={handleCalculateMeasurements}
              disabled={!validateMeasurementPoints(measurementPoints) || isCompleting}
            >
              {isCompleting ? (
                <ActivityIndicator size="small" color={colors.white} />
              ) : (
                <Text
                  style={[
                    styles.calculateButtonText,
                    !validateMeasurementPoints(measurementPoints) &&
                      styles.disabledButtonText,
                  ]}
                >
                  Calcular Medições
                </Text>
              )}
            </TouchableOpacity>
          )}
        </View>
      </View>
    </View>
  );
};

export default MeasurementScreen;
