import types from '@constants/actionTypes'
import POIClass from '@api/poi'
import { getTrailPois } from './trails'

const POI = new POIClass()

export const getPOIs = (location, userId) => ({
  type: types.GET_POIS,
  payload: POI.getPOIs(location, userId),
})

export const addPoiByTrail = (payload, trailId) => async dispatch => {
  const poi = await dispatch({
    type: types.ADD_POI,
    payload: POI.addPoi(payload),
  })
  await dispatch(getTrailPois(trailId, (maxItems = 10)))
  return poi.value
}

export const addPoi = (payload, trailId) => ({
  type: types.ADD_POI,
  payload: POI.addPoi(payload),
})

export const editPoi = payload => ({
  type: types.EDIT_POI,
  payload: POI.editPoi(payload),
  meta: { payload },
})

export const deletePoi = id => ({
  type: types.DELETE_POI,
  payload: POI.deletePoi(id),
  meta: { id },
})
