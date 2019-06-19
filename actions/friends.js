import types from '@constants/actionTypes'
import FriendsClass from '@api/friends'

const Friends = new FriendsClass()

export const getFriends = userId => {
  return {
    type: types.GET_FRIENDS,
    payload: Friends.getFriends(userId),
  }
}

export const getMoreFriends = (userId, cursor) => {
  return {
    type: types.GET_FRIENDS_PAGINATION,
    payload: Friends.getFriends(userId, cursor),
  }
}

export const getFriendsByKm = userId => {
  return {
    type: types.GET_FRIENDS_BY_KM,
    payload: Friends.getFriends(userId, null, '-total_riding_distance'),
  }
}

export const getMoreFriendsByKm = (userId, cursor) => {
  return {
    type: types.GET_FRIENDS_BY_KM_PAGINATION,
    payload: Friends.getFriends(userId, cursor, '-total_riding_distance'),
  }
}

export const getInvitations = state => {
  return {
    type:
      state === 'pending'
        ? types.GET_PENDING_FRIEND_INVITATIONS
        : types.GET_IGNORED_FRIEND_INVITATIONS,
    payload: Friends.getInvitations(state),
  }
}

export const getMoreInvitations = (state, cursor) => {
  return {
    type:
      state === 'pending'
        ? types.PENDING_FRIEND_INVITATIONS_PAGINATION
        : types.IGNORED_FRIEND_INVITATIONS_PAGINATION,
    payload: Friends.getInvitations(state, cursor),
  }
}

export const getSuggestions = () => {
  return {
    type: types.GET_FRIEND_SUGGESTIONS,
    payload: Friends.getSuggestions(),
  }
}

export const acceptRequest = fromUserId => {
  return dispatch =>
    dispatch({
      type: types.ACCEPT_FRIEND_REQUEST,
      payload: Friends.acceptRequest(fromUserId),
    })
      .then(() =>
        dispatch({
          type: types.REMOVE_FRIEND_REQUEST_FROM_LIST,
          payload: fromUserId,
        })
      )
      .then(() => dispatch(getFriends()))
      .catch(() => {})
}

export const ignoreRequest = fromUserId => {
  return dispatch =>
    dispatch({
      type: types.IGNORE_FRIEND_REQUEST,
      payload: Friends.ignoreRequest(fromUserId),
    })
      .then(() =>
        dispatch({
          type: types.REMOVE_FRIEND_REQUEST_FROM_LIST,
          payload: fromUserId,
        })
      )
      .then(() => dispatch(getInvitations('ignored')))
      .catch(() => {})
}

export const deleteRequest = fromUserId => {
  return dispatch =>
    dispatch({
      type: types.DELETE_FRIEND_REQUEST,
      payload: Friends.deleteRequest(fromUserId),
    })
      .then(() =>
        dispatch({
          type: types.REMOVE_FRIEND_REQUEST_FROM_LIST,
          payload: fromUserId,
        })
      )
      .catch(() => {})
}

export const addFriend = targetUserId => {
  return dispatch =>
    dispatch({
      type: types.ADD_FRIEND,
      payload: Friends.addFriend(targetUserId),
    })
}

export const unFriend = friendshipId => {
  return {
    type: types.REMOVE_FRIEND,
    payload: Friends.removeFriend(friendshipId),
  }
}

export const followUser = targetUserId => {
  return dispatch =>
    dispatch({
      type: types.USER_FOLLOW_REQUEST,
      payload: Friends.followUser(targetUserId),
    })
}

export const unfollowUser = friendshipId => {
  return {
    type: types.USER_UNFOLLOW_REQUEST,
    payload: Friends.unfollowUser(friendshipId),
  }
}

export const removeFriendFromList = userId => {
  return {
    type: types.REMOVE_FRIEND_FROM_LIST,
    payload: { userId },
  }
}
