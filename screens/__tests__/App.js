import 'react-native'
import React from 'react'
import OfflineWarning from '../app/OfflineWarning'
import { mount } from 'enzyme'
import configureStore from 'redux-mock-store'
import promiseMiddleware from 'redux-promise-middleware'
import thunk from 'redux-thunk'

import FormattedWrapper from '../../../test/FormattedWrapper'

const mockStore = configureStore([thunk, promiseMiddleware()])
const state = {
  app: {
    isDeviceConnected: false,
  },
}
let store = mockStore(state)

beforeEach(() => {
  // Resets store before each test
  store = mockStore(state)
})

function setup() {
  const props = {
    app: {
      isDeviceConnected: true,
    },
  }

  const enzymeWrapper = mount(
    <FormattedWrapper store={store}>
      <OfflineWarning {...props} />
    </FormattedWrapper>
  )

  return {
    props,
    enzymeWrapper,
  }
}

describe('components', () => {
  describe('OfflineWarning', () => {
    it('should render self and subcomponents', () => {
      const { enzymeWrapper } = setup()
      // expect(enzymeWrapper.find(View)).toBe(true)
      expect(enzymeWrapper).toMatchSnapshot()
      // expect(enzymeWrapper.find('h1').text()).toBe('todos')

      // const todoInputProps = enzymeWrapper.find('TodoTextInput').props()
      // expect(todoInputProps.newTodo).toBe(true)
      // expect(todoInputProps.placeholder).toEqual('What needs to be done?')
    })
  })
})
