import React from 'react'
import { shallow } from 'enzyme'
import configureStore from 'redux-mock-store'
import promiseMiddleware from 'redux-promise-middleware'
import thunk from 'redux-thunk'

import horsesReducers, { initialState as horses } from '@reducers/horses'

import { horse_user } from '@test/api'
import types from '@constants/actionTypes'
import HorsesList from '../HorsesList'

import { current_user } from '../../../../test/api'

const mockStore = configureStore([thunk, promiseMiddleware()])
const state = { horses: {}, user: current_user.GET }
let store = mockStore(state)
console.log('state', state)
beforeEach(() => {
  // Resets store before each test
  store = mockStore(state)
})

const setupComponent = () => shallow(<HorsesList />, { context: { store } })

describe('<HorsesList />', () => {
  it('renders loading', () => {
    const component = setupComponent()
    expect(component.dive()).toMatchSnapshot()
  })

  it('renders without exploding', async () => {
    const horses = horsesReducers(state.horses, {
      type: types.GET_HORSES_FULFILLED,
      payload: horse_user.GET,
    })

    store = mockStore({
      horses: {
        ...horses,
        horse: horses[0],
      },
    })

    const component = setupComponent()
    expect(component.dive()).toMatchSnapshot()
  })
})
