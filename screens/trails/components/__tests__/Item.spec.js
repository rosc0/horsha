import React from 'react'
import 'react-native'
import { mount } from 'enzyme'
import FormattedWrapper from '../../../../../test/FormattedWrapper'

import { trail } from '../../../../../test/api'
import Item from '../Item'

import configureStore from 'redux-mock-store'
import promiseMiddleware from 'redux-promise-middleware'
import thunk from 'redux-thunk'

const mockStore = configureStore([thunk, promiseMiddleware()])
let store = mockStore({
  user: {
    user: {
      preferences: {
        unit_system: 'metrics',
      },
    },
  },
})

beforeEach(() => {
  // Resets store before each test
  store = mockStore({
    user: {
      user: {
        preferences: {
          unit_system: 'metrics',
        },
      },
    },
  })
})

describe('<Item>', () => {
  it('renders withpout explode', () => {
    const inst = mount(
      <FormattedWrapper store={store}>
        <Item
          trail={trail.SINGLE_TRAIL_MOCK}
          onPressSeeDetails={jest.fn()}
          onPress={jest.fn()}
          index={1}
          toggleFavorite={jest.fn()}
          onPressFollowTrail={jest.fn()}
        />
      </FormattedWrapper>
    )

    expect(inst).toMatchSnapshot()
  })
})
