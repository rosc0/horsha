import API from './index'
import {
  serialize,
  formatBirthday,
  formatHeightUnit,
  formatWeightUnit,
} from '@application/utils'
import * as endpoints from './endpoints'
import store from '@application/store'
import {
  POST_PUBLISH,
  POST_ATTACH_MEDIA,
} from '../apollo/mutations/PostCollection'
import { client } from '../apollo/init'
import {
  GET_NEWSFEED_ITEM,
  GET_NEWSFEED_COLLECTION,
} from '../apollo/queries/NewsFeedCollection'

class Horses extends API {
  getHorses(limit = 50, cursor = false) {
    let params = {
      ...this.getHeaders(),
      max_items: limit,
    }

    if (cursor) params.cursor = cursor

    const endpoint = `${endpoints.HORSE_USER}?${serialize(params)}`

    return this.setEndpoint(endpoint).get()
  }

  getHorsesByUser(user_id) {
    const { access_token } = this.getHeaders()

    const params = serialize({ access_token, user_id })

    const endpoint = `${endpoints.HORSE_USER}?${params}`

    return new Promise((resolve, reject) => {
      this.setEndpoint(endpoint)
        .get()
        .then(resolve)
        .catch(reject)
    })
  }

  addHorse(horseData) {
    const { access_token, user_id: owner_user_id } = this.getHeaders()
    const state = store.getState()
    const { unit_system, height_unit } = state.user.user.account.preferences

    const {
      name,
      birthday,
      gender,
      color,
      breed,
      weight,
      height,
      description = null,
      horseCare: care_info,
    } = horseData

    const params = serialize({
      access_token,
    })

    const body = {
      name,
      birthday: formatBirthday(birthday),
      gender,
      color,
      breed,
      weight: weight
        ? {
            unit: formatWeightUnit(unit_system),
            value: Number(weight),
          }
        : null,
      height: height
        ? {
            unit: formatHeightUnit(height_unit),
            value: Number(height),
          }
        : null,
      description,
      care_info,
      owner_user_id,
    }
    const endpoint = `${endpoints.HORSE}?${params}`

    return new Promise((resolve, reject) => {
      this.setEndpoint(endpoint)
        .setBody({ profile: { ...body } }, true)
        .post()
        .then(resolve)
        .catch(reject)
    })
  }

  editHorseUser({ horseUserId, ...data }) {
    const { access_token } = this.getHeaders()

    const params = serialize({
      access_token,
    })

    const endpoint = `${endpoints.HORSE_USER}/${horseUserId}${
      endpoints.HORSE_USER_RELATION
    }?${params}`
    return this.setEndpoint(endpoint)
      .setBody(data, true)
      .put()
  }

  addHorseImage(horse_id, upload_key) {
    const { access_token, user_id } = this.getHeaders()

    const params = serialize({
      access_token,
    })

    const endpoint = `${endpoints.HORSE_ALBUM}?${params}`

    const body = {
      upload_key,
      user_id,
      horse_id,
    }

    return new Promise((resolve, reject) => {
      this.setEndpoint(endpoint)
        .setBody(body, true)
        .post()
        .then(resolve)
        .catch(reject)
    })
  }

  async deleteHorseImage(imagesId) {
    const { access_token } = this.getHeaders()

    const params = serialize({
      access_token,
    })

    return Promise.all(
      imagesId.map(imageId =>
        this.setEndpoint(
          `${endpoints.HORSE_ALBUM}/${imageId}?${params}`
        ).delete()
      )
    )
  }

  async addPostImage(postId, media) {
    try {
      const saved = await client.mutate({
        mutation: POST_ATTACH_MEDIA,
        variables: { postId, media },
      })

      return saved.data.postAttachMedia
    } catch (error) {
      console.error(error)
      return error
    }
  }

  setHorseProfileImage(horseId, upload_key) {
    const { access_token } = this.getHeaders()

    const params = serialize({
      access_token,
    })

    const endpoint = `${endpoints.HORSE}/${horseId}${
      endpoints.HORSE_PICTURE
    }?${params}`

    const body = {
      upload_key,
    }

    return new Promise((resolve, reject) => {
      this.setEndpoint(endpoint)
        .setBody(body, true)
        .put()
        .then(resolve)
        .catch(reject)
    })
  }

  getHorseProfile(horseId) {
    const headers = this.getHeaders()
    const params = {
      ...headers,
      horse_id: horseId,
    }

    const endpoint = `${endpoints.HORSE}/${horseId}?${serialize(params)}`

    return new Promise((resolve, reject) => {
      this.setEndpoint(endpoint)
        .get()
        .then(resolve)
        .catch(reject)
    })
  }

  editHorse(id, content) {
    const { access_token } = this.getHeaders()
    const state = store.getState()
    const { unit_system, height_unit } = state.user.user.account.preferences

    const params = serialize({ access_token })

    const endpoint = `${endpoints.HORSE}/${id}/profile?${params}`

    const body = {
      id,
      name: content.name,
      breed: content.breed,
      color: content.color,
      gender: content.gender,
      weight: content.weight
        ? {
            unit: formatWeightUnit(unit_system),
            value: Number(content.weight),
          }
        : null,
      height: content.height
        ? {
            unit: formatHeightUnit(height_unit),
            value: Number(content.height),
          }
        : null,
      birthday: formatBirthday(content.birthday),
      description: content.description,
      care_info: content.horseCare && content.horseCare,
    }

    return new Promise((resolve, reject) => {
      this.setEndpoint(endpoint)
        .setBody(body, true)
        .put()
        .then(resolve)
        .catch(reject)
    })
  }

