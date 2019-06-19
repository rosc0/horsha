import reducer, { initialState as state } from '../gallery'
import types from '../../constants/actionTypes'

import image_input from '../../../test/api/inputs/image'

const expectResponses = {
  add: {
    images: [image_input.POST],
  },
  clear: {
    images: [],
  },
}

describe('Settings Reducer', () => {
  it('should return initial state', () => {
    expect(reducer()).toBe(state)
    expect(reducer()).toMatchSnapshot()
  })

  it('should GALLERY_ADD_IMAGES', () => {
    const act = reducer(state, {
      type: types.GALLERY_ADD_IMAGES,
      images: [image_input.POST],
    })

    expect(act).toEqual(expectResponses.add)
    expect(act).toMatchSnapshot()
  })

  it('should GALLERY_CLEAR_IMAGES', () => {
    const act = reducer(state, {
      type: types.GALLERY_CLEAR_IMAGES,
    })

    expect(act).toEqual(expectResponses.clear)
    expect(act).toMatchSnapshot()
  })
})
