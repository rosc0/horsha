import reducer, { initialState as state } from '../app'
import types from '../../constants/actionTypes'

const expectResponses = {
  alert: {
    error: 'Test message',
    isDeviceConnected: null,
    isError: true,
  },
}

describe('App Reducer', () => {
  it('should return initial state', () => {
    expect(reducer()).toBe(state)
    expect(reducer()).toMatchSnapshot()
  })

  it('should SET_CONNECTION_STATUS', () => {
    expect(
      reducer(state, {
        type: types.SET_CONNECTION_STATUS,
        payload: true,
      })
    ).toMatchSnapshot()
  })

  it('should SET_ALERT_STATUS', () => {
    const act = reducer(state, {
      type: types.SET_ALERT_STATUS,
      config: 'Test message',
    })

    expect(act).toEqual(expectResponses.alert)
    expect(act).toMatchSnapshot()
  })

  it('should CLEAN_ALERT_STATUS', () => {
    expect(
      reducer(state, {
        type: types.CLEAN_ALERT_STATUS,
        payload: true,
      })
    ).toMatchSnapshot()
  })
})
