import types from '@constants/actionTypes'
import { getIndexById } from '@application/utils'

export const initialState = {
  pendingInvitations: [],
  pendingRemaining: 0,
  ignoredInvitations: [],
  ignoredRemaining: 0,
  cursor: null,
  fetching: false,
  fetched: false,
  error: null,
}

const friendInvitations = (state = initialState, action = {}) => {
  const { type, payload } = action

  switch (type) {
    case types.GET_PENDING_FRIEND_INVITATIONS: {
      return {
        ...state,
        fetching: true,
      }
    }

    case types.GET_PENDING_FRIEND_INVITATIONS_PENDING: {
      return {
        ...state,
        fetching: true,
      }
    }

    case types.GET_PENDING_FRIEND_INVITATIONS_FULFILLED: {
      return {
        ...state,
        pendingInvitations: payload.collection,
        pendingRemaining: payload.remaining,
        cursor: payload.cursor,
        fetched: true,
        error: false,
        fetching: false,
      }
    }

    case types.PENDING_FRIEND_INVITATIONS_PAGINATION_FULFILLED: {
      return {
        ...state,
        pendingInvitations: [
          ...state.pendingInvitations.concat(payload.collection),
        ],
        pendingRemaining: payload.remaining,
        cursor: payload.cursor,
        fetched: true,
        error: false,
        fetching: false,
      }
    }

    case types.GET_PENDING_FRIEND_INVITATIONS_REJECTED: {
      return {
        ...state,
        error: true,
        fetching: false,
      }
    }

    case types.GET_IGNORED_FRIEND_INVITATIONS: {
      return {
        ...state,
        fetching: true,
      }
    }

    case types.GET_IGNORED_FRIEND_INVITATIONS_PENDING: {
      return {
        ...state,
        fetching: true,
      }
    }

    case types.GET_IGNORED_FRIEND_INVITATIONS_FULFILLED: {
      return {
        ...state,
        ignoredInvitations: payload.collection,
        ignoredRemaining: payload.remaining,
        fetched: true,
        error: false,
        fetching: false,
      }
    }

    case types.IGNORED_FRIEND_INVITATIONS_PAGINATION_FULFILLED: {
      return {
        ...state,
        ignoredInvitations: [
          ...state.ignoredInvitations.concat(payload.collection),
        ],
        ignoredRemaining: payload.remaining,
        fetched: true,
        error: false,
        fetching: false,
      }
    }

    case types.GET_IGNORED_FRIEND_INVITATIONS_REJECTED: {
      return {
        ...state,
        error: true,
        fetching: false,
      }
    }

    case types.REMOVE_FRIEND_REQUEST_FROM_LIST: {
      const pendingIndex = getIndexById(state.pendingInvitations, payload)
      const ignoredIndex = getIndexById(state.ignoredInvitations, payload)

      return {
        ...state,
        pendingInvitations: [
          ...state.pendingInvitations.slice(0, pendingIndex),
          ...state.pendingInvitations.slice(pendingIndex + 1),
        ],
        ignoredInvitations: [
          ...state.ignoredInvitations.slice(0, ignoredIndex),
          ...state.ignoredInvitations.slice(ignoredIndex + 1),
        ],
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

export default friendInvitations
