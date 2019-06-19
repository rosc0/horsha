import { applyMiddleware, compose, createStore } from 'redux'
import thunk from 'redux-thunk'
import { autoRehydrate } from 'redux-persist'
// import { persistStore, autoRehydrate } from 'redux-persist'
import promiseMiddleware from 'redux-promise-middleware'
import { createLogger } from 'redux-logger'
import reduxReset from 'redux-reset'

import analytics from '@middlewares/segment'
import reducers from '@application/reducers'

const logger = createLogger()
const promise = promiseMiddleware()

const store = createStore(
  reducers,
  compose(
    applyMiddleware(thunk, promise, analytics, logger),
    autoRehydrate(),
    reduxReset({
      type: 'RESET',
      data: 'payload',
    })
  )
)

// eslint-disable-next-line no-undef
if (module.hot) {
  // eslint-disable-next-line no-undef
  module.hot.accept(() => {
    const nextRootReducer = require('./reducers/index').default
    store.replaceReducer(nextRootReducer)
  })
}

export default store
