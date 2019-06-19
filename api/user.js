import API from './index'
import * as endpoints from './endpoints'
import { serialize } from '../utils'
import { client } from '../apollo/init'
import {
  USER_SET_PRIMARY_EMAIL,
  USER_CHANGE_PICTURE,
  USER_REGISTER_EMAIL,
  USER_UNREGISTER_EMAIL,
  USER_SIGNUP_FACEBOOK,
  USER_UPDATE_PREFERENCES,
} from '../apollo/mutations/UserCollection'
import { CURRRENT_USER } from '../apollo/queries/UserCollection'

class User extends API {
  constructor(props) {
    super(props)
    this.isUser = true
  }

  async currentUser() {
    // return new Promise((resolve, reject) => {
    //   this.setEndpoint(endpoints.CURRENT_USER)
    //     .get({ token: true })
    //     .then(resolve)
    //     .catch(reject)
    // })
    // CURRRENT_USER
    const data = await client.query({
      query: CURRRENT_USER,
    })

    return data.data.userMe
  }

  create(user) {
    return new Promise((resolve, reject) => {
      this.setEndpoint(endpoints.USER)
        .setBody(user, true)
        .post()
        .then(resolve)
        .catch(error => {
          this.handleError(error)
          reject(error)
        })
    })
  }

  async createUserWithFacebook(facebookAccessToken) {
    const data = {
      facebook_access_token: facebookAccessToken,
    }

    const res = new Promise((resolve, reject) => {
      this.setEndpoint(endpoints.CREATE_USER_WITH_FACEBOOK)
        .setBody(data, true)
        .post()
        .then(resolve)
        .catch(error => {
          this.handleError(error)
          reject(error)
        })
    })

    // await client
    //   .mutate({
    //     mutation: USER_SIGNUP_FACEBOOK,
    //     variables: {
    //       facebookAccessToken,
    //     },
    //   })
    //   .then(({ data }) => console.log('@@ 😍🎶✌️ 🎉  😁', data))

    // const data = await client.query({
    //   query: CURRRENT_USER,
    // })

    // return data.data.userMe
    console.log('@@ FACEBOOK 😍🎶✌️ 🎉  😁', res)
    return res
  }

  search(searchTerm, cursor = null) {
    const { access_token, user_id } = this.getHeaders()

    const params = {
      q: searchTerm,
      relation_with_user_id: user_id,
      access_token,
    }

    if (cursor) {
      params.cursor = cursor
    }

    return new Promise((resolve, reject) => {
      const endpoint = `${endpoints.USER_SEARCH}?${serialize(params)}`

      this.setEndpoint(endpoint)
        .get()
        .then(resolve)
        .catch(error => {
          this.handleError(error)
          reject(error)
        })
    })
  }

  facebookSearch(facebookId, cursor = null) {
    const { access_token, user_id } = this.getHeaders()

    const params = {
      facebook_id: facebookId,
      relation_with_user_id: user_id,
      exclude_user_id: user_id,
      access_token,
    }

    if (cursor) {
      params.cursor = cursor
    }

    return new Promise((resolve, reject) => {
      const endpoint = `${endpoints.USER}?${serialize(params)}`

      this.setEndpoint(endpoint)
        .get()
        .then(resolve)
        .catch(error => {
          this.handleError(error)
          reject(error)
        })
    })
  }

  getUser(userId, relationWithMe = false) {
    const { access_token } = this.getHeaders()
    const params = {
      access_token,
    }

    if (relationWithMe) {
      const { user_id } = this.getHeaders()
      params.relation_with_user_id = user_id
    }

    return new Promise((resolve, reject) => {
      const endpoint = `${endpoints.USER_PROFILE.replace(
        ':id',
        userId
      )}?${serialize(params)}`
      this.setEndpoint(endpoint)
        .get()
        .then(resolve)
        .catch(error => {
          this.handleError(error)
          reject(error)
        })
    })
  }

