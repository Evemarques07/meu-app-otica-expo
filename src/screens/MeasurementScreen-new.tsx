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
import { colors } from '../styles/colors';
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
    return colors.gray400;
  };

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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.gray100,
  },
  gradient: {
    paddingBottom: spacing.md,
  },
  safeArea: {
    flex: 0,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  backButton: {
    padding: spacing.xs,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  title: {
    ...typography.h2,
    color: colors.white,
    textAlign: 'center',
  },
  resetButton: {
    padding: spacing.xs,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  progressIndicator: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
  },
  stepInfo: {
    ...typography.body,
    color: colors.white,
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
    backgroundColor: colors.white,
    borderRadius: 2,
  },
  instructionContainer: {
    backgroundColor: colors.surface,
    padding: spacing.md,
    marginHorizontal: spacing.md,
    marginBottom: spacing.sm,
    borderRadius: 12,
    shadowColor: colors.gray900,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  instruction: {
    ...typography.h3,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  subInstruction: {
    ...typography.body,
    color: colors.textSecondary,
  },
  imageContainer: {
    flex: 1,
    marginHorizontal: spacing.sm,
    marginBottom: spacing.sm,
    backgroundColor: colors.surface,
    borderRadius: 12,
    overflow: "hidden",
    shadowColor: colors.gray900,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  bottomContainer: {
    backgroundColor: colors.surface,
    paddingTop: spacing.md,
  },
  progressContainer: {
    marginBottom: spacing.md,
    paddingHorizontal: spacing.md,
  },
  pointsTitle: {
    ...typography.h3,
    color: colors.text,
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  progressGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  progressItem: {
    flexDirection: "row",
    alignItems: "center",
    width: "48%",
    marginBottom: spacing.xs,
  },
  progressIcon: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: spacing.xs,
  },
  progressLabel: {
    ...typography.caption,
    color: colors.textSecondary,
    flex: 1,
  },
  buttonsContainer: {
    flexDirection: "row",
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.lg,
    gap: spacing.sm,
  },
  previousButton: {
    flex: 1,
    backgroundColor: colors.gray200,
    paddingVertical: spacing.md,
    borderRadius: 12,
    alignItems: "center",
  },
  previousButtonText: {
    ...typography.button,
    color: colors.textSecondary,
  },
  calculateButton: {
    flex: 2,
    backgroundColor: colors.primary,
    paddingVertical: spacing.md,
    borderRadius: 12,
    alignItems: "center",
  },
  calculateButtonText: {
    ...typography.button,
    color: colors.white,
  },
  disabledButton: {
    backgroundColor: colors.gray300,
  },
  disabledButtonText: {
    color: colors.gray500,
  },
});

export default MeasurementScreen;
