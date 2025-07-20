import React, { useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import CaptureScreen from './src/screens/CaptureScreen';
import CalibrationScreen from './src/screens/CalibrationScreen';
import MeasurementScreen from './src/screens/MeasurementScreen';
import ResultsScreen from './src/screens/ResultsScreen';

import { AppStep, ImageData, CalibrationData, MeasurementResults, MeasurementPoint } from './src/types';

export default function App() {
  const [currentStep, setCurrentStep] = useState<AppStep>(AppStep.CAPTURE);
  const [imageData, setImageData] = useState<ImageData | null>(null);
  const [calibrationData, setCalibrationData] = useState<CalibrationData | null>(null);
  const [measurementPoints, setMeasurementPoints] = useState<MeasurementPoint[]>([]);
  const [results, setResults] = useState<MeasurementResults | null>(null);
  const [capturedImageUri, setCapturedImageUri] = useState<string | null>(null);

  const handleImageCaptured = (data: ImageData) => {
    setImageData(data);
    setCurrentStep(AppStep.CALIBRATION);
  };

  const handleCalibrationComplete = (calibration: CalibrationData, points: MeasurementPoint[]) => {
    setCalibrationData(calibration);
    setMeasurementPoints(points);
    setCurrentStep(AppStep.MEASUREMENT);
  };

  const handleMeasurementComplete = (
    measurementResults: MeasurementResults, 
    points: MeasurementPoint[], 
    capturedUri?: string
  ) => {
    setResults(measurementResults);
    setMeasurementPoints(points);
    setCapturedImageUri(capturedUri || null);
    setCurrentStep(AppStep.RESULTS);
  };  const handleStartNew = () => {
    setImageData(null);
    setCalibrationData(null);
    setResults(null);
    setCapturedImageUri(null);
    setCurrentStep(AppStep.CAPTURE);
  };

  const handleBackToCapture = () => {
    setImageData(null);
    setCalibrationData(null);
    setResults(null);
    setCurrentStep(AppStep.CAPTURE);
  };

  const handleBackToCalibration = () => {
    setCalibrationData(null);
    setResults(null);
    setCurrentStep(AppStep.CALIBRATION);
  };

  const handleBackToMeasurement = () => {
    setResults(null);
    setCurrentStep(AppStep.MEASUREMENT);
  };

  const renderCurrentScreen = () => {
    switch (currentStep) {
      case AppStep.CAPTURE:
        return <CaptureScreen onImageCaptured={handleImageCaptured} />;
      
      case AppStep.CALIBRATION:
        if (!imageData) {
          setCurrentStep(AppStep.CAPTURE);
          return <CaptureScreen onImageCaptured={handleImageCaptured} />;
        }
        return (
          <CalibrationScreen
            imageData={imageData}
            onCalibrationComplete={handleCalibrationComplete}
            onBack={handleBackToCapture}
          />
        );
      
      case AppStep.MEASUREMENT:
        if (!imageData || !calibrationData) {
          setCurrentStep(AppStep.CAPTURE);
          return <CaptureScreen onImageCaptured={handleImageCaptured} />;
        }
        return (
          <MeasurementScreen
            imageData={imageData}
            calibrationData={calibrationData}
            onMeasurementComplete={handleMeasurementComplete}
            onBack={handleBackToCalibration}
          />
        );
      
      case AppStep.RESULTS:
        if (!results) {
          setCurrentStep(AppStep.CAPTURE);
          return <CaptureScreen onImageCaptured={handleImageCaptured} />;
        }
        return (
          <ResultsScreen
            results={results}
            imageData={imageData!}
            calibrationData={calibrationData!}
            measurementPoints={measurementPoints}
            capturedImageUri={capturedImageUri}
            onStartNew={handleStartNew}
            onBack={handleBackToMeasurement}
          />
        );
      
      default:
        return <CaptureScreen onImageCaptured={handleImageCaptured} />;
    }
  };

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <StatusBar style="dark" />
      {renderCurrentScreen()}
    </GestureHandlerRootView>
  );
}
