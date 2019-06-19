// <TrailMarker coordinates={[52.421, 5.312123]} type="eatery" />

import React, { PureComponent } from 'react'
import { Dimensions, Image, StyleSheet, View } from 'react-native'

import config from 'react-native-config'

const { width } = Dimensions.get('window')

const iconMap = {
  camping: 'https://i.imgur.com/4j09KgF.png?1',
  eatery: 'https://i.imgur.com/W8i8DG8.png',
  equestrian_facility: 'https://i.imgur.com/RkxlZhZ.png?1',
  information_point: 'https://i.imgur.com/UcEUJ2T.png',
  lodging: 'https://i.imgur.com/A0DYs5i.png?1',
  parking: 'https://i.imgur.com/x3WgNG0.png',
  picnic_place: 'https://i.imgur.com/i5Hr3QS.png',
  viewpoint: 'https://i.imgur.com/pW82LkJ.png',
  watering_point: 'https://i.imgur.com/TpoiSsx.png',
  water_crossing: 'https://i.imgur.com/NEyfdOL.png?1',
  warning: 'https://i.imgur.com/JfK0USo.png?1',
}

// https://www.mapbox.com/api-documentation/#static
const generateURL = (coords, type) => {
  const icon = encodeURIComponent(iconMap[type])

  // streets-v10
  // outdoors-v10
  // navigation-preview-day-v2
  // navigation-guidance-day-v2
  const MAP_TYPE = 'outdoors-v10'

  const URL = `https://api.mapbox.com/styles/v1/mapbox/${MAP_TYPE}/static/`

  const MARKER = `url-${icon}(${coords.longitude},${coords.latitude})`
  const SIZE = `/${coords.longitude},${coords.latitude},14/${width}x150@2x`
  const KEY = `?access_token=${config.MAPBOX_TOKEN}`
  const QUERY = '&attribution=false&logo=false'

  return {
    uri: `${URL}${MARKER}${SIZE}${KEY}${QUERY}`,
  }
}

class TrailMarker extends PureComponent {
  state = {
    loaded: false,
  }

  render() {
    const { coords, type } = this.props
    const { loaded } = this.state

    const url = generateURL(coords, type)

    return (
      <View style={styles.wrapper}>
        <Image source={url} style={{ width, height: 150 }} />
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

export default TrailMarker
