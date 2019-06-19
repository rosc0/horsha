import React, { PureComponent } from 'react'
import { Dimensions, Image, TouchableOpacity } from 'react-native'
import Lightbox from 'react-native-lightbox'
import idx from 'idx'
import { userIcon } from './Icons'

const { width: deviceWidth, height: deviceHeight } = Dimensions.get('window')

class UserImage extends PureComponent {
  static defaultProps = {
    size: 'thumbnail',
    user: null,
    style: {},
  }

  render() {
    const {
      size,
      user,
      style,
      lightbox = false,
      source,
      newModel = false,
    } = this.props
    const sizeParam = size === 'thumbnail' ? '?t=300x300,fill' : ''
    const tmpUrl = newModel
      ? idx(user, _ => _.picture.url)
      : user.profile_picture && `${user.profile_picture.url}${sizeParam}`

    const imageSource = tmpUrl ? { uri: tmpUrl } : userIcon

    if (!!lightbox)
      return (
        <Lightbox
          backgroundColor="rgba(0,0,0, .7)"
          activeProps={{
            style: {
              height: deviceWidth,
              width: deviceWidth,
            },
            resizeMode: 'contain',
          }}
        >
          <Image style={style} source={!!source ? source : imageSource} />
        </Lightbox>
      )

    return <Image source={imageSource} style={style} />
  }
}

export default UserImage
