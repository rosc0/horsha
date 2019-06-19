import { AppState, AsyncStorage, NetInfo } from 'react-native'
import * as k from '@constants/storageKeys'
import types from '@constants/actionTypes'
import Authentication from '@api/auth'
import UserClass from '@api/user'
import store from '@application/store'

const Auth = new Authentication()
const User = new UserClass()

let refreshTokenTimeout = null

const refreshTokenOnConnectionChange = status => {
  if (!status) {
    return
  }

  refreshTokenInBackground(true)

  return NetInfo.removeEventListener(
    'connectionChange',
    refreshTokenOnConnectionChange
  )
}

// Refresh token when the state of the app changes
export const refreshTokenOnAppStateChange = async nextAppState => {
  // Will refresh only when the app is `active` again
  if (nextAppState === 'active') {
    if (!store.getState().app.isDeviceConnected) {
      return NetInfo.isConnected.addEventListener(
        'connectionChange',
        refreshTokenOnConnectionChange
      )
    }

    refreshTokenInBackground(true)

    return AppState.removeEventListener('change', refreshTokenOnAppStateChange)
  }
}

export const refreshTokenInBackground = async (fromAppStateChange = false) => {
  const token = JSON.parse(await AsyncStorage.getItem(k.AUTH_NEW_TOKENS))
  if (!token || !token.refreshToken) return

  // If the app is not active (background/inactive) add a listener
  // to the app state to try to refresh the token once it's active again

  if (AppState.currentState !== 'active') {
    return AppState.addEventListener('change', refreshTokenOnAppStateChange)
  }

  if (!store.getState().app.isDeviceConnected) {
    return NetInfo.isConnected.addEventListener(
      'connectionChange',
      refreshTokenOnConnectionChange
    )
  }

  const { refreshToken, expireDate } = token
  const milliseconds = Math.round((expireDate - new Date()) * 0.7)

  if (fromAppStateChange) {
    await store.dispatch(refreshTokenBackground(refreshToken))

    return refreshTokenInBackground()
  }

  refreshTokenTimeout = this.setTimeout(async () => {
    if (
      AppState.currentState !== 'active' ||
      !store.getState().app.isDeviceConnected
    ) {
      return refreshTokenInBackground()
    }

    await store.dispatch(refreshTokenBackground(refreshToken))

    refreshTokenInBackground()
  }, milliseconds)
}

const authenticateCurrentUser = async dispatch => {
  const userData = await dispatch({
    type: types.CURRENT_USER,
    payload: User.currentUser(),
  })

  try {
    await dispatch({
      type: types.CURRENT_USER_AUTHENTICATED,
      payload: userData.value,
    })

    return userData
  } catch (error) {
    // await logoutCurrentUser()
    await dispatch({
      type: types.CURRENT_USER_REJECTED,
      payload: userData.value,
    })
  }

  // if (userData.value.status > 299) {
  //   await dispatch({
  //     type: types.CURRENT_USER_REJECTED,
  //     payload: userData.value,
  //   })

  // } else {
  //   await dispatch({
  //     type: types.CURRENT_USER_AUTHENTICATED,
  //     payload: userData.value,
  //   })

  //   return userData
  // }
}

// actions
export const authenticateByPassword = (username, password) => {
  const credentials = {
    username,
    password,
    grant_type: 'password',
  }

  return async dispatch => {
    const login = await dispatch({
      type: types.LOGIN,
      payload: Auth.authenticate(credentials),
    })

    if (login.value.accessToken) {
      await authenticateCurrentUser(dispatch)
      await refreshTokenInBackground()
    }

    return login
  }
}

export const authenticateByFacebook = accessToken => {
  const credentials = {
    grant_type: 'facebook_token',
    facebook_access_token: accessToken,
  }

  return async dispatch => {
    const fbLogin = await dispatch({
      type: types.FACEBOOK_LOGIN,
      payload: Auth.authenticate(credentials),
    })

    if (fbLogin.value.accessToken) {
      await authenticateCurrentUser(dispatch)
      await refreshTokenInBackground()
    } else if (fbLogin.value.status === 422) {
      await dispatch({
        type: types.CREATE_USER_WITH_FACEBOOK,
        payload: User.createUserWithFacebook(accessToken),
      })

      const fbLogin = await dispatch({
        type: types.FACEBOOK_LOGIN,
        payload: Auth.authenticate(credentials),
      })

      if (fbLogin.value.accessToken) {
        await authenticateCurrentUser(dispatch)
        await refreshTokenInBackground()
      }
    }

    return fbLogin
  }
}

export const isUserAlreadyLoggedIn = () => async dispatch => {
  const isUserAlreadyLoggedInValue = await dispatch({
    type: types.ALREADY_LOGGED_IN,
    payload: Auth.isUserAuthenticated(),
  })

  console.log('@@ isUserAlreadyLoggedInValue', isUserAlreadyLoggedInValue)
  await authenticateCurrentUser(dispatch)

  return refreshTokenInBackground()
}

export const refreshToken = refreshToken => {
  return {
    type: types.REFRESH_TOKEN,
    payload: Auth.refreshToken(refreshToken),
  }
}

export const refreshTokenBackground = refreshToken => {
  return {
    type: types.REFRESH_TOKEN_BACKGROUND,
    payload: Auth.refreshToken(refreshToken),
  }
}

export const logoutCurrentUser = () => async dispatch => {
  this.clearTimeout(refreshTokenTimeout)

  await dispatch({
    type: 'RESET',
    payload: {
      app: store.getState().app,
    },
  })

  Auth.clearStorage()
}

export const resetPassword = email => {
  if (!email) {
    const state = store.getState()

    email = state.user.user.primary_email
  }

  return {
    type: types.RESET_PASSWORD,
    payload: new Authentication({ isAuth: false }).resetPassword(email),
  }
}

export const clearResetPassword = () => ({
  type: types.CLEAR_RESET_PASSWORD,
})
