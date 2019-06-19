import API from './index'
import * as endpoints from './endpoints'
import { serialize } from '../utils'
import { client } from '../apollo/init'
import {
  GET_PEOPLE_YOU_MAY_KNOW,
  GET_PENDING_INVITATIONS,
  GET_IGNORED_INVITATIONS,
  GET_FRIENDS,
} from '../apollo/queries/UserCollection'
import {
  USER_FRIEND_REQUEST,
  USER_UNFRIEND_REQUEST,
  DENY_FRIEND_REQUEST,
  ACCEPT_FRIEND_REQUEST,
  UPDATE_FRIEND_REQUEST,
  IGNORE_FRIEND_REQUEST,
} from '../apollo/mutations/UserCollection'

class Friends extends API {
  async getFriends(userId = null, cursor = null, order_by = null) {
    const { user_id } = this.getHeaders()

    const {
      data: { userList },
    } = await client.query({
      query: GET_FRIENDS,
      variables: {
        userId: user_id,
        maxItems: 50,
      },
    })

    return userList
  }

  searchFriends(searchTerm, cursor) {
    const { access_token, user_id } = this.getHeaders()

    let params = {
      access_token,
      friends_with_user_id: user_id,
      order_by: '+name',
    }

    if (searchTerm) {
      params.name = searchTerm + '*'
    }

    if (cursor) {
      params.cursor = cursor
    }

    const endpoint = `${endpoints.USER}?${serialize(params)}`

    return new Promise((resolve, reject) => {
      this.setEndpoint(endpoint)
        .get()
        .then(resolve)
        .catch(reject)
    })
  }

  async getInvitations(state = 'pending') {
    const { user_id } = this.getHeaders()

    const {
      data: { userList },
    } = await client.query({
      query:
        state === 'pending' ? GET_PENDING_INVITATIONS : GET_IGNORED_INVITATIONS,
      variables: {
        userId: user_id,
        maxItems: 15,
      },
    })

    return userList
  }

  async getSuggestions() {
    const { user_id } = this.getHeaders()

    const {
      data: { userFriendSuggestions },
    } = await client.query({
      query: GET_PEOPLE_YOU_MAY_KNOW,
      variables: {
        userId: user_id,
        maxItems: 15,
      },
    })

    return userFriendSuggestions
  }

  async acceptRequest(initiatorUserId) {
    const { user_id } = this.getHeaders()

    client.mutate({
      mutation: ACCEPT_FRIEND_REQUEST,
      variables: {
        initiatorUserId,
        userId: user_id,
      },
    })
  }

  async ignoreRequest(initiatorUserId) {
    const { user_id } = this.getHeaders()

    client.mutate({
      mutation: IGNORE_FRIEND_REQUEST,
      variables: {
        initiatorUserId,
        userId: user_id,
      },
    })
  }

  async removeIgnoreRequest(initiatorUserId) {
    const { user_id } = this.getHeaders()

    client.mutate({
      mutation: UPDATE_FRIEND_REQUEST,
      variables: {
        initiatorUserId,
        userId: user_id,
      },
    })
  }

  async deleteRequest(initiatorUserId) {
    const { user_id } = this.getHeaders()

    client.mutate({
      mutation: DENY_FRIEND_REQUEST,
      variables: {
        initiatorUserId,
        userId: user_id,
      },
    })
  }

  async addFriend(targetUserId) {
    const { user_id } = this.getHeaders()

    client.mutate({
      mutation: USER_FRIEND_REQUEST,
      variables: {
        targetUserId,
        userId: user_id,
      },
    })
  }

  async removeFriend(targetUserId) {
    const { user_id } = this.getHeaders()

    client.mutate({
      mutation: USER_UNFRIEND_REQUEST,
      variables: {
        targetUserId,
        userId: user_id,
      },
    })
  }

  async followUser(targetUserId) {
    const { user_id } = this.getHeaders()

    client.mutate({
      mutation: USER_FOLLOW_REQUEST,
      variables: {
        targetUserId,
        userId: user_id,
      },
    })
  }

  async unfollowUser(targetUserId) {
    const { user_id } = this.getHeaders()

    client.mutate({
      mutation: USER_UNFOLLOW_REQUEST,
      variables: {
        targetUserId,
        userId: user_id,
      },
    })
  }

  handleError(err) {
    // console.log('[Friends] ERROR: ', err)
  }
}

export default Friends
