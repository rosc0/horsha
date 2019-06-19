import types from '@constants/actionTypes'

export const initialState = {
  auth: {
    accessToken: null,
    expireDate: null,
    refreshToken: null,
  },
  resetPassword: {
    fulfilled: false,
    fetching: false,
    errored: false,
  },
  loggedIn: false,
  checking: false,
  fetching: false,
  fetched: false,
  error: null,
}

const reducer = (state = initialState, action = {}) => {
  const { type, payload } = action

  switch (type) {
    case types.LOGIN_PENDING: {
      return {
        ...state,
        checking: true,
        fetching: true,
        loggedIn: false,
        fetched: false,
        error: false,
      }
    }

    case types.LOGIN_FULFILLED: {
      if (!payload.accessToken) {
        return {
          ...state,
          auth: initialState.auth,
          checking: false,
          loggedIn: false,
          fetching: false,
          fetched: true,
          error: true,
        }
      }

      return {
        ...state,
        auth: payload,
        checking: true,
        loggedIn: true,
        fetching: false,
        fetched: true,
        error: false,
      }
    }

    case types.LOGIN_REJECTED: {
      return {
        ...state,
        loggedIn: false,
        error: true,
        checking: false,
        fetching: false,
      }
    }

    case types.ALREADY_LOGGED_IN_PENDING: {
      return {
        ...state,
        loggedIn: false,
        checking: true,
        fetching: false,
        fetched: false,
        error: false,
      }
    }

    case types.ALREADY_LOGGED_IN_FULFILLED: {
      if (payload === false) {
        return {
          ...state,
          auth: initialState.auth,
          loggedIn: false,
          checking: false,
          fetching: false,
          fetched: true,
          error: true,
        }
      }

      return {
        ...state,
        auth: payload,
        loggedIn: true,
        checking: true,
        fetching: false,
        fetched: false,
        error: false,
      }
    }

    case types.FACEBOOK_LOGIN_PENDING: {
      return {
        ...state,
        checking: true,
        fetching: true,
        fetched: false,
        error: false,
      }
    }

    case types.FACEBOOK_LOGIN_FULFILLED: {
      if (!payload.accessToken) {
        return {
          ...state,
          auth: initialState.auth,
          loggedIn: false,
          checking: false,
          fetching: false,
          fetched: true,
          error: true,
        }
      }

      return {
        ...state,
        auth: payload,
        loggedIn: false,
        checking: true,
        fetching: false,
        fetched: true,
        error: false,
      }
    }

    case types.REFRESH_TOKEN_PENDING: {
      return {
        ...state,
        loggedIn: false,
        fetching: true,
        fetched: false,
        error: false,
      }
    }

    case types.REFRESH_TOKEN_REJECTED: {
      return {
        ...state,
        loggedIn: false,
        fetching: false,
        fetched: false,
        error: false,
      }
    }

    case types.REFRESH_TOKEN_FULFILLED: {
      if (!payload.accessToken) {
        return {
          ...state,
          auth: initialState.auth,
          loggedIn: false,
          fetching: false,
          fetched: true,
          error: true,
        }
      }

      return {
        ...state,
        auth: payload,
        loggedIn: true,
        fetching: false,
        fetched: true,
        error: false,
      }
    }

    case types.REFRESH_TOKEN_BACKGROUND_PENDING: {
      return {
        ...state,
        fetching: false,
        fetched: false,
        error: false,
      }
    }

    case types.REFRESH_TOKEN_BACKGROUND_REJECTED: {
      return {
        ...state,
        fetching: false,
        fetched: false,
        error: false,
        loggedIn: false,
      }
    }

    case types.REFRESH_TOKEN_BACKGROUND_FULFILLED: {
      if (!payload.accessToken) {
        return {
          ...state,
          auth: initialState.auth,
          fetching: false,
          fetched: true,
          error: true,
          loggedIn: false,
        }
      }

      return {
        ...state,
        auth: payload,
        loggedIn: true,
        fetching: false,
        fetched: true,
        error: false,
      }
    }

    case types.CURRENT_USER_AUTHENTICATED: {
      if (!payload.id) {
        return {
          ...state,
          auth: initialState.auth,
          fetching: false,
          fetched: true,
          error: true,
        }
      }

      return {
        ...state,
        fetching: false,
        checking: false,
        loggedIn: true,
        fetched: true,
        error: false,
      }
    }

    case types.LOGOUT_CURRENT_USER_FULFILLED: {
      return initialState
    }

    case types.RESET_PASSWORD_PENDING: {
      return {
        ...state,
        resetPassword: {
          ...state.resetPassword,
          fetching: true,
          errored: false,
          fulfilled: false,
        },
      }
    }

    case types.RESET_PASSWORD_FULFILLED: {
      return {
        ...state,
        resetPassword: {
          ...state.resetPassword,
          fulfilled: true,
          fetching: false,
          errored: false,
        },
      }
    }

    case types.RESET_PASSWORD_REJECTED: {
      return {
        ...state,
        resetPassword: {
          ...state.resetPassword,
          fulfilled: false,
          fetching: false,
          errored: true,
        },
      }
    }

    case types.CLEAR_RESET_PASSWORD: {
      return {
        ...state,
        resetPassword: initialState.resetPassword,
      }
    }

    default: {
      return state
    }
  }
}

export default reducer
