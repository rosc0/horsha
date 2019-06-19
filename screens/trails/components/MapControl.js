import React, { PureComponent } from 'react'
import { StyleSheet, TouchableOpacity, View } from 'react-native'
import { IconImage } from '../../../components/Icons'

class MapControl extends PureComponent {
  state = { poiActive: true }

  togglePoi = () => {
    this.setState({ poiActive: !this.state.poiActive })
    this.props.onPoiPress()
  }

  render() {
    const { style, onLocationPress, onLayerPress, onPoiPress } = this.props

    return (
      <View style={[styles.wrapper, style]}>
        <TouchableOpacity
          style={styles.button}
          activeOpacity={0.8}
          onPress={this.togglePoi}
        >
          <IconImage
            style={styles.icon}
            source={this.state.poiActive ? 'poiActiveIcon' : 'poiIcon'}
          />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.button}
          activeOpacity={0.8}
          onPress={onLayerPress}
        >
          <IconImage style={styles.icon} source="layerIcon" />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.button}
          activeOpacity={0.8}
          onPress={onLocationPress}
        >
          <IconImage style={styles.icon} source="locationIcon" />
        </TouchableOpacity>
      </View>
    )
  }
}

const styles = StyleSheet.create({
  wrapper: {
    position: 'absolute',
    left: 15,
  },
  button: {
    padding: 5,
    backgroundColor: 'white',
    borderRadius: 20,
    marginBottom: 10,
    shadowOffset: {
      width: 5,
      height: 5,
    },
    shadowColor: '#CCC',
    shadowOpacity: 0.7,
  },
  icon: {
    width: 20,
    height: 20,
    resizeMode: 'contain',
    tintColor: '#bbb',
  },
})

export default MapControl
