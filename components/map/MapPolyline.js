import React, { PureComponent } from 'react'
import uuid from 'uuid/v4'

import Mapbox from '@mapbox/react-native-mapbox-gl'

class MapPolyline extends PureComponent {
  static defaultProps = {
    strokeColor: 'red',
    strokeWidth: 4,
    strokeOpacity: 1,
  }

  constructor(props) {
    super(props)

    this.state = {
      id: props.id || uuid(),
    }
  }

  render() {
    const { id } = this.state
    const {
      coordinates,
      strokeColor,
      strokeWidth,
      dashed,
      strokeOpacity,
      ...props
    } = this.props

    if (!coordinates) {
      return null
    }

    if (!coordinates.length) {
      return null
    }

    const shape = {
      type: 'Feature',
      properties: {},
      geometry: {
        type: 'LineString',
        coordinates: coordinates.map(({ latitude, longitude }) => [
          longitude,
          latitude,
        ]),
      },
    }

    let lineStyle = {
      lineColor: strokeColor,
      lineWidth: strokeWidth,
      lineOpacity: strokeOpacity,
    }

    if (dashed) {
      lineStyle.lineDasharray = [1, 1]
    }

    return (
      <Mapbox.ShapeSource {...props} id={id} shape={shape}>
        <Mapbox.LineLayer id={`${id}-fill`} style={lineStyle} />
      </Mapbox.ShapeSource>
    )
  }
}

export default MapPolyline
