import types from '@constants/actionTypes'

export const initialState = {
  fetched: false,
  fetching: false,
  error: false,
  toggle: false,
  collection: [],
  next: null,
  previous: null,
  remaining: 0,
}

const reducer = (state = initialState, action = {}) => {
  const { type, payload } = action

  switch (type) {
    case types.GET_COMMENTS_PENDING: {
      return { ...state, fetching: true, fetched: false, error: false }
    }

    case types.GET_COMMENTS_REJECTED: {
      return { ...state, error: true, fetched: false, fetching: false }
    }

    case types.GET_COMMENTS_FULFILLED: {
      const { collection: comments, next, previous, remaining } = payload

      let collection = state.collection
      collection[action.meta.contentId] = comments.reverse()

      if (!payload || !collection) {
        return { ...state, error: true, fetched: false, fetching: false }
      } else {
        return {
          ...state,
          collection,
          fetching: false,
          error: false,
          fetched: true,
          remaining,
          next,
          previous,
        }
      }
    }

    case types.GET_PREVIOUS_COMMENTS_FULFILLED: {
      const { collection: comments, previous, next, remaining } = payload

      let collection = state.collection

      collection[action.meta.contentId] = comments
        .reverse()
        .concat(collection[action.meta.contentId])

      if (!payload || !collection) {
        return {
          ...state,
          error: true,
          fetched: false,
          fetching: false,
        }
      } else {
        return {
          ...state,
          collection,
          fetching: false,
          error: false,
          fetched: true,
          previous: previous ? previous : null,
          next: next ? next : null,
          remaining,
        }
      }
    }

    case types.GET_MORE_COMMENTS_FULFILLED: {
      const { collection: comments, next, previous, remaining } = payload
      let collection = state.collection

      const revComments = comments.reverse()

      collection[action.meta.contentId] = collection[
        action.meta.contentId
      ].concat(revComments)

      if (!payload || !collection) {
        return { ...state, error: true, fetched: false, fetching: false }
      } else {
        return {
          ...state,
          collection,
          fetching: false,
          error: false,
          fetched: true,
          previous: previous ? previous : null,
          next: next ? next : null,
          remaining,
        }
      }
    }

    // case types.ADD_COMMENT_FULFILLED: {
    //   const { contentId } = action.meta

    //   return {
    //     ...state,
    //     collection: {
    //       [contentId]: [...state.collection[contentId], payload],
    //     },
    //   }
    // }

    // case types.REMOVE_COMMENT_FULFILLED: {
    //   const { contentId, commentId } = action.meta

    //   return {
    //     ...state,
    //     toggle: new Date(),
    //     collection: {
    //       ...state.collection,
    //       [contentId]: state.collection[contentId].filter(
    //         comment => comment.id !== commentId
    //       ),
    //     },
    //   }
    // }

    default: {
      return state
    }
  }
}

export default reducer