  updateUser(user) {
    const { access_token, user_id } = this.getHeaders()

    const params = serialize({
      access_token,
    })

    return new Promise((resolve, reject) => {
      const endpoint = `${endpoints.UPDATE_USER_PROFILE.replace(
        ':id',
        user_id
      )}?${params}`

      this.setEndpoint(endpoint)
        .setBody(user, true)
        .put()
        .then(resolve)
        .catch(error => {
          this.handleError(error)
          reject(error)
        })
    })
  }

  updateUserImage(uploadKey) {
    const { user_id } = this.getHeaders()

    client.mutate({
      mutation: USER_CHANGE_PICTURE,
      variables: {
        uploadKey,
        userId: user_id,
      },
    })
  }

  async updateUserPreferences(userPreferences) {
    // const { access_token, user_id } = this.getHeaders()
    // const params = serialize({ access_token })

    // return new Promise((resolve, reject) => {
    //   const endpoint = `${endpoints.UPDATE_USER_PREFERENCES.replace(
    //     ':id',
    //     user_id
    //   )}?${params}`

    //   this.setEndpoint(endpoint)
    //     .setBody(userPreferences, true)
    //     .put()
    //     .then(resolve)
    //     .catch(error => {
    //       this.handleError(error)
    //       reject(error)
    //     })
    // })
    const { user_id } = this.getHeaders()
    const { unitSystem, heightUnit, pushEnabled, pushTopics } = userPreferences
    console.log('@@ userPreferences', userPreferences)
    // $unitSystem: UnitSystem! = METRIC
    // $heightUnit: HorseHeightUnit! = METER
    // $pushEnabled: Boolean! = true
    // $pushTopicsHorse: Boolean! = true
    // $pushTopicsPost: Boolean! = true

    const mutat = await client.mutate({
      mutation: USER_UPDATE_PREFERENCES,
      variables: {
        userId: user_id,
        // unitSystem,
        // heightUnit,
        pushEnabled,
        pushTopicsHorse: pushTopics.horse,
        pushTopicsPost: pushTopics.post,
      },
    })

    console.log('mutat', mutat)
    return mutat
  }

  handleError(err) {
    console.log('[USER] ERROR: ', err)
  }

  registerDevice(token) {
    const { access_token, user_id } = this.getHeaders()
    const params = serialize({ access_token })
    const body = { user_id, token }
    const endpoint = `${endpoints.REGISTER_DEVICE}?${params}`

    return new Promise((resolve, reject) =>
      this.setEndpoint(endpoint)
        .setBody(body, true)
        .post()
        .then(resolve)
        .catch(reject)
    )
  }

  resendEmailConfirmation(email) {
    const { access_token, user_id } = this.getHeaders()

    const params = serialize({
      access_token,
    })

    const body = {
      state: 'unconfirmed',
    }

    const endpoint = `${endpoints.RESEND_EMAIL_CONFIRMATION.replace(
      ':userId',
      user_id
    ).replace(':email', encodeURIComponent(email))}?${params}`

    return new Promise((resolve, reject) =>
      this.setEndpoint(endpoint)
        .setBody(body, true)
        .put()
        .then(resolve)
        .catch(error => {
          this.handleError(error)
          reject(error)
        })
    )
  }

  async addEmail(email) {
    const { user_id } = this.getHeaders()

    await client.mutate({
      mutation: USER_REGISTER_EMAIL,
      variables: {
        email,
        userId: user_id,
      },
      refetchQueries: () => [
        {
          query: CURRRENT_USER,
        },
      ],
    })
  }

  async setEmailPrimary(email) {
    const { user_id } = this.getHeaders()

    client.mutate({
      mutation: USER_SET_PRIMARY_EMAIL,
      variables: {
        email,
        userId: user_id,
      },
      refetchQueries: () => [
        {
          query: CURRRENT_USER,
        },
      ],
    })
  }

  async deleteEmail(email) {
    const { user_id } = this.getHeaders()

    await client.mutate({
      mutation: USER_UNREGISTER_EMAIL,
      variables: {
        email,
        userId: user_id,
      },
      refetchQueries: () => [
        {
          query: CURRRENT_USER,
        },
      ],
    })
  }
}

export default User
