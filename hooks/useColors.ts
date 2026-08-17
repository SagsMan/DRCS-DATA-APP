import { useColorScheme } from 'react-native';
import colors from '@/constants/colors';

type ColorScheme = 'light' | 'dark';
export type DesignVariant = 'A' | 'B';

/**
 * Returns the design tokens for the current color scheme and design variant.
 *
 * Design A — royal-blue fintech palette, Roboto/IBMPlexSans/Poppins typography.
 * Design B — deep navy-blue palette from Figma (DRCSDATA Copy), DM Sans typography.
 *
 * Falls back to light palette when scheme is not determined.
 */
export function useColors(
  preferredScheme?: ColorScheme,
  designVariant: DesignVariant = 'A',
) {
  const systemScheme = useColorScheme();
  const scheme = preferredScheme ?? systemScheme;
  const tokens = designVariant === 'B' ? colors.designB : colors.designA;
  const palette = scheme === 'dark' ? tokens.dark : tokens.light;
  return { ...palette, radius: tokens.radius };
}
