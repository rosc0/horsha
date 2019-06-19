import types from '@constants/actionTypes'

export const addImages = images => ({
  type: types.GALLERY_ADD_IMAGES,
  images,
})

export const clearImages = () => ({
  type: types.GALLERY_CLEAR_IMAGES,
})
