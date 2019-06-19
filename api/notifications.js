import { AsyncStorage } from 'react-native'
import API from './index'
import * as endpoints from './endpoints'
import { serialize } from '@application/utils'
import * as k from '@constants/storageKeys'
import { GET_NOTIFICATIONS_COLLECTION } from '../apollo/queries/NotificationsCollection'
import { client } from '../apollo/init'

class Notifications extends API {
  async getUnreadCount() {
    const { user_id } = this.getHeaders()
    // userId
    // const params = {
    //   access_token,
    //   user_id,
    //   is_read: false,
    //   max_items: 0,
    // }

    // const endpoint = `${endpoints.NOTIFICATIONS}?${serialize(params)}`

    // return new Promise((resolve, reject) => {
    //   this.setEndpoint(endpoint)
    //     .get()
    //     .then(resolve)
    //     .catch(reject)
    // })
    // GET_NOTIFICATIONS_COLLECTION
    const data = await client.query({
      query: GET_NOTIFICATIONS_COLLECTION,
      variables: {
        // maxItems,
        // filter: query,
        userId: user_id,
      },
    })
    console.log('@@ notifications query data', data)
    return data
  }

  updateReadMarker(dateRead = null) {
    // const { access_token, user_id } = this.getHeaders()
    // const body = {
    //   user_id,
    //   read_until_date: dateRead ? dateRead : Date.now() * 1000,
    // }
    // const endpoint = `${endpoints.READ_MARKER}?access_token=${access_token}`
    // return new Promise((resolve, reject) => {
    //   this.setEndpoint(endpoint)
    //     .setBody(body, true)
    //     .post()
    //     .then(resolve)
    //     .catch(reject)
    // })
  }

  getNotifications(cursor = null) {
    // const { access_token, user_id } = this.getHeaders()
    // const params = {
    //   access_token,
    //   user_id,
    // }
    // if (cursor) {
    //   params.cursor = cursor
    // }
    // const endpoint = `${endpoints.NOTIFICATIONS}?${serialize(params)}`
    // return new Promise((resolve, reject) => {
    //   this.setEndpoint(endpoint)
    //     .get()
    //     .then(resolve)
    //     .catch(reject)
    // })
  }

  async getNotification(notificationId) {
    const { accessToken } = JSON.parse(
      await AsyncStorage.getItem(k.AUTH_NEW_TOKENS)
    )

    if (accessToken === null) {
      return false
    }

    const params = {
      access_token: accessToken,
    }
    const endpoint = `${endpoints.NOTIFICATIONS}/${notificationId}?${serialize(
      params
    )}`

    return new Promise((resolve, reject) => {
      this.setEndpoint(endpoint)
        .get()
        .then(resolve)
        .catch(reject)
    })
  }
}

export default Notifications
