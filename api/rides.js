import { Platform } from 'react-native'
import moment from 'moment'
import RNFS from 'react-native-fs'
import RNFetchBlob from 'rn-fetch-blob'
import { getRandomInt, getTimeZone, serialize } from '@application/utils'
import store from '@application/store'
import config from 'react-native-config'

import API from './index'
import * as endpoints from './endpoints'
import Upload from './upload'

const UploadAPI = new Upload()

class Rides extends API {
  getRidesByHorse(horseId, cursor = null, userId) {
    const { access_token } = this.getHeaders()

    const data = {
      horse_id: horseId,
      access_token,
    }

    if (userId) {
      data.user_id = userId
    }

    if (cursor) {
      data.cursor = cursor
    }

    const endpoint = `${endpoints.RIDE}?${serialize(data)}`
    return new Promise((resolve, reject) => {
      this.setEndpoint(endpoint)
        .get({ token: true })
        .then(resolve)
        .catch(reject)
    })
  }

  getRideById(rideId) {
    const endpoint = `${endpoints.RIDE}/${rideId}`
    return new Promise((resolve, reject) => {
      this.setEndpoint(endpoint)
        .get({ token: true })
        .then(resolve)
        .catch(reject)
    })
  }

  async saveRide() {
    const { access_token, user_id } = this.getHeaders()
    const { record, horses } = store.getState()

    const params = serialize({ access_token })

    const payload = {
      segments: record.locations.map(location => ({
        date_created: parseInt(moment(location.createdAt).format('x')),
        waypoints: location.coordinates.map(coordinate => ({
          lat: coordinate.latitude,
          lng: coordinate.longitude,
          dt: coordinate.ms,
          alt: coordinate.altitude,
        })),
      })),
    }

    const uploadJson = await UploadAPI.uploadJson(payload)

    if (uploadJson && uploadJson.key) {
      const horse_id = horses.horse.id
      const upload_key = uploadJson.key
      const endpoint = `${endpoints.RIDE}?${params}`
      const body = {
        horse_id,
        user_id,
        upload_key,
      }

      return new Promise((resolve, reject) => {
        this.setEndpoint(endpoint)
          .setBody(body, true)
          .post()
          .then(resolve)
          .catch(reject)
      })
    }
  }

  convertGpxToJson(upload_key) {
    const { access_token } = this.getHeaders()
    const endpoint = `${
      endpoints.TRACK
    }?access_token=${access_token}&upload_key=${upload_key}`
    const body = {
      upload_key,
    }

    return new Promise((resolve, reject) => {
      this.setEndpoint(endpoint)
        .setBody(body, true)
        .get()
        .then(resolve)
        .catch(reject)
    })
  }

  uploadRide(upload_key, horse_id) {
    const { access_token, user_id } = this.getHeaders()
    const endpoint = `${
      endpoints.RIDE
    }?access_token=${access_token}&upload_key=${upload_key}`
    const body = {
      upload_key,
      horse_id,
      user_id,
    }

    return new Promise((resolve, reject) => {
      this.setEndpoint(endpoint)
        .setBody(body, true)
        .post()
        .then(resolve)
        .catch(reject)
    })
  }

  deleteRide(rideId) {
    const endpoint = `${endpoints.RIDE}/${rideId}`

    return new Promise((resolve, reject) => {
      this.setEndpoint(endpoint)
        .delete({ token: true })
        .then(resolve)
        .catch(reject)
    })
  }

  getTotalRides = ({ horseId, since, until, userId }, range = 'day') => {
    const { access_token } = this.getHeaders()
    const tz = `GMT${getTimeZone()}`

    let query = {
      since,
      until,
      tz,
      access_token,
    }

    if (horseId) query.horse_id = horseId
    if (userId) query.user_id = userId

    const endpoint = `${endpoints.RIDE}/totals_per_${range}?${serialize(query)}`

    return this.setEndpoint(endpoint).get()
  }

  downloadRide = url => {
    const { access_token } = this.getHeaders()
    const endpoint = `${endpoints.GEO}?access_token=${access_token}&url=${url}`

    const fileName = `Horsha-${new Date()
      .toDateString()
      .split(' ')
      .join('-')}-${getRandomInt()}.gpx`
    const filePath =
      Platform.OS === 'ios'
        ? `${RNFS.DocumentDirectoryPath}/${fileName}`
        : `${RNFetchBlob.fs.dirs.DownloadDir}/${fileName}`

    const donwloadUrl = `${config.API_BASE}${endpoint}`

    return RNFetchBlob.config({
      addAndroidDownloads: {
        useDownloadManager: true,
        notification: true,
        path: filePath,
        title: fileName,
      },
    })
      .fetch('GET', donwloadUrl)
      .then(resolve => resolve.text())
      .then(text => {
        Platform.OS === 'ios' &&
          RNFetchBlob.fs.createFile(filePath, text, 'utf8').catch(err => {
            console.log(err.message)
          })
      })
      .catch((errorMessage, statusCode) => {
        console.log('Error: ' + errorMessage)
        console.log('Status code: ' + statusCode)
      })
  }
}

export default Rides
