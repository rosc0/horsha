import reducer, { initialState as state } from '../settings'
import types from '../../constants/actionTypes'

const expectResponses = {
  status: {
    language: 'en',
    pushNotificationsEnabled: false,
    statusBarHidden: undefined,
  },
  push: {
    language: 'en',
    pushNotificationsEnabled: true,
    statusBarHidden: false,
  },
  language: {
    language: 'pt-br',
    pushNotificationsEnabled: false,
    statusBarHidden: false,
  },
}

describe('Settings Reducer', () => {
  it('should return initial state', () => {
    expect(reducer()).toBe(state)
    expect(reducer()).toMatchSnapshot()
  })

  it('should CHANGE_LANGUAGE', () => {
    const act = reducer(state, {
      type: types.CHANGE_LANGUAGE,
      payload: 'pt-br',
    })

    expect(act).toEqual(expectResponses.language)
    expect(act).toMatchSnapshot()
  })

  it('should TOGGLE_STATUS_BAR', () => {
    const act = reducer(state, {
      type: types.TOGGLE_STATUS_BAR,
    })

    expect(act).toEqual(expectResponses.status)
    expect(act).toMatchSnapshot()
  })

  it('should SETTINGS_ENABLE_PUSH_NOTIFICATIONS', () => {
    const act = reducer(state, {
      type: types.SETTINGS_ENABLE_PUSH_NOTIFICATIONS,
    })

    expect(act).toEqual(expectResponses.push)
    expect(act).toMatchSnapshot()
  })
})
