import geolib from 'geolib'
import moment from 'moment'
import { REHYDRATE } from 'redux-persist/constants'
import types from '@constants/actionTypes'
import idx from 'idx'

export const initialState = {
  fetching: true,
  isRecording: false,
  isPaused: false,
  isSaving: false,
  startedAt: null,
  stoppedAt: null,
  pausedAt: null,
  pauseDuration: 0,
  pausedLocation: {
    latitude: 0,
    longitude: 0,
  },
  totalDuration: 0,
  averageSpeed: 0,
  totalSpeed: 0,
  quantityOfCoordinates: 0,
  currentLocation: {
    latitude: 0,
    longitude: 0,
    altitude: 0,
  },
  locations: [],
  shouldFocusUserLocation: true,
  totalDistance: 0,
  totalPausedDistance: 0,
  horse: {
    id: null,
    name: '',
    image: null,
    relationType: '',
  },
  shouldFollowTrail: false,
  shouldFollowTrailShowTrailList: false,
  trail: {
    id: null,
    title: '',
    coordinates: [],
  },
}

const recordReducer = (state = initialState, action = {}) => {
  switch (action.type) {
    case REHYDRATE: {
      const { record } = action.payload
      return {
        ...state,
        ...record,
        trail: initialState.trail,
      }
    }

    case types.SET_FOCUS_USER_LOCATION: {
      return {
        ...state,
        shouldFocusUserLocation: action.shouldFocusUserLocation,
      }
    }

    case types.SET_CURRENT_LOCATION: {
      const { latitude, longitude, altitude } = action.location

      return {
        ...state,
        fetching: false,
        currentLocation: {
          latitude,
          longitude,
          altitude,
        },
      }
    }

    case types.START_RECORDING: {
      const { latitude, longitude, altitude } = state.currentLocation

      return {
        ...state,
        isRecording: true,
        startedAt: new Date(),
        locations: [
          {
            createdAt: new Date(),
            coordinates: [
              {
                latitude,
                longitude,
                altitude,
                speed: 0,
                distancePassed: 0,
                ms: 0,
              },
            ],
          },
        ],
      }
    }

    case types.ADD_RECORD_LOCATION: {
      const { startedAt, totalDistance, isPaused, locations } = state
      const { latitude, longitude, altitude } = action.location

      if (isPaused) {
        return {
          ...state,
        }
      }

      const speed = action.location.speed > 0 ? action.location.speed : 0

      let distance = 0
      let lastLocation = locations.length > 0 && locations[locations.length - 1]

      if (idx(lastLocation, _ => _.coordinates.length) > 0) {
        const locationLastCoordinate =
          lastLocation.coordinates[lastLocation.coordinates.length - 1]

        distance = geolib.getDistance(
          {
            latitude: locationLastCoordinate.latitude,
            longitude: locationLastCoordinate.longitude,
          },
          {
            latitude,
            longitude,
          }
        )

        lastLocation.coordinates = [
          ...lastLocation.coordinates,
          {
            latitude,
            longitude,
            distancePassed: totalDistance + distance,
            speed,
            ms: parseInt(
              moment
                .utc(moment().diff(moment(lastLocation.createdAt)))
                .format('x'),
              10
            ),
            altitude,
          },
        ]
      }

      if (idx(lastLocation, _ => _.coordinates.length) === 0) {
        lastLocation.coordinates = [
          {
            latitude,
            longitude,
            distancePassed: totalDistance + distance,
            speed,
            ms: parseInt(
              moment
                .utc(moment().diff(moment(lastLocation.createdAt)))
                .format('x'),
              10
            ),
            altitude,
          },
        ]
      }

      const totalSpeed = state.totalSpeed + speed
      const quantityOfCoordinates = state.quantityOfCoordinates + 1
      const averageSpeed = (totalSpeed / quantityOfCoordinates).toFixed(2)

      return {
        ...state,
        startedAt,
        currentLocation: {
          latitude,
          longitude,
          altitude,
        },
        locations,
        totalSpeed,
        averageSpeed,
        totalDistance: totalDistance + distance,
        quantityOfCoordinates,
      }
    }

    case types.PAUSE_RECORDING: {
      const pausedAt = new Date()

      return {
        ...state,
        isPaused: true,
        pausedLocation: state.currentLocation,
        pausedAt,
      }
    }

    case types.RESUME_RECORDING: {
      const createdAt = new Date()
      const { latitude, longitude, altitude } = state.currentLocation

      return {
        ...state,
        isPaused: false,
        pausedAt: null,
        pauseDuration:
          state.pauseDuration +
          moment.duration(
            moment(new Date()).diff(moment(state.pausedAt)),
            'milliseconds'
          ),
        totalDistance: state.totalDistance + state.totalPausedDistance,
        totalPausedDistance: 0,
        pausedLocation: initialState.pausedLocation,
        locations: [
          ...state.locations,
          {
            createdAt,
            coordinates: [
              {
                latitude,
                longitude,
                altitude,
                speed: 0,
                distancePassed: 0,
                ms: 0,
              },
            ],
          },
        ],
      }
    }

    case types.STOP_RECORDING: {
      return {
        ...state,
        isRecording: false,
        stoppedAt: new Date(),
      }
    }

    case types.SAVE_RECORDING: {
      return {
        ...state,
        isSaving: true,
      }
    }

    case types.CLEAR_RECORDING: {
      return {
        ...initialState,
        locations: [],
        trail: {
          id: state.trail.id,
          title: state.trail.title,
          coordinates: state.trail.coordinates,
        },
        fetching: false,
        currentLocation: state.currentLocation,
      }
    }

    case types.RECORDING_FOLLOW_TRAIL_FULFILLED: {
      const { id, title, fullWaypointsUrl, boundingBox } = action.payload
      return {
        ...state,
        shouldFollowTrail: false,
        trail: {
          id,
          title,
          fullWaypointsUrl,
          boundingBox,
        },
      }
    }

    case types.STOP_FOLLOWING_TRAIL: {
      return {
        ...state,
        shouldFollowTrail: false,
        trail: initialState.trail,
      }
    }

    case types.RECORDING_SHOULD_FOLLOW_TRAIL: {
      return {
        ...state,
        shouldFollowTrail: action.payload.shouldFollowTrail,
        shouldFollowTrailShowTrailList:
          action.payload.shouldFollowTrailShowTrailList,
      }
    }

    default: {
      return state
    }
  }
}

export default recordReducer
