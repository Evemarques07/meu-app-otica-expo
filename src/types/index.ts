export interface Point {
  x: number;
  y: number;
}

export interface MeasurementPoint extends Point {
  id: string;
  type: MeasurementType;
  label: string;
}

export enum MeasurementType {
  CARD_LEFT = 'card_left',
  CARD_RIGHT = 'card_right',
  LEFT_PUPIL = 'left_pupil',
  RIGHT_PUPIL = 'right_pupil',
  BRIDGE_CENTER = 'bridge_center',
  LEFT_LENS_BOTTOM = 'left_lens_bottom',
  RIGHT_LENS_BOTTOM = 'right_lens_bottom',
}

export interface CalibrationData {
  cardLeftPoint: Point;
  cardRightPoint: Point;
  pixelsPerMM: number;
}

export interface MeasurementResults {
  dp: number; // Distância Pupilar Total (mm)
  dpnLeft: number; // DPN Esquerda (mm)
  dpnRight: number; // DPN Direita (mm)
  heightLeft: number; // Altura Óptica Esquerda (mm)
  heightRight: number; // Altura Óptica Direita (mm)
}

export interface ImageData {
  uri: string;
  width: number;
  height: number;
}

export interface AppState {
  currentStep: AppStep;
  imageData: ImageData | null;
  calibrationData: CalibrationData | null;
  measurementPoints: MeasurementPoint[];
  results: MeasurementResults | null;
}

export enum AppStep {
  CAPTURE = 'capture',
  CALIBRATION = 'calibration',
  MEASUREMENT = 'measurement',
  RESULTS = 'results',
}
