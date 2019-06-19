import types from '@constants/actionTypes'
import RidesClass from '@api/rides'
import TrailsClass from '@api/trails'

const Rides = new RidesClass()
const Trails = new TrailsClass()

export const setFocusUserLocation = shouldFocusUserLocation => ({
  type: types.SET_FOCUS_USER_LOCATION,
  shouldFocusUserLocation,
})

export const setCurrentLocation = location => ({
  type: types.SET_CURRENT_LOCATION,
  location,
})

export const startRecording = () => ({
  type: types.START_RECORDING,
})

export const addRecordLocation = location => ({
  type: types.ADD_RECORD_LOCATION,
  location,
})

export const pauseRecording = () => ({
  type: types.PAUSE_RECORDING,
})

export const resumeRecording = () => ({
  type: types.RESUME_RECORDING,
})

export const saveRide = () => async dispatch => {
  const { value: ride } = await dispatch({
    type: types.SAVE_RECORDING,
    payload: Rides.saveRide(),
  })

  if (ride.id) {
    await dispatch(clearRecording())
  }

  return ride
}

export const clearRecording = () => ({
  type: types.CLEAR_RECORDING,
})

export const getTrailDetails = trailId => ({
  type: types.GET_TRAIL_DETAILS,
  payload: Trails.getTrailDetails(trailId),
})

export const followTrail = trailId => async dispatch => {
  const trail = await dispatch({
    type: types.RECORDING_FOLLOW_TRAIL,
    payload: Trails.getTrailDetails(trailId),
  })

  return trail
}

export const stopFollowingTrail = () => ({
  type: types.STOP_FOLLOWING_TRAIL,
})

export const setShouldFollowTrail = ({
  shouldFollowTrail = true,
  shouldFollowTrailShowTrailList = false,
} = {}) => ({
  type: types.RECORDING_SHOULD_FOLLOW_TRAIL,
  payload: {
    shouldFollowTrail,
    shouldFollowTrailShowTrailList,
  },
})
