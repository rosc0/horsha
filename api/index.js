import config from 'react-native-config'
import { build, serialize, emptyToNull } from '@application/utils'
import store from '@application/store'
import TimerMixin from 'react-timer-mixin'
import { setAlertStatus } from '../actions/app'
// import { logoutCurrentUser } from '../actions'
import * as k from '@constants/storageKeys'
import { AsyncStorage } from 'react-native'
// import Authentication from '@api/auth'

const title = 'There’s been a server error'
const subTitle = 'Something’s wrong, please try again later'

// const Auth = new Authentication()

class API {
  constructor(props) {
    this._config = new WeakMap()
    this._endpoint = new WeakMap()
    this._hasBaseURL = false

    if (!props || !props.isAuth) this._setup()
  }

  _setup() {
    const headers = {
      'Content-Type': 'application/json',
    }

    this._config.set(this, { headers })
  }

  setAuthConfig() {
    const headers = {
      'Content-Type': 'application/x-www-form-urlencoded',
    }

    this._config.set(this, { headers })
    return this
  }

  setContentType(contentType) {
    if (contentType) {
      const headers = {
        'Content-Type': contentType,
      }

      this._config.set(this, { headers })
    }
    return this
  }

  _setMethod(method) {
    const config = this._config.get(this) || {}
    config.method = method

    this._config.set(this, config)
  }

  setEndpoint(endpoint, hasBaseURL = false) {
    this._endpoint.set(this, endpoint)

    this._hasBaseURL = hasBaseURL
    return this
  }

  getEndpointPath() {
    return this._endpoint.get(this)
  }

  getEndpoint() {
    if (this._hasBaseURL) {
      return this._endpoint.get(this)
    }

    return config.API_BASE + this._endpoint.get(this)
  }

  getHeaders = () => {
    const state = store.getState()

    const {
      auth: { auth },
      user: { user },
    } = state

    return {
      access_token: auth.accessToken,
      user_id: user.id,
    }
  }

  setBody(body, isJSON) {
    const config = this._config.get(this) || {}

    config.body = isJSON
      ? JSON.stringify(emptyToNull(body))
      : serialize(emptyToNull(body))

    this._config.set(this, config)

    return this
  }

  getConfig() {
    let _config = this._config.get(this)

    const isAuth =
      _config.headers['Content-Type'] === 'application/x-www-form-urlencoded'

    if (isAuth) {
      let isClientIdDuplicated = false

      if (_config.body && !_config.body._parts) {
        isClientIdDuplicated = _config.body.indexOf('client_id') > -1
      }

      if (
        _config.method !== 'GET' &&
        isAuth &&
        !isClientIdDuplicated &&
        !_config.body._parts
      ) {
        _config.body += '&client_id=' + config.CLIENT_ID
      }
    }

    return this._config.get(this)
  }

  _makeRequest() {
    return new Promise((resolve, reject) => {
      let config = this.getConfig()
      let endpoint = this.getEndpoint()

      if (config.method === 'GET') {
        delete config.body
      }

      fetch(endpoint, config)
        .then(response => {
          TimerMixin.setTimeout(() => null, 0)

          if (response.status === 500) {
            // to handler if API return is not valid
            console.warn('throw Error', response)
            store.dispatch(setAlertStatus('error', title, subTitle))
            throw Error(response.statusText)
          }

          if (response.status === 403) {
            console.warn('logged out', response)
            if (
              response._bodyInit !==
              '{"status":403,"description":"User not allowed to allowed to see pictures for horse"}'
            ) {
              AsyncStorage.removeItem(k.AUTH_NEW_TOKENS)

              return store.dispatch({
                type: 'RESET',
                payload: {
                  app: store.getState().app,
                },
              })
            }
            // return response
            AsyncStorage.removeItem(k.AUTH_NEW_TOKENS)

            return store.dispatch({
              type: 'RESET',
              payload: {
                app: store.getState().app,
              },
            })
          }

          if (response.status === 401) {
            if (
              response._bodyInit === '{"code":401,"error":"Invalid token"} '
            ) {
              // ugly workaround
              AsyncStorage.removeItem(k.AUTH_NEW_TOKENS)
              return store.dispatch({
                type: 'RESET',
                payload: {
                  app: store.getState().app,
                },
              })
            }

            return response
          }

          if (response.status === 422) {
            if (
              response._bodyInit === '{"code":422,"text":"Missing user_id"}' ||
              response._bodyInit ===
                '{"status":422,"description":"Invalid UUID string: null"}'
            ) {
              // ugly workaround
              AsyncStorage.removeItem(k.AUTH_NEW_TOKENS)
              return store.dispatch({
                type: 'RESET',
                payload: {
                  app: store.getState().app,
                },
              })
            }

            return response
          }

          if (response.status < 200 || response.status > 299) {
            // to handler if API return is not valid
            console.warn('throw Error', response)
            store.dispatch(setAlertStatus('error', title, subTitle))
            throw Error('Error')
          }

          if (response.status === 204) {
            return response
          }

          const isResponseJSON =
            response.headers.get('content-type') &&
            response.headers.get('content-type').indexOf('application/json') !==
              -1

          return (response.status === 200 || response.status === 201) &&
            isResponseJSON
            ? response.json()
            : response
        })
        .then(res => {
          resolve(res)
        })
        .catch(err => {
          reject(err)
        })

      this._setup()
    })
  }

  addToken(type) {
    const { auth } = store.getState().auth
    const { accessToken: token, expireDate: expires } = auth

    const method =
      type === 'qs'
        ? this.addQueryStringToken.bind(this)
        : this.addJSONToken.bind(this)

    if (token && expires > +new Date()) {
      method(token)
    }
  }

  addQueryStringToken(token) {
    const body = this.getEndpointPath()
    const endpoint = build('get', { body, token })

    this.setEndpoint(endpoint)
  }

  addJSONToken(token) {
    const { body } = this.getConfig()
    const data = build('post', { body, token })

    this._config.set(this, { body: data })
  }

  get(hasToken) {
    if (hasToken) this.addToken('qs')

    this._setMethod('GET')
    this.setBody(null)
    return this._makeRequest()
  }

  post(hasToken) {
    if (hasToken) this.addToken('json')

    this._setMethod('POST')
    return this._makeRequest()
  }

  put(hasToken) {
    if (hasToken) this.addToken('json')

    this._setMethod('PUT')
    return this._makeRequest()
  }

  delete(hasToken, type = 'qs') {
    if (hasToken) this.addToken(type)

    this._setMethod('DELETE')
    return this._makeRequest()
  }
}

export default API
