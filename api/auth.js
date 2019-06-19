import { AsyncStorage } from 'react-native'
import * as k from '@constants/storageKeys'
import API from './index'
import * as endpoints from './endpoints'
import { USER_CHANGE_PASSWORD } from '../apollo/mutations/UserCollection'
import { client } from '../apollo/init'

class Authentication extends API {
  constructor({ isAuth = true } = {}) {
    super({ isAuth })
  }

  authenticate(credentials) {
    return new Promise((resolve, reject) => {
      this.setAuthConfig()
        .setEndpoint(endpoints.TOKEN)
        .setBody(credentials)
        .post()
        .then(response =>
          response.access_token ? this.storeToken(response) : response
        )
        .then(resolve)
        .catch(error => {
          this.handleError(error)
          reject()
        })
    })
  }

  refreshToken(refresh_token) {
    const body = {
      grant_type: 'refresh_token',
      refresh_token,
    }

    return new Promise((resolve, reject) => {
      this.setAuthConfig()
        .setEndpoint(endpoints.TOKEN)
        .setBody(body)
        .post()
        .then(this.storeToken)
        .then(resolve)
        .catch(error => {
          this.handleError(error)
          reject()
        })
    })
  }

  async isUserAuthenticated() {
    const authTokenData = await this.getToken()
    if (!authTokenData || !authTokenData.accessToken) {
      console.warn('no token')
      // throw new Error
      this.handleError('no token')
      return false
    }

    if (authTokenData.expireDate > +new Date()) {
      return authTokenData
    }

    return this.refreshToken(authTokenData.refreshToken)
  }

  async getToken() {
    const token = await AsyncStorage.getItem(k.AUTH_NEW_TOKENS)

    if (token) {
      return JSON.parse(token)
    }

    return false
  }

  storeToken(response) {
    const payload = {
      accessToken: response.access_token,
      expireDate: +new Date() + parseInt(response.expires_in) * 1000,
      refreshToken: response.refresh_token,
    }

    try {
      AsyncStorage.setItem(k.AUTH_NEW_TOKENS, JSON.stringify(payload))
    } catch (e) {
      this.handleError(e)
    }

    return payload
  }

  clearStorage() {
    return AsyncStorage.clear()
  }

  async resetPassword(password) {
    const { user_id } = this.getHeaders()

    const a = await client.mutate({
      mutation: USER_CHANGE_PASSWORD,
      variables: {
        password,
        userId: user_id,
      },
    })

    return a.userChangePassword
  }

  handleError(error) {
    console.warn('[AUTH] ERROR. ', error)
  }
}

export default Authentication
