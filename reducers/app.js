import types from '@constants/actionTypes'
import { INITIAL_ROUTE } from '../routes/config'

// type AlertType = 'info' | 'warn' | 'error' | 'success'

export const initialState = {
  isDeviceConnected: null,
  currentRouteName: INITIAL_ROUTE,
  isError: false,
  error: {
    type: '',
    title: '',
    message: '',
  },
}

const reducer = (state = initialState, action = {}) => {
  switch (action.type) {
    case types.SET_CONNECTION_STATUS: {
      return {
        ...state,
        isDeviceConnected: action.isDeviceConnected,
      }
    }

    case types.SET_ALERT_STATUS: {
      return {
        ...state,
        error: action.config,
        isError: true,
      }
    }

    case types.CLEAN_ALERT_STATUS: {
      return {
        ...state,
        isError: false,
        error: {
          type: '',
          title: '',
          message: '',
        },
      }
    }

    default: {
      return state
    }
  }
}

export default reducer
