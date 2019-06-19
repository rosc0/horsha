// import { NativeModules, Platform } from 'react-native'
import types from '@constants/actionTypes'

// import { getLanguage } from '../utils'

// export const defaultLanguage =
//   Platform.OS === 'ios'
//     ? getLanguage(NativeModules.SettingsManager.settings.AppleLocale || 'en')
//     : getLanguage(NativeModules.I18nManager.localeIdentifier || 'en')

export const initialState = {
  language: 'en',
  statusBarHidden: false,
  pushNotificationsEnabled: false,
}

const reducer = (state = initialState, action = {}) => {
  const { type, payload } = action

  switch (type) {
    case types.CHANGE_LANGUAGE: {
      return { ...state, language: payload }
    }

    case types.TOGGLE_STATUS_BAR: {
      return { ...state, statusBarHidden: payload }
    }

    case types.SETTINGS_ENABLE_PUSH_NOTIFICATIONS: {
      return { ...state, pushNotificationsEnabled: true }
    }

    default: {
      return state
    }
  }
}

export default reducer
