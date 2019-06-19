import types from '@constants/actionTypes'

export const initialState = {
  friendSuggestions: [],
  fetching: false,
  fetched: false,
  error: null,
}

const friendSuggestions = (state = initialState, action = {}) => {
  const { type, payload } = action

  switch (type) {
    case types.GET_FRIEND_SUGGESTIONS: {
      return {
        ...state,
        fetching: true,
      }
    }

    case types.GET_FRIEND_SUGGESTIONS_PENDING: {
      return {
        ...state,
        fetching: true,
      }
    }

    case types.GET_FRIEND_SUGGESTIONS_FULFILLED: {
      return {
        ...state,
        friendSuggestions: payload,
        fetched: true,
        error: false,
        fetching: false,
      }
    }

    case types.GET_FRIEND_SUGGESTIONS_REJECTED: {
      return {
        ...state,
        error: true,
        fetching: false,
      }
    }

    case types.ADD_SUGGESTED_OUTBOUND_REQUEST_ID: {
      return {
        ...state,
        friendSuggestions: state.friendSuggestions.map(user => {
          return user.target_user.id === payload.targetUserId
            ? {
                ...user,
                target_user: {
                  ...user.target_user,
                  friendship_requested: true,
                },
              }
            : user
        }),
        fetched: true,
        error: false,
        fetching: false,
      }
    }

    default: {
      return state
    }
  }
}

export default friendSuggestions
