import types from '@constants/actionTypes'

export const initialState = {
  user: {
    id: null,
    name: null,
    gender: null,
    primary_email: null,
    role: null,
    has_password: null,
    account_status: null,
    date_created: null,
    nr_of_rides: null,
    total_riding_distance: null,
    total_riding_time: null,
    total_riding_ascent: null,
    total_riding_descent: null,
    horse_membership_count: null,
    verification_state: null,
  },
  userSearch: {
    fetching: false,
    users: [],
  },
  fetching: false,
  fetched: false,
  error: null,
}

const reducer = (state = initialState, action = {}) => {
  const { type, payload, meta } = action

  switch (type) {
    case types.CURRENT_USER_PENDING: {
      return {
        ...state,
        fetching: true,
        fetched: false,
        error: false,
      }
    }

    case types.CURRENT_USER_FULFILLED: {
      return {
        ...state,
        user: payload,
        fetching: false,
        fetched: true,
        error: false,
      }
    }

    case types.CURRENT_USER_REJECTED: {
      return {
        ...state,
        fetching: false,
        fetched: false,
        error: true,
      }
    }

    case types.USER_SEARCH_PENDING: {
      return {
        ...state,
        userSearch: {
          ...state.userSearch,
          fetching: true,
        },
      }
    }

    case types.USER_SEARCH_FULFILLED: {
      return {
        ...state,
        userSearch: {
          ...state.userSearch,
          fetching: false,
          users: payload.collection || [],
        },
      }
    }

    case types.UPDATE_USER_PREFERENCE_FULFILLED: {
      return {
        ...state,
        user: {
          ...state.user,
          preferences: meta.preferences,
        },
      }
    }

    case types.UPDATE_VERIFICATION_STATE: {
      return {
        ...state,
        user: {
          ...state.user,
          verification_state:
            payload === state.user.id
              ? 'verified'
              : this.state.verification_state,
        },
      }
    }

    default: {
      return state
    }
  }
}

export default reducer
