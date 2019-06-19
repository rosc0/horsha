import types from '../constants/actionTypes'

export const setConnectionStatus = isDeviceConnected => ({
  type: types.SET_CONNECTION_STATUS,
  isDeviceConnected,
})

export const setAlertStatus = (type, title, message) => async dispatch => {
  await dispatch({
    type: types.SET_ALERT_STATUS,
    config: {
      type,
      title,
      message,
    },
  })

  return dispatch({
    type: types.CLEAN_ALERT_STATUS,
  })
}
