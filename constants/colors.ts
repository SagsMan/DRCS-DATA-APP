/**
 * DRCS DATA fintech design tokens — two design variants.
 *
 * Design A: Royal blue brand signal, white surfaces, charcoal text.
 * Design B: Deep navy-blue brand, off-white surfaces, warm-dark text. DM Sans
 *           typography. Derived from the DRCSDATA (Copy) Figma file.
 */

// ─── Design A ────────────────────────────────────────────────────────────────
const designA = {
  light: {
    text: '#172033',
    tint: '#2557D6',

    background: '#EAF4FF',
    foreground: '#172033',

    brandPrimaryLight: '#DFF0FF',
    brandPrimary: '#2557D6',
    brandPrimaryDark: '#12358F',
    brandPrimaryLightest: '#EAF4FF',
    grayBlack: '#172033',
    grayGray1: '#5E6B82',
    grayGray4: '#D8E1F0',

    card: '#FFFFFF',
    cardForeground: '#172033',

    primary: '#2557D6',
    primaryForeground: '#FFFFFF',

    secondary: '#D9EDFF',
    secondaryForeground: '#12358F',

    muted: '#EEF7FF',
    mutedForeground: '#5E6B82',

    accent: '#18A66A',
    accentForeground: '#FFFFFF',
    success: '#18A66A',
    successLight: '#E6F7EF',

    destructive: '#D64545',
    destructiveForeground: '#FFFFFF',

    border: '#D8E1F0',
    input: '#C8D5EA',
    overlay: 'rgba(18, 53, 143, 0.56)',

    // Typography families
    fontBody: 'Roboto_400Regular',
    fontBodyMedium: 'Roboto_400Regular',
    fontBodySemiBold: 'Roboto_600SemiBold',
    fontHeading: 'IBMPlexSans_600SemiBold',
    fontBrand: 'Poppins_700Bold',
  },
  dark: {
    text: '#F4F7FF',
    tint: '#6D92FF',
    background: '#0E1830',
    foreground: '#F4F7FF',
    brandPrimaryLight: '#1C326B',
    brandPrimary: '#6D92FF',
    brandPrimaryDark: '#9BB5FF',
    brandPrimaryLightest: '#132342',
    grayBlack: '#F4F7FF',
    grayGray1: '#B6C4DD',
    grayGray4: '#34476C',
    card: '#162443',
    cardForeground: '#F4F7FF',
    primary: '#6D92FF',
    primaryForeground: '#0E1830',
    secondary: '#1B2D53',
    secondaryForeground: '#DCE6FF',
    muted: '#1A2948',
    mutedForeground: '#B6C4DD',
    accent: '#39C987',
    accentForeground: '#0E1830',
    success: '#39C987',
    successLight: '#173C36',
    destructive: '#F07171',
    destructiveForeground: '#1A1010',
    border: '#34476C',
    input: '#40557D',
    overlay: 'rgba(0, 0, 0, 0.64)',

    fontBody: 'Roboto_400Regular',
    fontBodyMedium: 'Roboto_400Regular',
    fontBodySemiBold: 'Roboto_600SemiBold',
    fontHeading: 'IBMPlexSans_600SemiBold',
    fontBrand: 'Poppins_700Bold',
  },
  radius: 12,
};

// ─── Design B (Figma: DRCSDATA Copy) ─────────────────────────────────────────
// Primary: #014dd4  Background: #f1f7ff  Text: #17000e  Font: DM Sans
const designB = {
  light: {
    text: '#17000e',
    tint: '#014dd4',

    background: '#f1f7ff',
    foreground: '#17000e',

    brandPrimaryLight: '#c9ddff',
    brandPrimary: '#014dd4',
    brandPrimaryDark: '#013aab',
    brandPrimaryLightest: '#eaf2ff',
    grayBlack: '#17000e',
    grayGray1: '#4a5878',
    grayGray4: '#d0ddf4',

    card: '#ffffff',
    cardForeground: '#17000e',

    primary: '#014dd4',
    primaryForeground: '#ffffff',

    secondary: '#c9ddff',
    secondaryForeground: '#013aab',

    muted: '#eef4ff',
    mutedForeground: '#4a5878',

    accent: '#18A66A',
    accentForeground: '#ffffff',
    success: '#18A66A',
    successLight: '#E6F7EF',

    destructive: '#D64545',
    destructiveForeground: '#ffffff',

    border: '#d0ddf4',
    input: '#e2ebff',
    overlay: 'rgba(1, 77, 212, 0.52)',

    // DM Sans typography for Design B
    fontBody: 'DMSans_400Regular',
    fontBodyMedium: 'DMSans_400Regular',
    fontBodySemiBold: 'DMSans_600SemiBold',
    fontHeading: 'DMSans_600SemiBold',
    fontBrand: 'DMSans_600SemiBold',
  },
  dark: {
    text: '#e8eeff',
    tint: '#5b8ef0',
    background: '#070f23',
    foreground: '#e8eeff',
    brandPrimaryLight: '#142957',
    brandPrimary: '#5b8ef0',
    brandPrimaryDark: '#8ab0f5',
    brandPrimaryLightest: '#0d1e3d',
    grayBlack: '#e8eeff',
    grayGray1: '#94a8cc',
    grayGray4: '#253760',
    card: '#0f1e3a',
    cardForeground: '#e8eeff',
    primary: '#5b8ef0',
    primaryForeground: '#070f23',
    secondary: '#142957',
    secondaryForeground: '#c5d5f5',
    muted: '#101e3a',
    mutedForeground: '#94a8cc',
    accent: '#39C987',
    accentForeground: '#070f23',
    success: '#39C987',
    successLight: '#0e2f25',
    destructive: '#F07171',
    destructiveForeground: '#1A1010',
    border: '#253760',
    input: '#2c4070',
    overlay: 'rgba(0, 0, 0, 0.70)',

    fontBody: 'DMSans_400Regular',
    fontBodyMedium: 'DMSans_400Regular',
    fontBodySemiBold: 'DMSans_600SemiBold',
    fontHeading: 'DMSans_600SemiBold',
    fontBrand: 'DMSans_600SemiBold',
  },
  radius: 10,
};

const colors = {
  designA,
  designB,

  // Legacy flat exports (Design A light) kept for backward compatibility
  light: designA.light,
  dark: designA.dark,
  radius: designA.radius,
};

export default colors;
