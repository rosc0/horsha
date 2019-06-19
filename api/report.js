import API from './index'
import * as endpoints from './endpoints'
import { serialize } from '@application/utils'

class Report extends API {
  report(endpoint, complaint) {
    const { access_token } = this.getHeaders()
    const query = serialize({ access_token })
    const url = `${endpoints.REPORT}?${query}`

    const body = { endpoint, complaint }

    return new Promise((resolve, reject) => {
      this.setEndpoint(url)
        .setBody(body, true)
        .post()
        .then(resolve)
        .catch(reject)
    })
  }
}

export default Report
