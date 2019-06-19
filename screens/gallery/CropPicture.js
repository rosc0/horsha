import React, { PureComponent } from 'react'
import { Alert } from 'react-native'
import t from '@config/i18n'

import ImagePicker from 'react-native-image-crop-picker'

class CropPicture extends PureComponent {
  componentDidMount() {
    this.handleCrop()
  }

  goBack = () => {
    const { key } = this.props.navigation.state.params
    this.props.navigation.goBack(key)
  }

  handleCrop = async () => {
    const { callback, path } = this.props.navigation.state.params
    try {
      ImagePicker.openCropper({
        path,
        width: 600,
        height: 600,
      }).then(async uri => {
        console.log('crop', uri)
        callback(uri)
        await this.goBack()
      })
    } catch (err) {
      const errorText = t('common/error')
      const cropErrorText = t('gallery/cropError')

      Alert.alert(errorText, cropErrorText)
    }
  }

  render() {
    return null
  }
}

export default CropPicture
