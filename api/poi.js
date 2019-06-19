import API from './index'
import * as endpoints from './endpoints'
import { serialize } from '@application/utils'
import { poiTypes } from '@utils'

class POI extends API {
  getPOIs(location, user_id, poi_type = poiTypes) {
    const { access_token } = this.getHeaders()
    let query = `?access_token=${access_token}&max_items=50`

    if (user_id) {
      query += `&user_id=${user_id}`
    }

    if (poi_type) {
      if (Array.isArray(poi_type)) {
        query += poi_type.map(type => `&type=${type}`).join('')
      } else {
        query += `&type=${poi_type}`
      }
    }

    if (location) {
      query += `&${serialize(location)}`
    }
    const endpoint = `${endpoints.POIS}${query}`
    return this.setEndpoint(endpoint).get()
  }

  addPoi({ type, latitude, longitude, description }) {
    const { access_token, user_id } = this.getHeaders()
    const query = serialize({ access_token })

    const endpoint = `${endpoints.POIS}?${query}`

    const body = {
      type,
      location: {
        latitude,
        longitude,
      },
      user_id,
      description,
    }

    return this.setEndpoint(endpoint)
      .setBody(body, true)
      .post()
  }

  editPoi({ id, type, latitude, longitude, description }) {
    const { access_token } = this.getHeaders()
    const query = serialize({ access_token })

    const endpoint = `${endpoints.POIS}/${id}?${query}`

    const payload = {
      type,
      location: {
        latitude,
        longitude,
      },
      description,
    }

    return this.setEndpoint(endpoint)
      .setBody(payload, true)
      .put()
  }

  deletePoi(id) {
    const { access_token } = this.getHeaders()

    const params = serialize({ access_token })
    const endpoint = `${endpoints.POIS}/${id}?${params}`

    return this.setEndpoint(endpoint).delete()
  }
}

export default POI
