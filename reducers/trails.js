import types from '@constants/actionTypes'
import { assign, map, mapKeys } from 'lodash'

import { MAX_TRAIL_IMAGES } from '@actions/trails'

export const initialState = {
  fetched: false,
  fetching: false,
  error: false,
  forceUpdate: null,
  trailListType: 'discover',
  trailDetails: null,
  trailRides: [],
  pictures: {
    preview: {
      fetching: true,
      collection: [],
      remaining: 0,
      cursor: null,
    },
    album: {
      fetching: true,
      collection: [],
      remaining: 0,
      cursor: null,
    },
    upload: {
      isUploading: false,
    },
    selected: [],
  },
  trailReviews: [],
  trailPois: [],
  trailFavorites: [],
  myTrails: [],
  trails: [],
  trailsOriginal: [],
  trailCreated: {
    isUploading: false,
    uploaded: false,
    collection: [],
  },
  trailFilters: [], // set filters inside
}

const reducer = (state = initialState, action = {}) => {
  const { type, payload, meta } = action

  switch (type) {
    case types.GET_TRAILS_PENDING: {
      return {
        ...state,
        // trailListType: meta && meta.type ? meta.type : '',
        fetching: true,
        fetched: false,
        error: false,
      }
    }

    case types.GET_TRAILS_REJECTED: {
      return { ...state, error: true, fetched: false, fetching: false }
    }

    case types.GET_TRAILS_FULFILLED: {
      const stateData = state.trails
      const serverData = payload.collection
      let data = serverData

      if (stateData.length && meta && meta.type === 'discover') {
        data = map(
          assign(mapKeys(stateData, v => v.id), mapKeys(serverData, v => v.id))
        )
      }

      return {
        ...state,
        trails: data || [],
        trailsOriginal: serverData,
        fetched: true,
        error: false,
        fetching: false,
      }
    }

    case types.GET_TRAIL_DETAILS_FULFILLED: {
      return {
        ...state,
        trailDetails: payload,
      }
    }

    case types.GET_TRAIL_PICTURES_PENDING: {
      return {
        ...state,
        pictures: {
          ...state.pictures,
          [action.meta.screen]: {
            ...state.pictures[action.meta.screen],
            fetching: true,
          },
        },
      }
    }

    case types.GET_TRAIL_PICTURES_FULFILLED: {
      return {
        ...state,
        pictures: {
          ...state.pictures,
          [action.meta.screen]: {
            ...state.pictures[action.meta.screen],
            fetching: false,
            collection: payload.collection,
            remaining: payload.remaining,
            cursor: payload.cursor,
          },
        },
      }
    }

    case types.GET_TRAIL_REVIEWS_FULFILLED: {
      return { ...state, trailReviews: payload.collection }
    }

    case types.GET_TRAIL_POIS_FULFILLED: {
      return { ...state, trailPois: payload.collection }
    }

    case types.GET_TRAIL_RIDES_FULFILLED: {
      return { ...state, trailRides: payload.collection }
    }

    case types.GET_FAVORITE_TRAILS_FULFILLED: {
      return {
        ...state,
        trailFavorites: payload.collection.map(item => item.trail.id),
      }
    }

    case types.SET_TRAIL_LIST_TYPE: {
      return {
        ...state,
        trailListType: payload,
      }
    }

    case types.SET_TRAIL_FILTERS: {
      return {
        ...state,
        trailFilters: payload,
      }
    }

    case types.TOGGLE_TRAIL_FAVORITE_FULFILLED: {
      const toggle = collection =>
        map(collection, item => {
          if (item.id === meta.trailId) {
            item.trail_favorite_id = payload.status ? null : payload.id
          }

          return item
        })

      return {
        ...state,
        trails: toggle(state.trails),
        trailsOriginal: toggle(state.trailsOriginal),
        forceUpdate: new Date().getTime(),
      }
    }

    case types.DELETE_TRAIL_PICTURE_FULFILLED: {
      return {
        ...state,
        pictures: {
          ...state.pictures,
          collection: state.pictures.collection.filter(
            ({ picture }) => picture.id !== action.meta.imageId
          ),
        },
      }
    }

    case types.CREATE_REVIEW_FULFILLED: {
      if (!payload) return state

      const increase = trails =>
        map(trails, trail => {
          let item = trail

          if (item.id === meta.id) {
            const average = item.average_rating ? item.average_rating : 5

            item.average_rating = item.nr_of_reviews
              ? meta.rating
              : (average + meta.rating) / 2

            item.nr_of_ratings += 1
            item.nr_of_reviews += 1
          }

          return item
        })

      return {
        ...state,
        trailReviews: state.trailReviews.concat(payload),
        trailsOriginal: increase(state.trailsOriginal),
        forceUpdate: new Date().getTime(),
      }
    }

    case types.DELETE_REVIEW_FULFILLED: {
      const { trailId } = meta

      const trailReviews = state.trailReviews.filter(
        review => review.id !== meta.id
      )

      const updateRating = trails =>
        map(trails, trail => {
          let item = trail

          if (item.id === trailId) {
            item.average_rating =
              trailReviews.reduce(
                (acc, review) => acc + (review.rating ? review.rating : 0),
                0
              ) / trailReviews.length

            item.nr_of_ratings -= 1
            item.nr_of_reviews -= 1
          }

          return item
        })

      return {
        ...state,
        trailReviews,
        trailsOriginal: updateRating(state.trailsOriginal),
        forceUpdate: new Date().getTime(),
      }
    }

    case types.EDIT_REVIEW_FULFILLED: {
      const { id, rating, description, trailId } = meta

      const updateComment = state =>
        state.map(review => {
          if (review.id === id) {
            review.body = description
            review.rating = rating
          }

          return review
        })

      const trailReviews = updateComment(state.trailReviews)

      const updateRating = trails =>
        map(trails, trail => {
          let item = trail

          if (item.id === trailId) {
            item.average_rating =
              trailReviews.reduce(
                (acc, review) => acc + (review.rating ? review.rating : 0),
                0
              ) / trailReviews.length
          }

          return item
        })

      return {
        ...state,
        trailReviews,
        trailsOriginal: updateRating(state.trailsOriginal),
        forceUpdate: new Date().getTime(),
      }
    }

    case types.TRAIL_TOGGLE_SELECT_PICTURE: {
      const { image } = action

      const isPictureselected =
        state.pictures.selected.findIndex(({ id }) => id === image.id) !== -1

      return {
        ...state,
        pictures: {
          ...state.pictures,
          selected: isPictureselected
            ? state.pictures.selected.filter(({ id }) => id !== image.id)
            : [...state.pictures.selected, image],
        },
      }
    }

    case types.ADD_TRAIL_IMAGE_PENDING: {
      return {
        ...state,
        pictures: {
          ...state.pictures,
          upload: {
            ...state.pictures.upload,
            isUploading: true,
          },
        },
      }
    }

    case types.ADD_TRAIL_IMAGE_FULFILLED: {
      const previewPictures =
        state.pictures.preview.collection &&
        state.pictures.preview.collection.length === MAX_TRAIL_IMAGES
          ? [
              payload,
              ...state.pictures.preview.collection.slice(
                0,
                state.pictures.preview.collection.length - 1
              ),
            ]
          : [payload, ...state.pictures.preview.collection]

      return {
        ...state,
        pictures: {
          ...state.pictures,
          preview: {
            ...state.pictures.preview,
            collection: previewPictures,
          },
          album: {
            ...state.pictures.album,
            collection: [payload, ...state.pictures.album.collection],
          },
          upload: {
            ...state.pictures.upload,
            isUploading: false,
          },
        },
      }
    }

    case types.CREATE_TRAIL_PENDING: {
      return {
        ...state,
        trailCreated: {
          isUploading: true,
          uploaded: false,
        },
      }
    }

    case types.CREATE_TRAIL_FULFILLED: {
      if (!payload) {
        return {
          ...state,
          trailCreated: {
            isUploading: false,
            uploaded: false,
          },
        }
      }

      return {
        ...state,
        trailCreated: {
          isUploading: false,
          uploaded: true,
          collection: payload,
        },
      }
    }

    case types.EDIT_TRAIL_FULFILLED: {
      const { title, description, trailId } = meta

      const updateTrail = trails =>
        map(trails, trail => {
          let item = trail

          if (item.id === trailId) {
            item.title = title
            item.description = description
          }

          return item
        })

      return {
        ...state,
        trailsOriginal: updateTrail(state.trailsOriginal),
        forceUpdate: new Date().getTime(),
      }
    }

    case types.DELETE_TRAIL_FULFILLED: {
      const trailsOriginal = state.trailsOriginal.filter(
        trail => trail.id !== meta.trailId
      )

      return {
        ...state,
        trailsOriginal,
        forceUpdate: new Date().getTime(),
      }
    }

    case types.EDIT_POI_FULFILLED: {
      const { payload } = meta

      const update = collection =>
        map(collection, point => {
          let item = point

          if (item.poi.id === payload.id) {
            item.poi.type = payload.type
            item.poi.description = payload.description
            item.poi.location = {
              latitude: payload.latitude,
              longitude: payload.longitude,
            }
          }

          return item
        })

      return {
        ...state,
        trailPois: update(state.trailPois),
      }
    }

    case types.DELETE_POI_FULFILLED: {
      return {
        ...state,
        trailPois: state.trailPois.filter(point => point.poi.id !== meta.id),
      }
    }

    default: {
      return state
    }
  }
}

export default reducer
