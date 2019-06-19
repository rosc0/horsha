import types from '@constants/actionTypes'
import NotificationsClass from '@api/notifications'

const Notifications = new NotificationsClass()

export const getUnreadCount = () => {
  return {
    type: types.GET_UNREAD_NOTIFICATION_COUNT,
    payload: Notifications.getUnreadCount(),
  }
}

export const updateReadMarker = dateRead => {
  return dispatch =>
    dispatch({
      type: types.UPDATE_READ_MARKER,
      payload: Notifications.updateReadMarker(dateRead),
    }).then(() => {
      dispatch({
        type: types.GET_UNREAD_NOTIFICATION_COUNT,
        payload: Notifications.getUnreadCount(),
      })
    })
}

export const getNotifications = () => {
  return {
    type: types.GET_NOTIFICATIONS,
    payload: Notifications.getNotifications(),
  }
}

export const getMoreNotifications = cursor => {
  return {
    type: types.GET_NOTIFICATIONS_PAGINATION,
    payload: Notifications.getNotifications(cursor),
  }
}

export const addNotification = notification => {
  return {
    type: types.ADD_NOTIFICATION,
    payload: notification,
  }
}

export const mergeNewNotifications = () => {
  return dispatch =>
    dispatch({
      type: types.MERGE_NEW_NOTIFICATIONS,
    })
}

export const removeNotification = notificationId => {
  return {
    type: types.REMOVE_NOTIFICATION,
    payload: notificationId,
  }
}

export const markNotificationsRead = () => {
  return {
    type: types.MARK_NOTIFICATIONS_READ,
  }
}
