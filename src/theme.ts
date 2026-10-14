export const colors = {
  background: '#FFFFFF',
  primary: '#4F63AC',
  text: '#303030',
  secondaryText: '#606060',
  tertiaryText: '#808080',
  muted: '#909191',
  border: '#8D9BB5',
  placeholder: '#C5C5C5',
  divider: '#F0F0F0',
  soft: '#F5F5F5',
  softButton: '#F0F0F0',
  shadow: '#8A959E',
  orange: '#FCA34D',
  googleButton: '#4A5568',
  iconIdle: '#999999',
  black: '#242424',
} as const;

export const fonts = {
  montserratMedium: 'MontserratMedium',
  montserratSemiBold: 'MontserratSemiBold',
  montserratBold: 'MontserratBold',
  nunitoRegular: 'NunitoRegular',
  nunitoLight: 'NunitoLight',
  nunitoSemiBold: 'NunitoSemiBold',
  nunitoBold: 'NunitoBold',
  gelasioMedium: 'GelasioMedium',
} as const;

export const spacing = {
  screenHorizontal: 20,
  formHorizontal: 26,
  screenTop: 18,
  tabBarHeight: 75,
} as const;

export const shadows = {
  card: {
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 7 },
    shadowOpacity: 0.18,
    shadowRadius: 24,
    elevation: 10,
  },
  button: {
    shadowColor: colors.text,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.18,
    shadowRadius: 20,
    elevation: 8,
  },
  tabBar: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.05,
    shadowRadius: 25,
    elevation: 14,
  },
} as const;
