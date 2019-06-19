// <TrailPolyline coordsFile={url} coords={obj} />

import React, { PureComponent } from 'react'
import {
  ActivityIndicator,
  Dimensions,
  ImageBackground,
  StyleSheet,
  View,
} from 'react-native'

import polyline from '@mapbox/polyline'
import config from 'react-native-config'

const { width } = Dimensions.get('window')

const generatePath = coords => {
  if (!coords.length) return ''

  let lat = 'latitude'
  let long = 'longitude'

  // if using short names
  if (coords[0].lat) {
    lat = 'lat'
    long = 'lng'
  }

  const lines = coords.map(item => [item[lat], item[long]])

  return encodeURIComponent(polyline.encode(lines))
}

const generatePins = (coords, flat) => {
  if (!coords || (flat && !coords.length) || (!flat && !coords.segments.length))
    return ''

  let data = null

  if (flat) {
    const lat = 'latitude'
    const long = 'longitude'
    const lastCoord = coords[coords.length - 1]

    data = {
      first: [coords[0][long], coords[0][lat]].toString(),
      last: [lastCoord[long], lastCoord[lat]].toString(),
    }
  } else {
    const lat = 'lat'
    const long = 'lng'
    const firstLocation = coords.segments[0].waypoints[0]
    const lastSegment = coords.segments[coords.segments.length - 1]
    const lastWaypoint = lastSegment.waypoints[lastSegment.waypoints.length - 1]

    data = {
      first: [firstLocation[long], firstLocation[lat]].toString(),
      last: [lastWaypoint[long], lastWaypoint[lat]].toString(),
    }
  }

  return data
}

class TrailPolyline extends PureComponent {
  state = {
    loading: true,
    polyline: [],
    flat: false,
  }

  componentDidMount() {
    const { coords, coordsFile } = this.props

    if (coordsFile) {
      this.loadTrail(coordsFile)
    }

    if (coords) {
      this.processCoords(coords)
    }
  }

  generateURL = coords => {
    const flat = !coords.hasOwnProperty('segments')

    // https://www.mapbox.com/api-documentation/#static
    const MAP_TYPE = 'outdoors-v10'
    const URL = `https://api.mapbox.com/styles/v1/mapbox/${MAP_TYPE}/static/`
    const pinGreen =
      'url-https%3A%2F%2Fimage.ibb.co%2Fn3wkR8%2Flocation_green.png'
    const pinRed = 'url-https%3A%2F%2Fimage.ibb.co%2FjE1Vto%2Flocation_red.png'
    const pins = generatePins(coords, flat)
    const END_PIN = `${pinRed}(${pins.last}),`
    const START_PIN = `${pinGreen}(${pins.first})`
    const SIZE = `/auto/${Math.round(width)}x150@2x`
    const KEY = `?access_token=${config.MAPBOX_TOKEN}`
    const QUERY = '&attribution=false&logo=false'

    let PATH = ''

    if (flat) {
      PATH += `path-4+5a968e-1(${generatePath(coords)}),`
    } else {
      coords.segments.forEach(segment => {
        const waypoints = segment.waypoints
        // get last coords from the previous segment, and the first from the current segment
        PATH += `path-5+5a968e-1(${generatePath(waypoints)}),`
      })
    }

    return {
      uri: `${URL}${PATH}${END_PIN}${START_PIN}${SIZE}${KEY}${QUERY}`,
    }
  }

  processCoords = coords => {
    let polyline = null
    const flat = !coords.hasOwnProperty('segments')

    if (flat) {
      polyline = coords.reduce(
        (acc, val) => acc.concat({ longitude: val.lng, latitude: val.lat }),
        []
      )
    } else {
      polyline = coords
    }

    if (this.props.onLoad) {
      this.props.onLoad(polyline)
    }

    this.setState({
      polyline,
      loading: false,
    })
  }

  loadTrail(url) {
    fetch(url)
      .then(req => req.json())
      .then(data => this.processCoords(data))
      .catch(() => {})
  }

  render() {
    const { loading, polyline } = this.state
    const { children, mapStyle } = this.props
    const data = this.generateURL(polyline)

    return (
      <View style={styles.wrapper}>
        {loading ? (
          <ActivityIndicator
            animating
            style={[styles.loading, this.props.style]}
            size="small"
          />
        ) : (
          <ImageBackground
            source={data}
            style={[{ width, height: 150 }, mapStyle]}
          >
            {children}
          </ImageBackground>
        )}
      </View>
    )
  }
}

const styles = StyleSheet.create({
  wrapper: {
    position: 'relative',
    backgroundColor: '#eee',
  },
  mapView: {
    width: '100%',
    height: 150,
  },
  overlay: {
    position: 'absolute',
    width: '100%',
    height: 150,
    backgroundColor: 'transparent',
  },
  loading: {
    height: 150,
  },
  iconStyle: {
    width: 20,
    height: 20,
    resizeMode: 'contain',
    zIndex: 1002,
  },
  iconEnd: {
    zIndex: 10010,
  },
})

export default TrailPolyline
