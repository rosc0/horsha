import analytics from '@config/segment'

let lastType = ''
let canTrack = name => name.includes('FULFILLED')

const segmentMiddleware = store => next => action => {
  const { type } = action
  const { user } = store.getState().user

  if (type && type !== lastType && canTrack(type) && user.id) {
    lastType = action.type

    analytics.track({
      userId: user.id,
      event: action.type.replace('_FULFILLED', ''),
    })
  }

  next(action)
}

export default segmentMiddleware
