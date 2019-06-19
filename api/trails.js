import config from 'react-native-config'

import API from './index'
import * as endpoints from './endpoints'
import { convertSerialize, serialize } from '@application/utils'

import store from '@application/store'
import { isEmpty, isNil } from 'ramda'
import { client } from '../apollo/init'
import {
  GET_TRAILS_COLLECTION,
  GET_TRAIL_REVIEWS,
  GET_TRAIL_PICTURES,
  GET_TRAIL_BY_ID,
} from '../apollo/queries/TrailCollection'
import {
  TRAIL_LIKE,
  TRAIL_UNLIKE,
  TRAIL_REVIEW_CREATE,
  TRAIL_REVIEW_DELETE,
  TRAIL_REVIEW_EDIT,
  TRAIL_PROFILE_EDIT,
} from '../apollo/mutations/TrailCollection'

class Trails extends API {
  async getTrails(query = {}, maxItems = 10) {
    const state = store.getState()
    const { trails } = state

    const withFilters =
      !isNil(trails.trailFilters) && !isEmpty(trails.trailFilters)
        ? Object.assign(query, trails.trailFilters)
        : query

    return new Promise(async (resolve, reject) => {
      try {
        const { data } = await client.query({
          query: GET_TRAILS_COLLECTION,
          variables: {
            maxItems,
            filter: withFilters,
            // filter: query,
          },
        })
        const { trails } = data
        if (!!trails && trails.collection) {
          await Promise.all(
            trails.collection.map(async (trail, key) => {
              trails.collection[key].coordinates = await fetch(
                trail.fullWaypointsUrl
              ).then(res => res.json())
            })
          )
        }
        return resolve(trails)
      } catch (err) {
        return reject(err)
      }
    })
  }

  getUserTrails(userId) {
    return this.getTrails({ creatorUserId: userId }, 50)
  }

  getUserFavoriteTrails(userId) {
    return this.getTrails({ favoriteForUserId: userId }, 50)
  }

  async getTrailDetails(trailId) {
    const {
      data: { trail },
    } = await client.query({
      query: GET_TRAIL_BY_ID,
      variables: { trailId },
    })

    return trail
  }

  async getTrailPictures(trailId, maxItems = 50, filter = '') {
    const { user_id } = this.getHeaders()

    let variables = {
      maxItems,
      trailId,
    }

    if (filter === 'only_mine') {
      variables.authorUserId = user_id
    }

    const {
      data: { trailPictures },
    } = await client.query({
      query: GET_TRAIL_PICTURES,
      variables,
    })

    return trailPictures
  }

  getTrailReviews(trailId) {
    const params = serialize({ trail_id: trailId })
    const endpoint = `${endpoints.TRAIL_REVIEW}?${params}`

    return new Promise((resolve, reject) => {
      this.setEndpoint(endpoint)
        .get({ token: true })
        .then(resolve)
        .catch(reject)
    })
  }

  getTrailPois(trailId, maxItems, cursor) {
    const { access_token } = this.getHeaders()

    let query = `?access_token=${access_token}&trail_id=${trailId}`

    if (maxItems) {
      query += `&max_items=${maxItems}`
    }
    if (cursor) {
      query += `&cursor=${cursor}`
    }
    const endpoint = `${endpoints.TRAIL_POI}${query}`

    return this.setEndpoint(endpoint).get()
  }

  getTrailRides(trailId) {
    const params = serialize({ trail_id: trailId })
    const endpoint = `${endpoints.TRAIL_RIDES}?${params}`

    return new Promise((resolve, reject) => {
      this.setEndpoint(endpoint)
        .get({ token: true })
        .then(resolve)
        .catch(reject)
    })
  }

  getTrailsPassed(rideId) {
    const params = serialize({ ride_id: rideId })
    const endpoint = `${endpoints.TRAIL_RIDES}?${params}`

    return new Promise((resolve, reject) => {
      this.setEndpoint(endpoint)
        .get({ token: true })
        .then(resolve)
        .catch(reject)
    })
  }

  getUserFavoriteTrailsIds(accessToken, userId) {
    const params = serialize({
      access_token: accessToken,
      user_id: userId,
      max_items: 7,
    })
    const endpoint = `${endpoints.TRAIL_FAVORITES}?${params}`

    return new Promise((resolve, reject) => {
      this.setEndpoint(endpoint)
        .get()
        .then(resolve)
        .catch(reject)
    })
  }

