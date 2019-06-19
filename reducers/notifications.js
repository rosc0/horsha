import types from '@constants/actionTypes'
import { getIndexById } from '@application/utils'
import idx from 'idx'

export const initialState = {
  notifications: [],
  newNotifications: [],
  notificationsRemaining: 0,
  cursor: null,
  unreadCount: 0,
  fetching: false,
  fetched: false,
  error: null,
}

const notifications = (state = initialState, action = {}) => {
  const { type, payload } = action

  switch (type) {
    case types.GET_NOTIFICATIONS: {
      return {
        ...state,
        fetching: true,
      }
    }

    case types.GET_NOTIFICATIONS_PENDING: {
      return {
        ...state,
        fetching: true,
      }
    }

    case types.GET_NOTIFICATIONS_FULFILLED: {
      // const notifications = idx(payload, _ => _.collection) || []

      return {
        ...state,
        notifications: payload,
        notificationsRemaining: payload.remaining,
        cursor: payload.cursor,
        fetched: true,
        error: false,
        fetching: false,
      }
    }

    case types.GET_NOTIFICATIONS_REJECTED: {
      return {
        ...state,
        error: true,
        fetching: false,
      }
    }

    case types.GET_NOTIFICATIONS_PAGINATION_FULFILLED: {
      const notifications = idx(payload, _ => _.collection) || []

      return {
        ...state,
        notifications: [...state.notifications.concat(notifications)],
        pendingRemaining: payload.remaining || 0,
        cursor: payload.cursor,
        fetched: true,
        error: false,
        fetching: false,
      }
    }

    case types.GET_UNREAD_NOTIFICATION_COUNT_FULFILLED: {
      return {
        ...state,
        unreadCount: payload.remaining,
        fetched: true,
        error: false,
        fetching: false,
      }
    }

    case types.ADD_NOTIFICATION: {
      return {
        ...state,
        newNotifications: [payload, ...state.newNotifications],
        unreadCount: state.unreadCount + 1,
        fetched: true,
        error: false,
        fetching: false,
      }
    }

    case types.MERGE_NEW_NOTIFICATIONS: {
      return {
        ...state,
        notifications: [...state.newNotifications, ...state.notifications],
        newNotifications: [],
        fetched: true,
        error: false,
        fetching: false,
      }
    }

    case types.REMOVE_NOTIFICATION: {
      const index = getIndexById(state.notifications, payload)
      const newIndex = getIndexById(state.newNotifications, payload)

      if (index > -1) {
        return {
          ...state,
          notifications: [
            ...state.notifications.slice(0, index),
            ...state.notifications.slice(index + 1),
          ],
        }
      } else if (newIndex > -1) {
        return {
          ...state,
          newNotifications: [
            ...state.newNotifications.slice(0, newIndex),
            ...state.newNotifications.slice(newIndex + 1),
          ],
          unreadCount: state.unreadCount - 1,
        }
      } else {
        return state
      }
    }

    case types.MARK_NOTIFICATIONS_READ: {
      return {
        ...state,
        notifications: state.notifications.map(notification => {
          if (!notification.is_read) {
            notification.is_read = true
          }
          return notification
        }),
      }
    }

    default: {
      return state
    }
  }
}

export default notifications
