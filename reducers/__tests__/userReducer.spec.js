import userReducer, { initialState as state } from '../user'
import types from '../../constants/actionTypes'

import { current_user } from '../../../test/api'

describe('User Reducer', () => {
  it('should return initial state', () => {
    expect(userReducer()).toBe(state)
    expect(userReducer()).toMatchSnapshot()
  })

  it('should get current user', () => {
    expect(
      userReducer(state, {
        type: types.CURRENT_USER_FULFILLED,
        payload: current_user.GET,
      })
    ).toMatchSnapshot()
  })
})
