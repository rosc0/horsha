import reducer, { initialState as state } from '../friends'
// import types from '../../constants/actionTypes'

// import { horse_picture, horse_friends } from '../../../test/api'

describe('Comments Reducer', () => {
  it('should return initial state', () => {
    expect(reducer()).toBe(state)
    expect(reducer()).toMatchSnapshot()
  })
})
