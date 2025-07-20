// Paleta de cores do sistema
export const colors = {
  // Cores de fundo
  backgroundStart: '#1A1A1A',
  backgroundEnd: '#121212',
  surface: '#2C2C2E',
  surfaceSecondary: '#1C1C1E',
  
  // Cores primárias
  primary: '#0A84FF',
  primaryMuted: 'rgba(10, 132, 255, 0.1)',
  primaryDark: '#0056B3',
  
  // Cores de texto
  text: '#FFFFFF',
  textSecondary: '#AEAEB2',
  textMuted: '#8E8E93',
  
  // Cores de estado
  success: '#34C759',
  successMuted: 'rgba(52, 199, 89, 0.1)',
  error: '#FF3B30',
  errorMuted: 'rgba(255, 59, 48, 0.1)',
  warning: '#FF9500',
  warningMuted: 'rgba(255, 149, 0, 0.1)',
  
  // Cores de medição (para os marcadores)
  leftPupil: '#ff4444',
  leftPupilMuted: '#ff444420',
  rightPupil: '#4444ff',
  rightPupilMuted: '#4444ff20',
  bridgeCenter: '#FF6600',
  bridgeCenterMuted: '#FF660020',
  leftLensBottom: '#9966CC',
  leftLensBottomMuted: '#9966CC20',
  rightLensBottom: '#CC6699',
  rightLensBottomMuted: '#CC669920',
  
  // Cores de interface
  border: '#3A3A3C',
  borderLight: '#48484A',
  divider: '#2C2C2E',
  shadow: 'rgba(0, 0, 0, 0.4)',
  overlay: 'rgba(0, 0, 0, 0.6)',
  
  // Cores neutras
  white: '#FFFFFF',
  black: '#000000',
  gray100: '#F2F2F7',
  gray200: '#E5E5EA',
  gray300: '#D1D1D6',
  gray400: '#C7C7CC',
  gray500: '#AEAEB2',
  gray600: '#8E8E93',
  gray700: '#636366',
  gray800: '#48484A',
  gray900: '#2C2C2E',
};

// Gradientes reutilizáveis
export const gradients = {
  primary: [colors.primary, colors.primaryDark],
  background: [colors.backgroundStart, colors.backgroundEnd],
  surface: [colors.surface, colors.surfaceSecondary],
  success: [colors.success, '#28A745'],
  error: [colors.error, '#DC3545'],
  warning: [colors.warning, '#E68900'],
};
