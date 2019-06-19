import types from '@constants/actionTypes'
import RidesClass from '@api/rides'
import TrailsClass from '@api/trails'

const Rides = new RidesClass()
const Trails = new TrailsClass()
export const MAX_TRAIL_IMAGES = 9

export const getRidesByHorse = horseId => ({
  type: types.GET_RIDES,
  payload: Rides.getRidesByHorse(horseId),
})

export const getRideById = rideId => ({
  type: types.GET_RIDE_DETAILS,
  payload: Rides.getRideById(rideId),
})

export const getTrailsPassed = rideId => ({
  type: types.GET_TRAILS_PASSED,
  payload: Trails.getTrailsPassed(rideId),
})
