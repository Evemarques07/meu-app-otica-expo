import React from 'react';
import { TouchableOpacity, StyleSheet, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeContext';
import { useThemedColors } from '../hooks/useThemedColors';
import { spacing } from '../styles/layout';

interface ThemeSwitchProps {
  size?: number;
  style?: any;
}

export const ThemeSwitch: React.FC<ThemeSwitchProps> = ({ size = 24, style }) => {
  const { toggleTheme, isDark } = useTheme();
  const colors = useThemedColors();

  return (
    <TouchableOpacity
      style={[styles.container, { backgroundColor: colors.surface }, style]}
      onPress={toggleTheme}
      activeOpacity={0.7}
    >
      <View style={[styles.iconContainer, { backgroundColor: colors.primary }]}>
        <Feather 
          name={isDark ? 'sun' : 'moon'} 
          size={size} 
          color={colors.white} 
        />
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: spacing.xs,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  iconContainer: {
    padding: spacing.xs,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
