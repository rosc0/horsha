import types from '@constants/actionTypes'
import map from 'lodash/map'
import idx from 'idx'

export const initialState = {
  fetching: false,
  fetched: false,
  error: false,
  saving: false,
  collection: [],
}

export default (state = initialState, { type, payload, meta }) => {
  switch (type) {
    case types.GET_POIS_PENDING: {
      return { ...state, fetching: true, fetched: false, error: false }
    }

    case types.GET_POIS_REJECTED: {
      return { ...state, fetching: false, fetched: false, error: true }
    }

    case types.GET_POIS_FULFILLED: {
      const collection = idx(payload, _ => _.collection) || []

      return {
        ...state,
        collection,
        fetched: true,
        fetching: false,
        error: false,
      }
    }

    case types.ADD_POI_PENDING: {
      return { ...state, saving: true }
    }

    case types.ADD_POI_FULFILLED: {
      return {
        ...state,
        collection: payload ? [payload, ...state.collection] : state.collection,
        saving: false,
      }
    }

    case types.EDIT_POI_FULFILLED: {
      const { payload } = meta

      const update = collection =>
        map(collection, poi => {
          let item = poi

          if (item.id === payload.id) {
            item.type = payload.type
            item.description = payload.description
            item.location = {
              latitude: payload.latitude,
              longitude: payload.longitude,
            }
          }

          return item
        })

      return {
        ...state,
        collection: update(state.collection),
      }
    }

    case types.DELETE_POI_FULFILLED: {
      return {
        ...state,
        collection: state.collection.filter(poi => poi.id !== meta.id),
      }
    }

    default: {
      return state
    }
  }
}
