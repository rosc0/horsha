import types from '@constants/actionTypes'
import map from 'lodash/map'

export const initialState = {
  fetched: false,
  fetching: false,
  error: false,
  collection: [],
  remaining: 0,
  cursor: null,
  toggle: null,
  album: {
    fetching: true,
    pictures: [],
  },
  forceUpdate: null,
}

Array.prototype.unique = function() {
  let a = this.concat()
  for (let i = 0; i < a.length; ++i) {
    for (let j = i + 1; j < a.length; ++j) {
      if (a[i].id === a[j].id) {
        a.splice(j--, 1)
      }
    }
  }

  return a
}

const toggleComments = (collection, contentId, contentType, isAdding = false) =>
  map(collection, item => {
    const content = item.subject[contentType]

    if (content && content.id === contentId) {
      if (isAdding) {
        item.subject[contentType].nr_of_comments = content.nr_of_comments + 1
      } else {
        item.subject[contentType].nr_of_comments = content.nr_of_comments - 1
      }
    }

    return item
  })

const reducer = (state = initialState, action = {}) => {
  const { type, payload, meta } = action

  switch (type) {
    case types.GET_UPDATES_PENDING: {
      return { ...state, fetching: true, fetched: false, error: false }
    }

    case types.GET_UPDATES_REJECTED: {
      return { ...state, error: true, fetched: true, fetching: false }
    }

    case types.GET_UPDATES_FULFILLED: {
      const { collection, remaining, after } = payload

      if (!payload || !collection) {
        return { ...state, error: true, fetched: true, fetching: false }
      } else {
        return {
          ...state,
          fetching: false,
          error: false,
          fetched: true,
          collection,
          remaining,
          cursor: after,
        }
      }
    }

    case types.GET_MORE_UPDATES_FULFILLED: {
      const { collection, remaining, after } = payload
      if (payload && collection) {
        return {
          ...state,
          collection: state.collection.concat(collection).unique(),
          remaining,
          cursor: after,
        }
      }

      return state
    }

    case types.GET_UPDATE_PENDING: {
      return {
        ...state,
        album: {
          ...state.album,
          fetching: true,
        },
      }
    }

    case types.GET_UPDATE_FULFILLED: {
      return {
        ...state,
        album: {
          ...state.album,
          fetching: false,
          pictures: payload.content.horse_pictures.map(picture => ({
            id: picture.id,
            uri: picture.picture.url,
            width: picture.picture.width,
            height: picture.picture.height,
          })),
        },
      }
    }

    case types.DELETE_UPDATE_FULFILLED: {
      return {
        ...state,
        collection: state.collection.filter(update => {
          if (update.type === 'journal_entry_created') {
            return update.subject.journal_entry.id !== meta.id
          }

          return true
        }),
        forceUpdate: new Date().getTime(),
      }
    }

    case types.REFRESH_UPDATES_FULFILLED: {
      const { collection, remaining, cursor } = payload

      if (payload && !collection) return state

      return {
        ...state,
        collection,
        remaining,
        cursor,
      }
    }

    case types.TOGGLE_LIKE_FULFILLED: {
      // 200 = like
      // 204 = dislike
      const newState = map(state.collection, item => {
        const content = item.subject[meta.contentType]

        if (content && content.id === meta.contentId) {
          if (payload.id) {
            item.subject[meta.contentType].like_id = payload.id
            item.subject[meta.contentType].nr_of_likes = content.nr_of_likes + 1
          } else if (payload.status === 204) {
            item.subject[meta.contentType].like_id = null
            item.subject[meta.contentType].nr_of_likes = content.nr_of_likes - 1
          }
        }

        return item
      })

      return {
        ...state,
        toggle: new Date().getTime(),
        collection: newState,
      }
    }

    // case types.REMOVE_COMMENT_FULFILLED: {
    //   return {
    //     ...state,
    //     toggle: new Date().getTime(),
    //     collection: toggleComments(
    //       state.collection,
    //       meta.contentId,
    //       meta.contentType
    //     ),
    //   }
    // }

    // case types.ADD_COMMENT_FULFILLED: {
    //   return {
    //     ...state,
    //     toggle: new Date().getTime(),
    //     collection: toggleComments(
    //       state.collection,
    //       meta.contentId,
    //       meta.contentType,
    //       true
    //     ),
    //   }
    // }

    default: {
      return state
    }
  }
}

export default reducer
