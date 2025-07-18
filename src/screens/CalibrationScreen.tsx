// calibração
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Alert,
} from 'react-native';
import ImageViewer from '../components/ImageViewer';
import { ImageData, MeasurementPoint, MeasurementType, Point, CalibrationData } from '../types';
import { calculatePixelsPerMM, validateCalibrationPoints } from '../utils/measurements';

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
    console.log('CalibrationScreen - Point received:', point);
    console.log('CalibrationScreen - Current step:', currentStep);
    
    const pointType = currentStep === 'left' ? MeasurementType.CARD_LEFT : MeasurementType.CARD_RIGHT;
    const label = currentStep === 'left' ? 'Extremidade Esquerda' : 'Extremidade Direita';
    
    const newPoint: MeasurementPoint = {
      id: `card_${currentStep}_${Date.now()}`,
      x: point.x,
      y: point.y,
      type: pointType,
      label,
    };

    console.log('CalibrationScreen - New point created:', newPoint);

    // Remove ponto anterior do mesmo tipo se existir
    const filteredPoints = measurementPoints.filter(p => p.type !== pointType);
    const updatedPoints = [...filteredPoints, newPoint];
    
    console.log('CalibrationScreen - Updated points:', updatedPoints);
    setMeasurementPoints(updatedPoints);

    // Feedback visual temporário
    setLastTapFeedback(`✓ ${label} marcada`);
    setTimeout(() => setLastTapFeedback(''), 2000);

    // Avança para o próximo passo
    if (currentStep === 'left') {
      setCurrentStep('right');
      console.log('CalibrationScreen - Moving to right step');
    } else {
      console.log('CalibrationScreen - Both points marked');
    }
  };

  const handleContinue = () => {
    if (!validateCalibrationPoints(measurementPoints)) {
      Alert.alert(
        'Pontos Incompletos',
        'Por favor, marque as duas extremidades do cartão de crédito.'
      );
      return;
    }

    const leftPoint = measurementPoints.find(p => p.type === MeasurementType.CARD_LEFT);
    const rightPoint = measurementPoints.find(p => p.type === MeasurementType.CARD_RIGHT);

    if (!leftPoint || !rightPoint) {
      Alert.alert('Erro', 'Não foi possível encontrar os pontos de calibração.');
      return;
    }

    const pixelsPerMM = calculatePixelsPerMM(leftPoint, rightPoint);
    
    const calibrationData: CalibrationData = {
      cardLeftPoint: leftPoint,
      cardRightPoint: rightPoint,
      pixelsPerMM,
    };

    onCalibrationComplete(calibrationData, measurementPoints);
  };

  const handleReset = () => {
    setMeasurementPoints([]);
    setCurrentStep('left');
  };

  const getInstructionText = () => {
    if (currentStep === 'left') {
      return 'Toque na extremidade ESQUERDA do cartão';
    }
    return 'Toque na extremidade DIREITA do cartão';
  };

  const getInstructionDetails = () => {
    if (currentStep === 'left') {
      return 'Será marcada com uma mira vermelha 🔴';
    }
    return 'Será marcada com uma mira azul 🔵';
  };

  const getStepInfo = () => {
    const leftMarked = measurementPoints.some(p => p.type === MeasurementType.CARD_LEFT);
    const rightMarked = measurementPoints.some(p => p.type === MeasurementType.CARD_RIGHT);
    
    return `Passo ${leftMarked ? (rightMarked ? '2/2' : '2/2') : '1/2'}`;
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={onBack}>
          <Text style={styles.backButtonText}>← Voltar</Text>
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
          Use zoom (até 5x) e pan para máxima precisão
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
            style={styles.resetButton} 
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
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  backButton: {
    padding: 5,
  },
  backButtonText: {
    color: '#007AFF',
    fontSize: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  placeholder: {
    width: 60,
  },
  instructionContainer: {
    backgroundColor: '#fff',
    padding: 15,
    marginHorizontal: 10,
    marginBottom: 10,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  stepInfo: {
    fontSize: 14,
    color: '#007AFF',
    fontWeight: '600',
    marginBottom: 5,
  },
  instruction: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 5,
  },
  subInstruction: {
    fontSize: 14,
    color: '#666',
  },
  feedbackText: {
    fontSize: 14,
    color: '#28a745',
    fontWeight: '600',
    marginTop: 8,
    textAlign: 'center',
  },
  imageContainer: {
    flex: 1,
    margin: 10,
    marginBottom: 15,
    backgroundColor: '#fff',
    borderRadius: 10,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  controlsContainer: {
    backgroundColor: '#fff',
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  pointsInfo: {
    marginBottom: 20,
  },
  pointsText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 10,
  },
  pointItem: {
    fontSize: 14,
    color: '#666',
    marginLeft: 10,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 15,
  },
  resetButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ccc',
    alignItems: 'center',
  },
  resetButtonText: {
    color: '#666',
    fontSize: 16,
    fontWeight: '600',
  },
  continueButton: {
    flex: 2,
    backgroundColor: '#007AFF',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
  },
  continueButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  disabledButton: {
    backgroundColor: '#ccc',
  },
  disabledButtonText: {
    color: '#999',
  },
});

export default CalibrationScreen;
