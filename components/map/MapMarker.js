import React, { PureComponent } from 'react'
import { Image, StyleSheet } from 'react-native'
import uuid from 'uuid/v4'

import { Mapbox } from './Map'

class MapMarker extends PureComponent {
  constructor(props) {
    super(props)

    this.state = {
      id: props.id || uuid(),
    }
  }

  static defaultProps = {
    anchor: { x: 0.5, y: 1 },
    image: null,
    imageStyle: {},
  }

  renderImage = () => {
    const { image, imageStyle } = this.props

    if (!image) {
      return
    }

    return <Image source={image} style={[styles.image, imageStyle]} />
  }

  render() {
    const { id } = this.state
    const { coordinate, children, ...props } = this.props

    return (
      <Mapbox.PointAnnotation
        {...props}
        id={id}
        coordinate={[coordinate.longitude, coordinate.latitude]}
      >
        {children || this.renderImage()}
      </Mapbox.PointAnnotation>
    )
  }
}

const styles = StyleSheet.create({
  image: {
    width: 20,
    height: 27,
    resizeMode: 'contain',
  },
})

export default MapMarker
