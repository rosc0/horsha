const colors = {
  secondaryColor: '#1e8583',
}

export const theme = {
  // colors
  mainColor: '#da5f35',
  secondaryColor: colors.secondaryColor,
  like: '#d8d8d8',
  likeActive: '#fd9999',
  fontColor: '#9a9a9b',
  fontColorLight: '#9a9a9b',
  fontColorDark: '#4d4d4d',
  border: '#eaeaea',
  borderDark: '#d2d1d6',
  chartRed: '#ca3f28',
  chartYellow: '#f39200',
  chartGreen: '#278583',
  lightGreen: '#71afa2',
  warning: '#eab159',
  blue: '#72ACD9',
  backgroundColor: '#f0eff5',

  icon: {
    top: 2,
    height: 20,
    width: 20,
    resizeMode: 'contain',
  },

  font: {
    sizes: {
      smaller: 8,
      smallest: 11,
      small: 12,
      smallVariation: 13,
      default: 14,
      defaultPlus: 15,
    },
    default: {
      color: '#4d4d4d',
      fontFamily: 'OpenSans',
      fontSize: 14,
    },
    title: {
      color: '#4d4d4d',
      fontFamily: 'Nunito',
    },
    small: {
      color: '#9a9a9b',
      fontFamily: 'OpenSans',
      fontSize: 8,
    },
    sectionTitle: {
      color: '#9a9a9b',
      fontFamily: 'Nunito-Black',
      fontSize: 14,
      // textTransform: 'uppercase',
    },
    userName: {
      color: '#1e8583',
      fontFamily: 'Nunito-ExtraBold',
      fontSize: 14,
    },
    profileName: {
      color: '#4d4d4d',
      fontFamily: 'OpenSans-Bold',
      fontSize: 20,
    },
    // content
    rideStatusNumber: {
      color: '#4d4d4d',
      fontFamily: 'Nunito-Bold',
      fontSize: 16,
    },
    rideStatusLabel: {
      color: '#4d4d4d',
      fontFamily: 'Nunito-Bold',
      fontSize: 10,
    },
    rideStatusNumberBig: {
      color: '#4d4d4d',
      fontFamily: 'Nunito-Bold',
      fontSize: 20,
    },
    // dates
    date: {
      fontSize: 12,
      marginTop: 4,
      color: '#9a9a9b',
    },
    // buttons
  },

  buttons: {
    default: {
      width: '85%',
      alignSelf: 'center',
      padding: 12,
      alignItems: 'center',
      backgroundColor: colors.secondaryColor,
      borderRadius: 5,
    },
    secondary: {
      width: '85%',
      borderColor: 'white',
      borderWidth: 2,
      alignSelf: 'center',
      alignItems: 'center',
      marginTop: 20,
      padding: 10,
      borderRadius: 4,
    },
    raised: {
      width: '85%',
      borderColor: colors.secondaryColor,
      borderWidth: 2,
      alignSelf: 'center',
      alignItems: 'center',
      marginTop: 20,
      padding: 10,
      borderRadius: 4,
    },
    custom: {
      width: 'auto',
      marginLeft: 10,
      backgroundColor: 'transparent',
      borderColor: colors.secondaryColor,
      borderWidth: 1,
      paddingHorizontal: 12,
      paddingVertical: 8,
    },
  },

  // spaces
  paddingHorizontal: 15,
}
