import React from 'react'
import { Dimensions, Platform } from 'react-native'

import t from '@config/i18n'
import { theme } from '@styles/theme'
import Icon from '@components/Icon'
import FriendsTabMenu from '@components/FriendsTabMenu'

const fontSize = 13.5

const colors = {
  INACTIVE: '#9a9a9b',
  ACTIVE: '#4d4d4d',
  BACKGROUND: '#f8f8f8',
  BORDER: '#d4d4d4',
  TEXT: 'gray',
}

const { width, height } = Dimensions.get('window')
const screenWidth = height > width ? width : height
const scaledFontSize = Math.round((fontSize * screenWidth) / 375)
const isIOS = Platform.OS === 'ios'

const INITIAL_ROUTE = 'Newsfeed'

export const STACK_CONFIG = {
  headerStyle: {
    borderBottomWidth: 0,
    backgroundColor: theme.mainColor,
  },
  headerTitleStyle: {
    fontSize: 18,
    color: 'white',
    fontFamily: 'Nunito-Bold',
    alignItems: 'center',
    justifyContent: 'center',
    ...Platform.select({
      android: {
        marginBottom: 2,
      },
    }),
  },
  headerBackTitleStyle: {
    fontSize: 16,
    color: 'white',
    fontFamily: 'Nunito-Bold',
    alignItems: 'center',
    justifyContent: 'center',
    ...Platform.select({
      android: {
        marginBottom: 2,
      },
    }),
  },
  headerTitleContainerStyle: {
    flex: 1,
    alignSelf: 'center',
    alignText: 'center',
    backgroundColor: theme.mainColor,
  },
  headerTintColor: 'white',
  headerBackTitle: 'Back', //TODO: fix for tests
  // headerBackTitle: t('common/back'),
  headerBackTitleVisible: true,
}

export const TAB_CONFIG = {
  initialRouteName: INITIAL_ROUTE,
  swipeEnabled: false,
  // lazy: false,
  // https://github.com/react-navigation/react-navigation/issues/3693#issuecomment-373094458
  // animationEnabled: true,
  tabBarOptions: {
    upperCaseLabel: false,
    showIcon: true,
    inactiveTintColor: colors.INACTIVE,
    activeTintColor: colors.ACTIVE,
    indicatorStyle: {
      backgroundColor: colors.ACTIVE,
    },
    style: isIOS
      ? {}
      : {
          backgroundColor: colors.BACKGROUND,
          padding: 0,
          margin: 0,
          borderTopWidth: 1,
          borderColor: colors.BORDER,
          height: 50,
        },
    iconStyle: { width: '90%' },
    labelStyle: {
      ...Platform.select({
        android: {
          marginTop: 2,
          color: colors.TEXT,
          width: '100%',
        },
      }),
      fontSize: scaledFontSize,
      fontFamily: 'Nunito-Bold',
    },
  },
  useNativeDriver: true,
}

const tabBarOnPress = ({ navigation, defaultHandler }) => {
  const { isFocused, state, popToTop } = navigation
  const { routeName } = state.routes[0]

  if (routeName === 'Trails') {
    if (
      !!state.routes[0] &&
      !!state.routes[0].params &&
      !!state.routes[0].params.onTabFocus
    ) {
      state.routes[0].params.onTabFocus()
    }
  }

  if (isFocused()) {
    // for double touch
    if (routeName === 'News') {
      if (
        !!state.routes[0] &&
        !!state.routes[0].params &&
        !!state.routes[0].params.onTabFocus
      ) {
        state.routes[0].params.onTabFocus()
      }
    }
  } else {
    defaultHandler()
  }
}

export const getConfig = (item, iconName = false) => ({
  tabBarLabel: t(`tabs/${item}`),
  tabBarIcon: ({ tintColor: color }) => {
    if (item === 'friends') {
      return <FriendsTabMenu tintColor={color} />
    } else {
      return (
        <Icon
          name={iconName || item}
          style={[{ fontSize: 23, paddingTop: 4 }, { color }]}
        />
      )
    }
  },
  tabBarOnPress,
})

export const getModalConfig = (item, iconName = false) => ({
  tabBarLabel: t(`tabs/${item}`),
  tabBarIcon: ({ tintColor: color }) => {
    if (item === 'friends') {
      return <FriendsTabMenu tintColor={color} />
    } else {
      return (
        <Icon
          name={iconName || item}
          style={[{ fontSize: 23, paddingTop: 4 }, { color }]}
        />
      )
    }
  },
  tabBarOnPress: ({ navigation }) => {
    navigation.navigate('RecordModal')
  },
})