  getHorseUser(horseId, userId = null) {
    const { access_token } = this.getHeaders()
    const params = {
      access_token,
      horse_id: horseId,
    }

    if (userId) {
      params.user_id = userId
    }

    const endpoint = `${endpoints.HORSE_USER}?${serialize(params)}`

    return new Promise((resolve, reject) => {
      this.setEndpoint(endpoint)
        .get()
        .then(resolve)
        .catch(reject)
    })
  }

  getHorseAlbum(horseId, filter = 'all_photos') {
    const { access_token, user_id } = this.getHeaders()

    let params = {
      horse_id: horseId,
      access_token,
    }

    if (filter === 'only_mine') {
      params.user_id = user_id
    }

    const endpoint = `${endpoints.HORSE_ALBUM}?${serialize(params)}`

    return new Promise((resolve, reject) => {
      this.setEndpoint(endpoint)
        .get()
        .then(resolve)
        .catch(reject)
    })
  }

  getHorseJournal(horseId) {
    const { access_token } = this.getHeaders()
    const data = serialize({ horse_id: horseId, max_items: 50, access_token })
    const endpoint = `${endpoints.HORSE_JOURNAL}?${data}`
    return new Promise((resolve, reject) => {
      this.setEndpoint(endpoint)
        .get()
        .then(resolve)
        .catch(reject)
    })
  }

  async saveHorseJournal({ postId, horseId, shareScope, text, media }) {
    const { user_id } = this.getHeaders()

    const saved = await client.mutate({
      mutation: POST_PUBLISH,
      variables: { postId, horseId, shareScope, text, media },

      refetchQueries: () => [
        {
          query: GET_NEWSFEED_COLLECTION,
          variables: {
            userId: user_id,
            maxItems: 10,
          },
        },
        {
          query: GET_NEWSFEED_ITEM,
          variables: {
            postId,
          },
        },
      ],
    })
    return saved.data.postPublishContent
  }

  async editHorseJournal({ postId, horseId, shareScope, text, media }) {
    const { user_id } = this.getHeaders()

    const saved = await client.mutate({
      mutation: POST_PUBLISH,
      variables: { postId, horseId, shareScope, text, media },
      refetchQueries: () => [
        {
          query: GET_NEWSFEED_ITEM,
          variables: {
            postId,
          },
        },
      ],
    })
    return saved.data.postPublishContent
  }

  editShareScope(id, shareScope) {
    const { access_token } = this.getHeaders()
    const params = serialize({ access_token })

    const endpoint = `${endpoints.HORSE_JOURNAL}/${id}/share_scope?${params}`

    const payload = {
      share_scope: shareScope,
    }

    return new Promise((resolve, reject) => {
      this.setEndpoint(endpoint)
        .setBody(payload, true)
        .put()
        .then(resolve)
        .catch(reject)
    })
  }

  addFriendTeam(horseId, userId) {
    const { access_token } = this.getHeaders()

    const body = {
      horse_id: horseId,
      user_id: userId,
    }

    const params = serialize({
      access_token,
    })

    const endpoint = `${endpoints.HORSE_USER}?${params}`

    return new Promise((resolve, reject) => {
      this.setEndpoint(endpoint)
        .setBody(body, true)
        .post()
        .then(resolve)
        .catch(reject)
    })
  }

  getHorseUserRelation(horse_id) {
    const { access_token, user_id } = this.getHeaders()

    const params = serialize({ access_token, user_id, horse_id })

    const endpoint = `${endpoints.HORSE_USER}?${params}`

    return new Promise((resolve, reject) => {
      this.setEndpoint(endpoint)
        .get()
        .then(resolve)
        .catch(reject)
    })
  }

  setLatestHorse(horseUserId) {
    const { access_token } = this.getHeaders()

    const params = serialize({
      access_token,
    })

    const endpoint = `${endpoints.HORSE_LAST_ACCESSED.replace(
      ':id',
      horseUserId
    )}?${params}`

    return new Promise((resolve, reject) => {
      this.setEndpoint(endpoint)
        .setBody(null, true)
        .put()
        .then(resolve)
        .catch(reject)
    })
  }

  deleteHorseUser(horseId) {
    const { access_token } = this.getHeaders()

    const params = serialize({
      access_token,
    })

    const endpoint = `${endpoints.HORSE_USER}/${horseId}?${params}`

    return this.setEndpoint(endpoint).delete()
  }

  getJournalPost(journalId) {
    const { access_token } = this.getHeaders()

    const params = serialize({
      access_token,
    })

    const endpoint = `${endpoints.HORSE_JOURNAL}/${journalId}?${params}`

    return new Promise((resolve, reject) => {
      this.setEndpoint(endpoint)
        .get()
        .then(resolve)
        .catch(reject)
    })
  }

  getStatusPost(statusId) {
    const { access_token, user_id } = this.getHeaders()

    const params = serialize({
      access_token,
      relation_with_user_id: user_id,
    })

    const endpoint = `${endpoints.STATUS_UPDATE}/${statusId}?${params}`

    return new Promise((resolve, reject) => {
      this.setEndpoint(endpoint)
        .get()
        .then(resolve)
        .catch(reject)
    })
  }
}

export default Horses
