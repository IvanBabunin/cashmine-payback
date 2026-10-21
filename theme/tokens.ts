/**
 * Design tokens. Components take colors and spacing ONLY from here.
 * Palette follows the CashMine web product (cashmine.io): warm neutrals, brand orange.
 */
const brand = {
  orange: '#F58A3A',
  ink: '#211D19',
};

const lightColors = {
  background: '#F5F2EE',
  surface: '#FFFFFF',
  field: '#EFEBE6',
  secondaryButton: '#E7E1DA',
  text: brand.ink,
  textMuted: '#625B54',
  border: '#D8D0C7',
  primary: brand.orange,
  onPrimary: brand.ink,
  accent: '#A94708',
  accentSoft: '#F58A3A1F',
  inset: '#F5F2EE',
  onAccent: '#FFFFFF',
  success: '#21764B',
  warning: '#8A5A00',
  danger: '#B83B38',
};

export type Colors = typeof lightColors;

const darkColors: Colors = {
  background: '#0D0C0B',
  surface: '#161412',
  field: '#1B1815',
  secondaryButton: '#211D19',
  text: '#F5F2EE',
  textMuted: '#C0B8B0',
  border: '#FFFFFF13',
  primary: brand.orange,
  onPrimary: brand.ink,
  accent: brand.orange,
  accentSoft: '#F58A3A1F',
  inset: '#0D0C0B',
  onAccent: '#FFFFFF',
  success: '#47C98B',
  warning: '#E3A008',
  danger: '#EF6B68',
};

/** Recognisable asset colours for the coin badge and share bar; unknown assets fall back to textMuted. */
export const assetColors: Record<string, string> = {
  USDT: '#26A17B',
  BTC: '#F7931A',
  ETH: '#627EEA',
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
} as const;

export const radius = {
  sm: 4,
  md: 12,
  lg: 16,
  full: 999,
} as const;

export const typography = {
  display: { fontFamily: 'Inter_700Bold', fontSize: 40, lineHeight: 46, letterSpacing: -1.2 },
  title: { fontFamily: 'Inter_700Bold', fontSize: 32, lineHeight: 38, letterSpacing: -0.8 },
  subtitle: { fontFamily: 'Inter_600SemiBold', fontSize: 18, lineHeight: 24, letterSpacing: -0.2 },
  body: { fontFamily: 'Inter_400Regular', fontSize: 16, lineHeight: 22 },
  label: { fontFamily: 'Inter_500Medium', fontSize: 14, lineHeight: 18 },
  caption: { fontFamily: 'Inter_400Regular', fontSize: 12, lineHeight: 16 },
} as const;

export const layout = {
  maxWidth: 480,
} as const;

export type Theme = {
  dark: boolean;
  colors: Colors;
  spacing: typeof spacing;
  radius: typeof radius;
  typography: typeof typography;
  layout: typeof layout;
};

export const lightTheme: Theme = {
  dark: false,
  colors: lightColors,
  spacing,
  radius,
  typography,
  layout,
};
export const darkTheme: Theme = {
  dark: true,
  colors: darkColors,
  spacing,
  radius,
  typography,
  layout,
};
