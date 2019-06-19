import friendInvitationsReducer, {
  initialState as state,
} from '../friendInvitations'
// import types from '../../constants/actionTypes'

// import { horse_picture, horse_friendInvitations } from '../../../test/api'

describe('Comments Reducer', () => {
  it('should return initial state', () => {
    expect(friendInvitationsReducer()).toBe(state)
    expect(friendInvitationsReducer()).toMatchSnapshot()
  })
})
