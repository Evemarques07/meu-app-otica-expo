// calibração
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Alert,
  StatusBar,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather } from '@expo/vector-icons';
import ImageViewer from '../components/ImageViewer';
import { ImageData, MeasurementPoint, MeasurementType, Point, CalibrationData } from '../types';
import { calculatePixelsPerMM, validateCalibrationPoints } from '../utils/measurements';
import { colors } from '../styles/colors';
import { spacing, borderRadius, typography, shadows, containers } from '../styles/layout';

interface CalibrationScreenProps {
  imageData: ImageData;
  onCalibrationComplete: (calibrationData: CalibrationData, points: MeasurementPoint[]) => void;
  onBack: () => void;
}

const CalibrationScreen: React.FC<CalibrationScreenProps> = ({
  imageData,
  onCalibrationComplete,
  onBack,
}) => {
  const [measurementPoints, setMeasurementPoints] = useState<MeasurementPoint[]>([]);
  const [currentStep, setCurrentStep] = useState<'left' | 'right'>('left');
  const [lastTapFeedback, setLastTapFeedback] = useState<string>('');

  const handleAddPoint = (point: Point) => {
    const pointType = currentStep === 'left' ? MeasurementType.CARD_LEFT : MeasurementType.CARD_RIGHT;
    const label = currentStep === 'left' ? 'Extremidade Esquerda' : 'Extremidade Direita';
    
    const newPoint: MeasurementPoint = {
      id: `card_${currentStep}_${Date.now()}`,
      x: point.x,
      y: point.y,
      type: pointType,
      label,
    };

    const filteredPoints = measurementPoints.filter(p => p.type !== pointType);
    const updatedPoints = [...filteredPoints, newPoint];
    
    setMeasurementPoints(updatedPoints);
    setLastTapFeedback(`✅ ${label} marcada com sucesso!`);
    
    setTimeout(() => setLastTapFeedback(''), 2000);

    if (currentStep === 'left') {
      setCurrentStep('right');
    }
  };

  const handleReset = () => {
    Alert.alert(
      'Recomeçar Calibração',
      'Tem certeza de que deseja apagar todos os pontos e recomeçar?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Recomeçar',
          style: 'destructive',
          onPress: () => {
            setMeasurementPoints([]);
            setCurrentStep('left');
            setLastTapFeedback('');
          },
        },
      ]
    );
  };

  const handleContinue = () => {
    if (!validateCalibrationPoints(measurementPoints)) {
      Alert.alert('Erro', 'É necessário marcar ambas as extremidades do cartão.');
      return;
    }

    const cardLeftPoint = measurementPoints.find(p => p.type === MeasurementType.CARD_LEFT);
    const cardRightPoint = measurementPoints.find(p => p.type === MeasurementType.CARD_RIGHT);
    
    if (!cardLeftPoint || !cardRightPoint) {
      Alert.alert('Erro', 'Pontos do cartão não encontrados.');
      return;
    }

    const pixelsPerMM = calculatePixelsPerMM(cardLeftPoint, cardRightPoint);
    
    if (pixelsPerMM <= 0) {
      Alert.alert('Erro', 'Não foi possível calcular a escala. Verifique os pontos marcados.');
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
    if (currentStep === 'left') {
      return 'Passo 1/2 • Marque a extremidade esquerda';
    }
    return 'Passo 2/2 • Marque a extremidade direita';
  };

  const getInstructionText = () => {
    if (currentStep === 'left') {
      return 'Toque na extremidade esquerda do cartão';
    }
    return 'Toque na extremidade direita do cartão';
  };

  const getInstructionDetails = () => {
    if (currentStep === 'left') {
      return 'Marque o ponto mais à esquerda da borda do cartão de crédito/débito.';
    }
    return 'Marque o ponto mais à direita da borda do cartão de crédito/débito.';
  };

  return (
    <LinearGradient
      colors={[colors.backgroundStart, colors.backgroundEnd]}
      style={containers.screen}
    >
      <StatusBar barStyle="light-content" />
      <SafeAreaView style={containers.screen}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={onBack}>
            <Feather name="arrow-left" size={20} color={colors.text} />
            <Text style={styles.backButtonText}>Voltar</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Calibração</Text>
          <View style={styles.placeholder} />
        </View>

        <View style={styles.instructionContainer}>
          <Text style={styles.stepInfo}>{getStepInfo()}</Text>
          <Text style={styles.instruction}>{getInstructionText()}</Text>
          <Text style={styles.subInstruction}>
            {getInstructionDetails()}
          </Text>
          <Text style={styles.subInstruction}>
            Use zoom (até 6x) e pan para máxima precisão
          </Text>
          {lastTapFeedback ? (
            <Text style={styles.feedbackText}>{lastTapFeedback}</Text>
          ) : null}
        </View>

        <View style={styles.imageContainer}>
          <ImageViewer
            imageUri={imageData.uri}
            measurementPoints={measurementPoints}
            onAddPoint={handleAddPoint}
            isPointAddingMode={true}
          />
        </View>

        <View style={styles.controlsContainer}>
          <View style={styles.pointsInfo}>
            <Text style={styles.pointsText}>
              Pontos marcados: {measurementPoints.length}/2
            </Text>
            {measurementPoints.map((point, index) => {
              const isLeft = point.type === MeasurementType.CARD_LEFT;
              const emoji = isLeft ? '🔴' : '🔵';
              return (
                <Text key={point.id} style={styles.pointItem}>
                  {emoji} {point.label}
                </Text>
              );
            })}
          </View>

          <View style={styles.buttonContainer}>
            <TouchableOpacity 
              style={[styles.resetButton, measurementPoints.length === 0 && styles.disabledButton]} 
              onPress={handleReset}
              disabled={measurementPoints.length === 0}
            >
              <Text style={[
                styles.resetButtonText,
                measurementPoints.length === 0 && styles.disabledButtonText
              ]}>
                Recomeçar
              </Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[
                styles.continueButton,
                !validateCalibrationPoints(measurementPoints) && styles.disabledButton
              ]} 
              onPress={handleContinue}
              disabled={!validateCalibrationPoints(measurementPoints)}
            >
              <Text style={[
                styles.continueButtonText,
                !validateCalibrationPoints(measurementPoints) && styles.disabledButtonText
              ]}>
                Continuar
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.sm,
    gap: spacing.sm,
  },
  backButtonText: {
    ...typography.button,
    color: colors.primary,
  },
  title: {
    ...typography.h2,
  },
  placeholder: {
    width: 60,
  },
  instructionContainer: {
    backgroundColor: colors.surface,
    marginHorizontal: spacing.lg,
    marginVertical: spacing.md,
    padding: spacing.lg,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.small,
  },
  stepInfo: {
    ...typography.label,
    color: colors.primary,
    marginBottom: spacing.sm,
  },
  instruction: {
    ...typography.h3,
    marginBottom: spacing.sm,
  },
  subInstruction: {
    ...typography.bodySecondary,
    marginBottom: spacing.xs,
  },
  feedbackText: {
    ...typography.bodySecondary,
    color: colors.success,
    marginTop: spacing.sm,
    fontStyle: 'italic',
  },
  imageContainer: {
    flex: 1,
    marginHorizontal: spacing.lg,
  },
  controlsContainer: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.lg,
  },
  pointsInfo: {
    backgroundColor: colors.surface,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  pointsText: {
    ...typography.label,
    marginBottom: spacing.sm,
  },
  pointItem: {
    ...typography.bodySecondary,
    marginVertical: spacing.xs / 2,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  resetButton: {
    flex: 1,
    backgroundColor: colors.surface,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  resetButtonText: {
    ...typography.button,
    color: colors.text,
  },
  continueButton: {
    flex: 1,
    backgroundColor: colors.primary,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    ...shadows.small,
  },
  continueButtonText: {
    ...typography.button,
    color: colors.white,
  },
  disabledButton: {
    backgroundColor: colors.gray700,
    borderColor: colors.gray600,
  },
  disabledButtonText: {
    color: colors.gray500,
  },
});

export default CalibrationScreen;
