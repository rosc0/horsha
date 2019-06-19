import types from '@constants/actionTypes'
import UserClass from '@api/user'

const User = new UserClass()

export const createUser = userData => {
  return {
    type: types.CREATE_USER,
    payload: User.create(userData),
  }
}

export const createUserWithFacebook = accessToken => {
  return {
    type: types.CREATE_USER_WITH_FACEBOOK,
    payload: User.createUserWithFacebook(accessToken),
  }
}

export const getCurrentUser = () => {
  return {
    type: types.CURRENT_USER,
    payload: User.currentUser(),
  }
}

export const registerDevice = token => ({
  type: types.USER_REGISTER_DEVICE,
  payload: User.registerDevice(token),
})

export const updateUser = user => async dispatch => {
  await dispatch({
    type: types.UPDATE_CURRENT_USER_PROFILE,
    payload: User.updateUser(user),
  })

  return dispatch({
    type: types.CURRENT_USER,
    payload: User.currentUser(),
  })
}

export const updateUserProfile = uploadKey => async dispatch => {
  return dispatch({
    type: types.UPDATE_CURRENT_USER_PROFILE_IMAGE,
    payload: User.updateUserImage(uploadKey),
  })
}

export const updateUserPreferences = preferences => ({
  type: types.UPDATE_USER_PREFERENCE,
  payload: User.updateUserPreferences(preferences),
  meta: {
    preferences,
  },
})

export const searchUser = searchTerm => ({
  type: types.USER_SEARCH,
  payload: User.search(searchTerm),
})

export const verificationStateChange = userId => ({
  type: types.UPDATE_VERIFICATION_STATE,
  payload: userId,
})
