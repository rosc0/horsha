import types from '@constants/actionTypes'

export const initialState = {
  fetched: false,
  fetching: false,
  error: false,
  forceUpdate: null,
  rides: [],
  rideDetails: {},
  rideFetched: false,
  rideFetching: false,
  rideReviews: [],
  trailsPassed: [],
}

const reducer = (state = initialState, action = {}) => {
  const { type, payload } = action

  switch (type) {
    case types.GET_RIDES_PENDING: {
      return { ...state, fetching: true, fetched: false, error: false }
    }

    case types.GET_RIDES_REJECTED: {
      return { ...state, error: true, fetched: false, fetching: false }
    }

    case types.GET_RIDES_FULFILLED: {
      const rides = payload.collection

      return {
        ...state,
        rides,
        fetched: true,
        error: false,
        fetching: false,
      }
    }

    case types.GET_RIDE_DETAILS_PENDING: {
      return {
        ...state,
        rideFetching: true,
        rideFetched: false,
        error: false,
        trailsPassed: [],
      }
    }

    case types.GET_RIDE_DETAILS_REJECTED: {
      return { ...state, error: true, rideFetched: false, rideFetching: false }
    }

    case types.GET_RIDE_DETAILS_FULFILLED: {
      return {
        ...state,
        rideDetails: payload,
        rideFetched: true,
        error: false,
        rideFetching: false,
        trailsPassed: [],
      }
    }

    case types.GET_TRAILS_PASSED_FULFILLED: {
      return {
        ...state,
        trailsPassed: payload,
      }
    }

    default: {
      return state
    }
  }
}

export default reducer
