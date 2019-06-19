import config from 'react-native-config'
import API from './index'
import * as endpoints from './endpoints'
import { getRandomInt, serialize } from '@application/utils'
import RNFetchBlob from 'rn-fetch-blob'
import RNFS from 'react-native-fs'

class Upload extends API {
  _uploadFile(file, contentType, progressFunc = null) {
    const { access_token } = this.getHeaders()

    const params = serialize({
      access_token,
    })

    const endpoint = `${config.API_BASE}${endpoints.UPLOAD}?${params}`
    const filePath = file.uri ? file.uri.replace('file://', '') : file.path
    console.log('@@ filePath', filePath, file)

    return new Promise((resolve, reject) => {
      this.upload = RNFetchBlob.fetch(
        'POST',
        endpoint,
        { 'Content-Type': contentType },
        RNFetchBlob.wrap(filePath)
      )

      this.upload.uploadProgress({ interval: 250 }, (written, total) => {
        const progress = written / total
        if (typeof progressFunc === 'function') {
          progressFunc(progress)
        }
      })

      this.upload.then(res => {
        const response = res.json()
        resolve(response)
      })

      this.upload.catch(error => {
        console.warn('@@ERROR', error)
        reject(error)
      })
    })
  }

  cancelUpload = () => {
    this.upload.cancel()
  }

  uploadImage(file, progressFunc) {
    return this._uploadFile(file, 'image/jpeg', progressFunc)
  }

  uploadGpx(file, progressFunc) {
    return this._uploadFile(file, 'application/gpx', progressFunc)
  }

  async uploadJson(json, progressFunc) {
    const filePath = `${
      RNFS.TemporaryDirectoryPath
    }/ride-${getRandomInt()}.json`

    await RNFS.writeFile(filePath, JSON.stringify(json), 'utf8')

    const file = {
      uri: filePath,
    }

    return this._uploadFile(file, 'application/json', progressFunc)
  }
}

export default Upload
