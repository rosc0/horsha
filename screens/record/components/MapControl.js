import React, { PureComponent } from 'react'
import { Image, StyleSheet, TouchableOpacity, View } from 'react-native'
import { IconImage } from '@components/Icons'

import Icon from '@components/Icon'

class MapControl extends PureComponent {
  render() {
    const {
      onPressTrails,
      onPressMapType,
      onPressSetUserLocation,
      onPoiPress,
      showTrails,
      poiActive,
    } = this.props

    return (
      <View style={styles.container}>
        <TouchableOpacity
          onPress={() => onPressTrails()}
          style={styles.iconContainer}
        >
          <IconImage
            style={styles.poiIcon}
            source={!showTrails ? 'trailsActiveIcon' : 'trailsIcon'}
          />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.button}
          activeOpacity={0.8}
          onPress={() => onPoiPress()}
        >
          <IconImage
            style={styles.poiIcon}
            source={poiActive ? 'poiActiveIcon' : 'poiIcon'}
          />
        </TouchableOpacity>

        <TouchableOpacity style={styles.iconContainer} onPress={onPressMapType}>
          <Icon name="map_controls_layers" style={styles.icon} />
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => onPressSetUserLocation(true)}
          style={styles.iconContainer}
        >
          <Icon name="my_location" style={styles.icon} />
        </TouchableOpacity>
      </View>
    )
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: 'absolute',
    left: 15,
    bottom: 120,
    flexDirection: 'column',
  },
  iconContainer: {
    backgroundColor: 'white',
    padding: 4,
    borderRadius: 20,
    marginBottom: 10,
    // shadowOffset: {
    //   width: 5,
    //   height: 5,
    // },
    // shadowColor: '#CCC',
    // shadowOpacity: 0.7,
  },
  icon: {
    fontSize: 22,
    color: '#B3B3B3',
    backgroundColor: 'transparent',
  },
  button: {
    padding: 5,
    backgroundColor: 'white',
    borderRadius: 20,
    marginBottom: 10,
    // shadowOffset: {
    //   width: 5,
    //   height: 5,
    // },
    // shadowColor: '#CCC',
    // shadowOpacity: 0.7,
  },
  poiIcon: {
    width: 20,
    height: 20,
    resizeMode: 'contain',
    tintColor: '#bbb',
  },
})

const PoiIcon = <IconImage style={styles.poiIcon} source="poiIcon" />

const PoiActiveIcon = (
  <IconImage style={styles.poiIcon} source="poiActiveIcon" />
)

const TrailIcon = <IconImage style={styles.poiIcon} source="trailsIcon" />

const TrailActiveIcon = (
  <IconImage style={styles.poiIcon} source="trailsActiveIcon" />
)

export default MapControl
