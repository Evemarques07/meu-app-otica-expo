export interface ThemeColors {
  // Primárias
  primary: string;
  primaryMuted: string;
  primaryDark: string;
  
  // Superfícies
  background: string;
  surface: string;
  surfaceSecondary: string;
  
  // Texto
  text: string;
  textSecondary: string;
  textMuted: string;
  
  // Estados
  success: string;
  successMuted: string;
  error: string;
  errorMuted: string;
  warning: string;
  warningMuted: string;
  
  // Cores de medição (para os marcadores)
  leftPupil: string;
  leftPupilMuted: string;
  rightPupil: string;
  rightPupilMuted: string;
  bridgeCenter: string;
  bridgeCenterMuted: string;
  leftLensBottom: string;
  leftLensBottomMuted: string;
  rightLensBottom: string;
  rightLensBottomMuted: string;
  
  // Interface
  border: string;
  borderLight: string;
  divider: string;
  shadow: string;
  overlay: string;
  
  // Neutros
  white: string;
  black: string;
  gray100: string;
  gray200: string;
  gray300: string;
  gray400: string;
  gray500: string;
  gray600: string;
  gray700: string;
  gray800: string;
  gray900: string;
}

export const lightTheme: ThemeColors = {
  // Primárias
  primary: '#0A84FF',
  primaryMuted: 'rgba(10, 132, 255, 0.1)',
  primaryDark: '#0056B3',
  
  // Superfícies
  background: '#F2F2F7',
  surface: '#FFFFFF',
  surfaceSecondary: '#F9F9F9',
  
  // Texto
  text: '#000000',
  textSecondary: '#3C3C43',
  textMuted: '#8E8E93',
  
  // Estados
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
  
  // Interface
  border: '#C6C6C8',
  borderLight: '#E5E5EA',
  divider: '#D1D1D6',
  shadow: 'rgba(0, 0, 0, 0.1)',
  overlay: 'rgba(0, 0, 0, 0.4)',
  
  // Neutros
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

export const darkTheme: ThemeColors = {
  // Primárias
  primary: '#0A84FF',
  primaryMuted: 'rgba(10, 132, 255, 0.1)',
  primaryDark: '#409CFF',
  
  // Superfícies
  background: '#000000',
  surface: '#1C1C1E',
  surfaceSecondary: '#2C2C2E',
  
  // Texto
  text: '#FFFFFF',
  textSecondary: '#AEAEB2',
  textMuted: '#8E8E93',
  
  // Estados
  success: '#30D158',
  successMuted: 'rgba(48, 209, 88, 0.1)',
  error: '#FF453A',
  errorMuted: 'rgba(255, 69, 58, 0.1)',
  warning: '#FF9F0A',
  warningMuted: 'rgba(255, 159, 10, 0.1)',
  
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
  
  // Interface
  border: '#3A3A3C',
  borderLight: '#48484A',
  divider: '#2C2C2E',
  shadow: 'rgba(0, 0, 0, 0.4)',
  overlay: 'rgba(0, 0, 0, 0.6)',
  
  // Neutros
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
  primary: (colors: ThemeColors) => [colors.primary, colors.primaryDark],
  success: (colors: ThemeColors) => [colors.success, '#28A745'],
  error: (colors: ThemeColors) => [colors.error, '#DC3545'],
  warning: (colors: ThemeColors) => [colors.warning, '#E68900'],
};

// Exportação para compatibilidade com código existente
export const colors = lightTheme;
