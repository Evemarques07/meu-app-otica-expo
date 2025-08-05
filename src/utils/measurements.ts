import {
  Point,
  MeasurementPoint,
  MeasurementType,
  CalibrationData,
  MeasurementResults,
} from "../types";

// Medida padrão do cartão de crédito em mm
export const CARD_WIDTH_MM = 85.6;

/**
 * Calcula a distância euclidiana entre dois pontos
 */
export const calculateDistance = (point1: Point, point2: Point): number => {
  const dx = point2.x - point1.x;
  const dy = point2.y - point1.y;
  return Math.sqrt(dx * dx + dy * dy);
};

/**
 * Calcula a escala de pixels por milímetro baseado nos pontos do cartão
 */
export const calculatePixelsPerMM = (
  cardLeft: Point,
  cardRight: Point
): number => {
  const pixelDistance = calculateDistance(cardLeft, cardRight);
  return pixelDistance / CARD_WIDTH_MM;
};

/**
 * Converte distância em pixels para milímetros
 */
export const pixelsToMM = (pixels: number, pixelsPerMM: number): number => {
  return pixels / pixelsPerMM;
};

/**
 * Calcula todas as medições baseado nos pontos marcados
 */
export const calculateMeasurements = (
  measurementPoints: MeasurementPoint[],
  calibrationData: CalibrationData
): MeasurementResults | null => {
  const leftPupil = measurementPoints.find(
    (p) => p.type === MeasurementType.LEFT_PUPIL
  );
  const rightPupil = measurementPoints.find(
    (p) => p.type === MeasurementType.RIGHT_PUPIL
  );
  const bridgeCenter = measurementPoints.find(
    (p) => p.type === MeasurementType.BRIDGE_CENTER
  );
  const leftLensBottom = measurementPoints.find(
    (p) => p.type === MeasurementType.LEFT_LENS_BOTTOM
  );
  const rightLensBottom = measurementPoints.find(
    (p) => p.type === MeasurementType.RIGHT_LENS_BOTTOM
  );

  // Verifica se todos os pontos necessários foram marcados
  if (
    !leftPupil ||
    !rightPupil ||
    !bridgeCenter ||
    !leftLensBottom ||
    !rightLensBottom
  ) {
    return null;
  }

  const { pixelsPerMM } = calibrationData;

  // DP (Distância Pupilar Total)
  const dpPixels = calculateDistance(leftPupil, rightPupil);
  const dp = pixelsToMM(dpPixels, pixelsPerMM);

  // DPN Esquerda e Direita calculadas a partir da linha vertical da ponte nasal
  // Projeta as pupilas na linha vertical que passa pelo centro da ponte nasal
  const bridgeX = bridgeCenter.x; // Linha vertical da ponte nasal

  // DPN Esquerda: distância horizontal da linha da ponte até a pupila esquerda
  const dpnLeftPixels = Math.abs(leftPupil.x - bridgeX);
  const dpnLeft = pixelsToMM(dpnLeftPixels, pixelsPerMM);

  // DPN Direita: distância horizontal da linha da ponte até a pupila direita
  const dpnRightPixels = Math.abs(rightPupil.x - bridgeX);
  const dpnRight = pixelsToMM(dpnRightPixels, pixelsPerMM);

  // Altura Óptica Esquerda (base da lente até pupila esquerda)
  const heightLeftPixels = Math.abs(leftPupil.y - leftLensBottom.y);
  const heightLeft = pixelsToMM(heightLeftPixels, pixelsPerMM);

  // Altura Óptica Direita (base da lente até pupila direita)
  const heightRightPixels = Math.abs(rightPupil.y - rightLensBottom.y);
  const heightRight = pixelsToMM(heightRightPixels, pixelsPerMM);

  return {
    dp: Math.round(dp * 10) / 10, // Arredonda para 1 casa decimal
    dpnLeft: Math.round(dpnLeft * 10) / 10,
    dpnRight: Math.round(dpnRight * 10) / 10,
    heightLeft: Math.round(heightLeft * 10) / 10,
    heightRight: Math.round(heightRight * 10) / 10,
  };
};

/**
 * Valida se todos os pontos necessários para a medição foram marcados
 */
export const validateMeasurementPoints = (
  points: MeasurementPoint[]
): boolean => {
  const requiredTypes = [
    MeasurementType.LEFT_PUPIL,
    MeasurementType.RIGHT_PUPIL,
    MeasurementType.BRIDGE_CENTER,
    MeasurementType.LEFT_LENS_BOTTOM,
    MeasurementType.RIGHT_LENS_BOTTOM,
  ];

  return requiredTypes.every((type) =>
    points.some((point) => point.type === type)
  );
};

/**
 * Valida se os pontos de calibração do cartão foram marcados
 */
export const validateCalibrationPoints = (
  points: MeasurementPoint[]
): boolean => {
  const hasLeftCard = points.some((p) => p.type === MeasurementType.CARD_LEFT);
  const hasRightCard = points.some(
    (p) => p.type === MeasurementType.CARD_RIGHT
  );
  return hasLeftCard && hasRightCard;
};
