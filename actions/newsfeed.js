import types from '@constants/actionTypes'
import NewsfeedAPI from '@api/newsfeed'

const Newsfeed = new NewsfeedAPI()

export const getUpdates = (maxItems = 10) => ({
  type: types.GET_UPDATES,
  payload: Newsfeed.getUpdates(maxItems),
})

export const getMoreUpdates = cursor => ({
  type: types.GET_MORE_UPDATES,
  payload: Newsfeed.getUpdates(10, cursor),
})

export const getUpdate = id => ({
  type: types.GET_UPDATE,
  payload: Newsfeed.getUpdate(id),
})

export const deleteUpdate = id => ({
  type: types.DELETE_UPDATE,
  payload: Newsfeed.deleteUpdate(id),
  meta: { id },
})

export const getComments = (contentId, contentType, commentId) => ({
  type: types.GET_COMMENTS,
  payload: Newsfeed.getComments(contentId, contentType, null, null, commentId),
  meta: { contentId, contentType },
})

export const getPreviousComments = (
  contentId,
  contentType,
  before,
  maxItems
) => ({
  type: types.GET_PREVIOUS_COMMENTS,
  payload: Newsfeed.getComments(
    contentId,
    contentType,
    before,
    null,
    null,
    maxItems
  ),
  meta: { contentId, contentType },
})

export const getMoreComments = (contentId, contentType, after) => ({
  type: types.GET_MORE_COMMENTS,
  payload: Newsfeed.getComments(contentId, contentType, null, after),
  meta: { contentId, contentType },
})

export const addComment = (contentId, comment) => ({
  type: types.ADD_COMMENT,
  payload: Newsfeed.addComment(contentId, comment),
  meta: { contentId },
})

export const updateComment = (commentId, contentId, comment) => ({
  type: types.UPDATE_COMMENT,
  payload: Newsfeed.updateComment(commentId, contentId, comment),
  meta: { commentId },
})

export const removeComment = (commentId, contentId) => ({
  type: types.REMOVE_COMMENT,
  payload: Newsfeed.removeComment(commentId, contentId),
  meta: { contentId, commentId },
})

export const refreshNewsfeed = (maxItems = 10) => ({
  type: types.REFRESH_UPDATES,
  payload: Newsfeed.getUpdates(maxItems),
})

export const toggleLike = (isLiked, contentId) => ({
  type: types.TOGGLE_LIKE,
  payload: Newsfeed.toggleLike(!!isLiked, contentId),
  meta: { contentId },
})