  deleteTrailPicture(imageId) {
    const { access_token } = this.getHeaders()
    const params = serialize({ access_token })

    const endpoint = `${endpoints.TRAIL_PICTURES}/${imageId}?${params}`

    return this.setEndpoint(endpoint).delete()
  }

  addTrailImage(trail_id, upload_key) {
    const { access_token, user_id } = this.getHeaders()

    const params = serialize({
      access_token,
    })

    const body = {
      trail_id,
      user_id,
      upload_key,
    }

    const endpoint = `${endpoints.TRAIL_PICTURES}?${params}`

    return new Promise((resolve, reject) => {
      this.setEndpoint(endpoint)
        .setBody(body, true)
        .post()
        .then(resolve)
        .catch(reject)
    })
  }

  toggleTrailFavorite(likeState, trailId) {
    const { userId } = this.getHeaders()

    return likeState
      ? this.dislike(trailId, userId)
      : this.like(trailId, userId)
  }

  like(trailId, userId) {
    client
      .mutate({
        mutation: TRAIL_LIKE,
        variables: {
          trailId,
          userId,
        },
      })
      .then(({ data }) => {
        const state = store.getState()
        const {
          trails: { trails },
        } = state
        const trail = trails.filter(t => t.id === trailId)
        console.log('like got data', data, trails, trail)
        //TODO: create this action to update data on components
        // store.dispatch(toggleTrailFavorite(data.trailMarkFavorite.since))
      })
  }

  dislike(trailId, userId) {
    client
      .mutate({
        mutation: TRAIL_UNLIKE,
        variables: {
          trailId,
          userId,
        },
      })
      .then(({ data }) => {
        const state = store.getState()
        const {
          trails: { trails },
        } = state
        const trail = trails.filter(t => t.id === trailId)
        console.log('dislike got data', data, trails, trail)
        //TODO: create this action to update data on components
        // store.dispatch(toggleTrailFavorite(null))
      })
  }

  createReview(body, rating, trailId) {
    client.mutate({
      mutation: TRAIL_REVIEW_CREATE,
      variables: {
        trailId,
        body,
        rating,
      },
      refetchQueries: () => [
        {
          query: GET_TRAIL_BY_ID,
          variables: {
            trailId,
          },
        },
        {
          query: GET_TRAIL_REVIEWS,
          variables: {
            trailId,
          },
        },
      ],
    })
  }

  editReview(body, rating, trailsReviewId, trailId) {
    client.mutate({
      mutation: TRAIL_REVIEW_EDIT,
      variables: {
        trailsReviewId,
        body,
        rating,
      },
      refetchQueries: () => [
        {
          query: GET_TRAIL_BY_ID,
          variables: {
            trailId,
          },
        },
        {
          query: GET_TRAIL_REVIEWS,
          variables: {
            trailId,
          },
        },
      ],
    })
  }

  deleteReview(trailsReviewId, trailId) {
    client.mutate({
      mutation: TRAIL_REVIEW_DELETE,
      variables: { trailsReviewId },
      refetchQueries: () => [
        {
          query: GET_TRAIL_BY_ID,
          variables: {
            trailId,
          },
        },
        {
          query: GET_TRAIL_REVIEWS,
          variables: {
            trailId,
          },
        },
      ],
    })
  }

  async createTrail(body) {
    const { access_token } = this.getHeaders()
    const params = serialize({ access_token })

    const endpoint = `${endpoints.TRAILS}?${params}`

    return new Promise((resolve, reject) => {
      this.setEndpoint(endpoint)
        .setBody(body, true)
        .post()
        .then(resolve)
        .catch(reject)
    })
  }

  async update({ id, title, description, suitableForDriving, surfaceTypes }) {
    return client.mutate({
      mutation: TRAIL_PROFILE_EDIT,
      variables: {
        trailId: id,
        title,
        description,
        suitableForDriving,
        surfaceTypes,
      },
      refetchQueries: () => [
        {
          query: GET_TRAIL_BY_ID,
          variables: {
            trailId: id,
          },
        },
      ],
    })
  }

  deleteTrail(trailId) {
    const { access_token } = this.getHeaders()

    const params = serialize({ access_token })
    const endpoint = `${endpoints.TRAILS}/${trailId}?${params}`

    return this.setEndpoint(endpoint).delete()
  }
}

export default Trails
