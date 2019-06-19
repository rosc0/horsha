import types from '@constants/actionTypes'
import { getIndexById } from '@application/utils'

export const initialState = {
  friends: [],
  friendsRemaining: 0,
  friendsCursor: null,
  friendSearch: [],
  friendSearchRemaining: 0,
  friendsByKm: [],
  friendsByKmRemaining: 0,
  friendsByKmCursor: null,
  fetching: false,
  fetched: false,
  error: null,
}

const reducer = (state = initialState, action = {}) => {
  const { type, payload } = action

  switch (type) {
    case types.GET_FRIENDS: {
      return {
        ...state,
        fetching: true,
      }
    }

    case types.GET_FRIENDS_PENDING: {
      return {
        ...state,
        fetching: true,
      }
    }

    case types.GET_FRIENDS_FULFILLED: {
      return {
        ...state,
        friends: payload.collection,
        friendsRemaining: payload.remaining,
        friendsCursor: payload.cursor,
        fetched: true,
        error: false,
        fetching: false,
      }
    }

    case types.GET_FRIENDS_REJECTED: {
      return {
        ...state,
        error: true,
        fetching: false,
      }
    }

    case types.GET_FRIENDS_PAGINATION_FULFILLED: {
      return {
        ...state,
        friends: [...state.friends.concat(payload.collection)],
        friendsRemaining: payload.remaining,
        friendsCursor: payload.cursor,
        fetched: true,
        error: false,
        fetching: false,
      }
    }

    case types.GET_FRIENDS_BY_KM: {
      return {
        ...state,
        fetching: true,
      }
    }

    case types.GET_FRIENDS_BY_KM_PENDING: {
      return {
        ...state,
        fetching: true,
      }
    }

    case types.GET_FRIENDS_BY_KM_FULFILLED: {
      return {
        ...state,
        friendsByKm: payload.collection,
        friendsByKmRemaining: payload.remaining,
        friendsByKmCursor: payload.cursor,
        fetched: true,
        error: false,
        fetching: false,
      }
    }

    case types.GET_FRIENDS_BY_KM_REJECTED: {
      return {
        ...state,
        error: true,
        fetching: false,
      }
    }

    case types.GET_FRIENDS_BY_KM_PAGINATION_FULFILLED: {
      return {
        ...state,
        friendsByKm: [...state.friendsByKm.concat(payload.collection)],
        friendsByKmRemaining: payload.remaining,
        friendsByKmCursor: payload.cursor,
        fetched: true,
        error: false,
        fetching: false,
      }
    }

    case types.GET_FRIEND_SEARCH: {
      return {
        ...state,
        fetching: true,
      }
    }

    case types.GET_FRIEND_SEARCH_PENDING: {
      return {
        ...state,
        fetching: true,
      }
    }

    case types.GET_FRIEND_SEARCH_FULFILLED: {
      return {
        ...state,
        friendSearch: payload.collection,
        friendSearchRemaining: payload.remaining,
        fetched: true,
        error: false,
        fetching: false,
      }
    }

    case types.GET_FRIEND_SEARCH_REJECTED: {
      return {
        ...state,
        error: true,
        fetching: false,
      }
    }

    case types.GET_FRIEND_SEARCH_PAGINATION_FULFILLED: {
      return {
        ...state,
        friendSearch: [...state.friendSearch.concat(payload.collection)],
        friendSearchRemaining: payload.remaining,
        fetched: true,
        error: false,
        fetching: false,
      }
    }

    case types.CLEAR_FRIEND_SEARCH: {
      return {
        ...state,
        friendSearch: [],
        friendSearchRemaining: 0,
      }
    }

    case types.REMOVE_FRIEND: {
      return {
        ...state,
        fetching: true,
      }
    }

    case types.REMOVE_FRIEND_PENDING: {
      return {
        ...state,
        fetching: true,
      }
    }

    case types.REMOVE_FRIEND_FULFILLED: {
      return {
        ...state,
        fetched: true,
        error: false,
        fetching: false,
      }
    }

    case types.REMOVE_FRIEND_FROM_LIST: {
      const index = getIndexById(state.friends, payload.userId)

      return {
        ...state,
        friends: [
          ...state.friends.slice(0, index),
          ...state.friends.slice(index + 1),
        ],
      }
    }

    default: {
      return state
    }
  }
}

export default reducer
