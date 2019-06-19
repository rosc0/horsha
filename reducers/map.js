import types from '@constants/actionTypes'
import { getBBox } from '@utils'

export const initialState = {
  region: {
    latitude: 0,
    longitude: 0,
    latitudeDelta: 0,
    longitudeDelta: 0,
  },
  boundBox: {
    bb_top_right_latitude: 0,
    bb_top_right_longitude: 0,
    bb_bottom_left_latitude: 0,
    bb_bottom_left_longitude: 0,
  },
  source: null,
}

const reducer = (state = initialState, action = {}) => {
  const { type, payload, meta } = action

  switch (type) {
    case types.SET_BOUND_BOX: {
      const { northeast, southwest } = payload
      return {
        ...state,
        boundBox: payload,
      }
    }

    case types.SET_LATITUDE_LONGITUDE: {
      const bb = getBBox({
        latitude: payload.latitude,
        longitude: payload.longitude,
      })
      return {
        ...state,
        region: payload,
        source: meta,
        boundBox: bb,
      }
    }

    case types.RESET_SOURCE: {
      return {
        ...state,
        source: null,
      }
    }

    default: {
      return state
    }
  }
}

export default reducer
