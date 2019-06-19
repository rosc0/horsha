import types from '@constants/actionTypes'
import TrailsClass from '@api/trails'
import { clearImages } from './gallery'

const Trails = new TrailsClass()
export const MAX_TRAIL_IMAGES = 9

export const getTrails = (accessToken, location) => ({
  type: types.GET_TRAILS,
  payload: Trails.getTrails(accessToken, location),
  meta: { type: 'discover' },
})

export const getUserTrails = (accessToken, userId) => ({
  type: types.GET_TRAILS,
  payload: Trails.getUserTrails(accessToken, userId),
  meta: { type: 'created' },
})

export const getUserFavoriteTrails = (accessToken, userId) => ({
  type: types.GET_TRAILS,
  payload: Trails.getUserFavoriteTrails(accessToken, userId),
  meta: { type: 'favorites' },
})

export const getUserFavoriteTrailsIds = (accessToken, userId) => ({
  type: types.GET_FAVORITE_TRAILS,
  payload: Trails.getUserFavoriteTrailsIds(accessToken, userId),
})

export const getTrailDetails = trailId => ({
  type: types.GET_TRAIL_DETAILS,
  payload: Trails.getTrailDetails(trailId),
})

export const getTrailPictures = (
  trailId,
  limit = MAX_TRAIL_IMAGES,
  screen = 'preview',
  filter = 'all_photos'
) => ({
  type: types.GET_TRAIL_PICTURES,
  payload: Trails.getTrailPictures(trailId, limit, filter),
  meta: {
    screen,
  },
})

export const getTrailReviews = trailId => ({
  type: types.GET_TRAIL_REVIEWS,
  payload: Trails.getTrailReviews(trailId),
})

export const getTrailPois = (trailId, maxItems, cursor) => ({
  type: types.GET_TRAIL_POIS,
  payload: Trails.getTrailPois(trailId, maxItems, cursor),
})

export const getTrailRides = trailId => ({
  type: types.GET_TRAIL_RIDES,
  payload: Trails.getTrailRides(trailId),
})

export const toggleTrailFavorite = (isLiked, trailId, likeId) => ({
  type: types.TOGGLE_TRAIL_FAVORITE,
  payload: Trails.toggleTrailFavorite(isLiked, trailId, likeId),
  meta: { trailId },
})

export const setTrailListType = payload => ({
  type: types.SET_TRAIL_LIST_TYPE,
  payload,
})

export const setTrailsFilter = payload => ({
  type: types.SET_TRAILS_FILTER,
  payload,
})

export const deleteTrailPicture = imageId => ({
  type: types.DELETE_TRAIL_PICTURE,
  payload: Trails.deleteTrailPicture(imageId),
  meta: {
    imageId,
  },
})

export const toggleSelectPicture = image => ({
  type: types.TRAIL_TOGGLE_SELECT_PICTURE,
  image,
})

export const addTrailImage = (trailId, image) => async dispatch => {
  await dispatch({
    type: types.ADD_TRAIL_IMAGE,
    payload: Trails.addTrailImage(trailId, image),
  })

  return Promise.all([dispatch(clearImages())])
}

export const createTrail = info => ({
  type: types.CREATE_TRAIL,
  payload: Trails.createTrail(info),
})

export const editTrail = payload => ({
  type: types.EDIT_TRAIL,
  payload: Trails.update(payload),
  meta: {
    trailId: payload.id,
    description: payload.description,
    title: payload.title,
  },
})

export const deleteTrail = trailId => ({
  type: types.DELETE_TRAIL,
  payload: Trails.deleteTrail(trailId),
  meta: { trailId },
})

export const createReview = (description, rating, id, trailId) => ({
  type: types.CREATE_REVIEW,
  payload: Trails.createReview(description, rating, id, trailId),
  meta: { id, rating },
})

export const editReview = (description, rating, id, trailId) => ({
  type: types.EDIT_REVIEW,
  payload: Trails.editReview(description, rating, id, trailId),
  meta: { id, rating, description, trailId },
})

export const deleteReview = (id, trailId) => ({
  type: types.DELETE_REVIEW,
  payload: Trails.deleteReview(id, trailId),
  meta: { id, trailId },
})

export const setTrailFilters = payload => ({
  type: types.SET_TRAIL_FILTERS,
  payload,
})
