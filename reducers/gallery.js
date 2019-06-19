import types from '@constants/actionTypes'

export const initialState = {
  images: [],
}

export default (state = initialState, action = {}) => {
  switch (action.type) {
    case types.GALLERY_ADD_IMAGES: {
      return {
        ...state,
        images: action.images,
      }
    }

    case types.GALLERY_CLEAR_IMAGES: {
      return {
        ...state,
        images: [],
      }
    }

    default: {
      return state
    }
  }
}
