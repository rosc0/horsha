import React, { PureComponent } from 'react'
import { Dimensions, Image } from 'react-native'
import Lightbox from 'react-native-lightbox'
import idx from 'idx'
import { defaultHorse } from './Icons'

const { width: deviceWidth } = Dimensions.get('window')

class HorseImage extends PureComponent {
  static defaultProps = {
    size: 'thumbnail',
    horse: false,
    style: {},
  }

  render() {
    const { size, horse, style, lightbox = false, image } = this.props
    const sizeParam = size === 'thumbnail' ? '?t=300x300,fill' : ''
    const imageSource = idx(horse, _ => _.profile_picture)
      ? { uri: `${horse.profile_picture.url}${sizeParam}` }
      : defaultHorse

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
          <Image style={style} source={image || imageSource} />
        </Lightbox>
      )

    return <Image source={imageSource} style={style} />
  }
}

export default HorseImage
