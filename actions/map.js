import types from '@constants/actionTypes'

export const setBoundBox = payload => ({
  type: types.SET_BOUND_BOX,
  payload,
})

export const setLatitudeLongitude = (coords, source = null) => ({
  type: types.SET_LATITUDE_LONGITUDE,
  payload: coords,
  meta: source,
})

export const resetSource = () => ({
  type: types.RESET_SOURCE,
})
