import reducer, { initialState as state } from '../comments'
// import types from '../../constants/actionTypes'

// import { horse_picture, horse_comments } from '../../../test/api'

describe('Comments Reducer', () => {
  it('should return initial state', () => {
    expect(reducer()).toBe(state)
    expect(reducer()).toMatchSnapshot()
  })
})
