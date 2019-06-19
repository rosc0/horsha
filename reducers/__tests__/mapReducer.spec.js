import reducer, { initialState as state } from '../map'
import types from '../../constants/actionTypes'

const expectResponses = {
  setBB: {
    boundBox: {
      bb_bottom_left_latitude: 52.26929249090053,
      bb_bottom_left_longitude: 4.846113294808747,
      bb_top_right_latitude: 52.457532490900526,
      bb_top_right_longitude: 4.940233294808747,
    },
    region: {
      latitude: 0,
      latitudeDelta: 0,
      longitude: 0,
      longitudeDelta: 0,
    },
    source: null,
  },
  setLL: {
    boundBox: {
      bb_bottom_left_latitude: 52.26929249090053,
      bb_bottom_left_longitude: 4.866715273819242,
      bb_top_right_latitude: 52.457532490900526,
      bb_top_right_longitude: 4.919631315798252,
    },
    region: {
      latitude: 52.36341249090053,
      longitude: 4.893173294808747,
    },
    source: undefined,
  },
  clear: {
    boundBox: {
      bb_bottom_left_latitude: 0,
      bb_bottom_left_longitude: 0,
      bb_top_right_latitude: 0,
      bb_top_right_longitude: 0,
    },
    region: {
      latitude: 0,
      latitudeDelta: 0,
      longitude: 0,
      longitudeDelta: 0,
    },
    source: null,
  },
}

describe('Settings Reducer', () => {
  it('should return initial state', () => {
    expect(reducer()).toBe(state)
    expect(reducer()).toMatchSnapshot()
  })

  it('should SET_BOUND_BOX', () => {
    const act = reducer(state, {
      type: types.SET_BOUND_BOX,
      payload: {
        bb_bottom_left_latitude: 52.26929249090053,
        bb_bottom_left_longitude: 4.846113294808747,
        bb_top_right_latitude: 52.457532490900526,
        bb_top_right_longitude: 4.940233294808747,
      },
    })

    expect(act).toEqual(expectResponses.setBB)
    expect(act).toMatchSnapshot()
  })

  it('should SET_LATITUDE_LONGITUDE', () => {
    const act = reducer(state, {
      type: types.SET_LATITUDE_LONGITUDE,
      payload: {
        latitude: 52.36341249090053,
        longitude: 4.893173294808747,
      },
    })

    expect(act).toEqual(expectResponses.setLL)
    expect(act).toMatchSnapshot()
  })

  it('should RESET_SOURCE', () => {
    const act = reducer(state, {
      type: types.RESET_SOURCE,
    })

    expect(act).toEqual(expectResponses.clear)
    expect(act).toMatchSnapshot()
  })
})
