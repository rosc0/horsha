import types from '@constants/actionTypes'

export const changeLanguage = language => ({
  type: types.CHANGE_LANGUAGE,
  payload: language,
})

export const toggleStatusBar = visible => ({
  type: types.TOGGLE_STATUS_BAR,
  payload: visible,
})

export const enablePushNotifications = () => ({
  type: types.SETTINGS_ENABLE_PUSH_NOTIFICATIONS,
})
