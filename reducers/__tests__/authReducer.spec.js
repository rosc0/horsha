import authReducer, { initialState as state } from '../auth'
// import types from '../../constants/actionTypes'

// import { horse_picture, horse_auth } from '../../../test/api'

describe('Auth Reducer', () => {
  it('should return initial state', () => {
    expect(authReducer()).toBe(state)
    expect(authReducer()).toMatchSnapshot()
  })
})
