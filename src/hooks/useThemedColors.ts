import { useTheme } from '../contexts/ThemeContext';
import { lightTheme, darkTheme, ThemeColors } from '../styles/colors';

export const useThemedColors = (): ThemeColors => {
  const { isDark } = useTheme();
  return isDark ? darkTheme : lightTheme;
};
