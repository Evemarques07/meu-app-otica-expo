import { StyleSheet } from 'react-native';
import { colors } from './colors';

// Tamanhos e espaçamentos
export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
  xxxl: 64,
};

export const borderRadius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  round: 50,
};

export const fontSize = {
  xs: 12,
  sm: 14,
  md: 16,
  lg: 18,
  xl: 20,
  xxl: 24,
  xxxl: 28,
  huge: 32,
};

export const fontWeight = {
  light: '300' as const,
  normal: '400' as const,
  medium: '500' as const,
  semibold: '600' as const,
  bold: '700' as const,
  heavy: '800' as const,
};

// Estilos de tipografia reutilizáveis
export const typography = StyleSheet.create({
  // Títulos
  title: {
    fontSize: fontSize.xxxl,
    fontWeight: fontWeight.bold,
    color: colors.text,
    lineHeight: 36,
  },
  subtitle: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.medium,
    color: colors.textSecondary,
    lineHeight: 24,
  },
  
  // Headers
  h1: {
    fontSize: fontSize.xxl,
    fontWeight: fontWeight.bold,
    color: colors.text,
    lineHeight: 32,
  },
  h2: {
    fontSize: fontSize.xl,
    fontWeight: fontWeight.semibold,
    color: colors.text,
    lineHeight: 28,
  },
  h3: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.semibold,
    color: colors.text,
    lineHeight: 24,
  },
  
  // Corpo de texto
  body: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.normal,
    color: colors.text,
    lineHeight: 22,
  },
  bodySecondary: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.normal,
    color: colors.textSecondary,
    lineHeight: 22,
  },
  bodyMuted: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.normal,
    color: colors.textMuted,
    lineHeight: 20,
  },
  
  // Rótulos
  label: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
    color: colors.text,
    lineHeight: 18,
  },
  labelSecondary: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
    color: colors.textSecondary,
    lineHeight: 18,
  },
  
  // Botões
  button: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.semibold,
    lineHeight: 24,
  },
  buttonSmall: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.medium,
    lineHeight: 20,
  },
  
  // Captions
  caption: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.normal,
    color: colors.textMuted,
    lineHeight: 16,
  },
});

// Estilos de sombra reutilizáveis
export const shadows = StyleSheet.create({
  small: {
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  medium: {
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 6,
  },
  large: {
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 12,
  },
});

// Estilos de container reutilizáveis
export const containers = StyleSheet.create({
  screen: {
    flex: 1,
  },
  content: {
    padding: spacing.lg,
    paddingBottom: spacing.xxxl,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.medium,
  },
  section: {
    marginBottom: spacing.xl,
  },
});
