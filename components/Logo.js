import React, { PureComponent } from 'react'
import { Image } from 'react-native'

class Logo extends PureComponent {
  static defaultProps = {
    name: 'default',
    size: '360',
    style: {},
  }

  render() {
    const { name, size, style } = this.defaultProps

    const availableLogos = {
      default: require('@images/logos/Horsha.png'),
    }

    const chosenIcon = availableLogos[name]

    const chosenSize =
      typeof size === 'string'
        ? { width: parseInt(size) }
        : { width: size.width, height: size.height }

    let styles = {
      resizeMode: 'contain',
      ...chosenSize,
      ...style,
    }

    return <Image source={chosenIcon} style={styles} />
  }
}

export default Logo
