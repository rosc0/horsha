import horsesReducer, {
  ADD_HORSE_STEPS,
  initialState as state,
} from '../horses'
import types from '../../constants/actionTypes'

import { horse_picture, horse_user } from '../../../test/api'

describe('Horses Reducer', () => {
  it('should return initial state', () => {
    expect(horsesReducer()).toBe(state)
    expect(horsesReducer()).toMatchSnapshot()
  })

  it('should get horses', () => {
    expect(
      horsesReducer(state, {
        type: types.GET_HORSES_FULFILLED,
        payload: horse_user.GET,
      })
    ).toMatchSnapshot()
  })

  it('should go to previous step', () => {
    expect(
      horsesReducer(
        {
          ...state,
          addHorse: {
            ...state.addHorse,
            step: ADD_HORSE_STEPS.DESCRIPTION,
          },
        },
        {
          type: types.SET_PREVIOUS_STEP,
        }
      )
    ).toMatchSnapshot()
  })

  it('should go to next step', () => {
    expect(
      horsesReducer(
        {
          ...state,
          addHorse: {
            ...state.addHorse,
            step: ADD_HORSE_STEPS.DESCRIPTION,
          },
        },
        {
          type: types.SET_PREVIOUS_STEP,
        }
      )
    ).toMatchSnapshot()
  })

  it('should get horse album', () => {
    expect(
      horsesReducer(state, {
        type: types.GET_HORSE_ALBUM_FULFILLED,
        payload: horse_picture.GET,
      })
    ).toMatchSnapshot()
  })

  it('should get horse user', () => {
    expect(
      horsesReducer(state, {
        type: types.GET_HORSE_USER_FULFILLED,
        payload: horse_user.GET,
      })
    ).toMatchSnapshot()
  })
})
