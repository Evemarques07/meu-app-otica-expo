import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Alert,
  ScrollView,
} from "react-native";
import ImageViewer from "../components/ImageViewer";
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

interface MeasurementScreenProps {
  imageData: ImageData;
  calibrationData: CalibrationData;
  onMeasurementComplete: (
    results: MeasurementResults,
    points: MeasurementPoint[]
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
  const [measurementPoints, setMeasurementPoints] = useState<
    MeasurementPoint[]
  >([]);
  const [currentStep, setCurrentStep] = useState<MeasurementStep>("leftPupil");

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

  const handleCalculateMeasurements = () => {
    if (!validateMeasurementPoints(measurementPoints)) {
      Alert.alert(
        "Medições Incompletas",
        "Por favor, marque todos os pontos necessários antes de continuar."
      );
      return;
    }

    const results = calculateMeasurements(measurementPoints, calibrationData);

    if (!results) {
      Alert.alert(
        "Erro no Cálculo",
        "Não foi possível calcular as medições. Verifique se todos os pontos foram marcados corretamente."
      );
      return;
    }

    onMeasurementComplete(results, measurementPoints);
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

    if (pointType === currentStepType) return "#FF6B6B"; // Vermelho para ponto atual
    if (hasPoint) return "#4ECDC4"; // Verde para pontos já marcados
    return "#DDD"; // Cinza para pontos não marcados
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={onBack}>
          <Text style={styles.backButtonText}>← Voltar</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Medições</Text>
        <TouchableOpacity style={styles.resetButton} onPress={handleReset}>
          <Text style={styles.resetButtonText}>Recomeçar</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.instructionContainer}>
        <Text style={styles.stepInfo}>
          Passo {getCurrentStepNumber()}/5 • {measurementPoints.length}/5 pontos
        </Text>
        <Text style={styles.instruction}>
          {stepInfo[currentStep].instruction}
        </Text>
        <Text style={styles.subInstruction}>
          Use zoom e pan para posicionar com máxima precisão
        </Text>
      </View>

      <View style={styles.imageContainer}>
        <ImageViewer
          imageUri={imageData.uri}
          measurementPoints={measurementPoints}
          onAddPoint={handleAddPoint}
          isPointAddingMode={currentStep !== "complete"}
        />
      </View>

      <View style={styles.bottomContainer}>
        {/* Lista compacta de progresso */}
        <View style={styles.progressContainer}>
          <Text style={styles.pointsTitle}>Progresso das Medições</Text>
          <View style={styles.progressGrid}>
            {Object.entries(stepInfo)
              .filter(([key]) => key !== "complete")
              .map(([key, info]) => {
                const hasPoint = measurementPoints.some(
                  (p) => p.type === info.type
                );
                const isCurrent = key === currentStep;

                return (
                  <View
                    key={key}
                    style={[
                      styles.progressItem,
                      isCurrent && styles.currentProgressItem,
                      hasPoint && styles.completedProgressItem,
                    ]}
                  >
                    <View
                      style={[
                        styles.progressIndicator,
                        { backgroundColor: getPointColor(info.type) },
                      ]}
                    />
                    <Text
                      style={[
                        styles.progressItemText,
                        isCurrent && styles.currentProgressText,
                        hasPoint && styles.completedProgressText,
                      ]}
                    >
                      {info.title}
                    </Text>
                    {hasPoint && <Text style={styles.checkmark}>✓</Text>}
                  </View>
                );
              })}
          </View>
        </View>

        {/* Botões sempre visíveis */}
        <View style={styles.buttonContainer}>
          {currentStep !== "leftPupil" && currentStep !== "complete" && (
            <TouchableOpacity
              style={styles.previousButton}
              onPress={handlePreviousStep}
            >
              <Text style={styles.previousButtonText}>← Anterior</Text>
            </TouchableOpacity>
          )}

          {currentStep === "complete" && (
            <TouchableOpacity
              style={[
                styles.calculateButton,
                !validateMeasurementPoints(measurementPoints) &&
                  styles.disabledButton,
              ]}
              onPress={handleCalculateMeasurements}
              disabled={!validateMeasurementPoints(measurementPoints)}
            >
              <Text
                style={[
                  styles.calculateButtonText,
                  !validateMeasurementPoints(measurementPoints) &&
                    styles.disabledButtonText,
                ]}
              >
                Calcular Medições
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  backButton: {
    padding: 5,
  },
  backButtonText: {
    color: "#007AFF",
    fontSize: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
  },
  resetButton: {
    padding: 5,
  },
  resetButtonText: {
    color: "#FF3B30",
    fontSize: 14,
  },
  instructionContainer: {
    backgroundColor: "#fff",
    padding: 12,
    marginHorizontal: 10,
    marginBottom: 8,
    borderRadius: 8,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 3,
  },
  stepInfo: {
    fontSize: 14,
    color: "#007AFF",
    fontWeight: "600",
    marginBottom: 5,
  },
  instruction: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 5,
  },
  subInstruction: {
    fontSize: 14,
    color: "#666",
  },
  imageContainer: {
    flex: 1,
    marginHorizontal: 8,
    marginBottom: 8,
    backgroundColor: "#fff",
    borderRadius: 8,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 3,
  },
  bottomContainer: {
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderTopColor: "#e0e0e0",
    paddingBottom: 25, // Margem para evitar conflito com botões do sistema
  },
  progressContainer: {
    paddingHorizontal: 12,
    paddingTop: 12,
    paddingBottom: 8,
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
    paddingVertical: 6,
    paddingHorizontal: 8,
    marginBottom: 6,
    borderRadius: 6,
    backgroundColor: "#f9f9f9",
  },
  currentProgressItem: {
    backgroundColor: "#E3F2FD",
    borderWidth: 1,
    borderColor: "#007AFF",
  },
  completedProgressItem: {
    backgroundColor: "#E8F5E8",
  },
  progressIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  progressItemText: {
    flex: 1,
    fontSize: 12,
    color: "#666",
  },
  currentProgressText: {
    color: "#007AFF",
    fontWeight: "600",
  },
  completedProgressText: {
    color: "#4CAF50",
    fontWeight: "500",
  },
  pointsTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
    marginBottom: 10,
  },
  checkmark: {
    color: "#4CAF50",
    fontSize: 12,
    fontWeight: "bold",
  },
  buttonContainer: {
    flexDirection: "row",
    paddingHorizontal: 15,
    paddingVertical: 10,
    gap: 10,
  },
  previousButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#007AFF",
    alignItems: "center",
  },
  previousButtonText: {
    color: "#007AFF",
    fontSize: 16,
    fontWeight: "600",
  },
  calculateButton: {
    flex: 2,
    backgroundColor: "#4CAF50",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: "center",
  },
  calculateButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  disabledButton: {
    backgroundColor: "#ccc",
  },
  disabledButtonText: {
    color: "#999",
  },
});

export default MeasurementScreen;
