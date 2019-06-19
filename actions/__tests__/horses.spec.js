import configureStore from 'redux-mock-store'
import promiseMiddleware from 'redux-promise-middleware'
import thunk from 'redux-thunk'

import { initialState as horses } from '../../reducers/horses'
import { initialState as settings } from '../../reducers/settings'
import { initialState as user } from '../../reducers/user'

import { horse, horse_user } from '../../../test/api'
import * as actions from '../horses'
import horseInput from '../../../test/api/inputs/horse'

import types from '../../constants/actionTypes'

const mockStore = configureStore([thunk, promiseMiddleware()])

const state = { horses, settings, user }
let store = mockStore(state)

beforeEach(() => {
  // Resets store before each test
  store = mockStore(state)
})

describe('Horses Actions', () => {
  it('should get horses', async () => {
    await store.dispatch(actions.getHorses())

    const storeActions = store.getActions()

    const expectedActions = [
      {
        type: types.GET_HORSES_PENDING,
      },
      {
        type: types.GET_HORSES_FULFILLED,
        payload: horse_user.GET,
      },
    ]

    expect(storeActions).toEqual(expectedActions)
  })

  it('should add a horse', async () => {
    await store.dispatch(actions.addHorse(horseInput))

    const storeActions = store.getActions()

    const expectedActions = [
      {
        type: types.ADD_HORSE_PENDING,
      },
      {
        type: types.ADD_HORSE_FULFILLED,
        payload: horse.POST,
      },
      {
        type: types.GET_HORSES_PENDING,
      },
      {
        type: types.GET_HORSES_FULFILLED,
        payload: horse_user.GET,
      },
    ]

    expect(storeActions).toEqual(expectedActions)
  })
})
