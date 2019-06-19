// import React, { PureComponent } from 'react'
// import { StyleSheet, Platform } from 'react-native'
// import { icons } from '@components/PoiIcons'
// import { Mapbox } from '@components/map/Map'

// const iconSize = Platform.OS === 'android' ? 0.12 : 0.05
// class PoiMarker extends PureComponent {
//   get markers() {
//     /* Source: A data source specifies the geographic coordinate where the image marker gets placed. */
//     const { location } = this.props.poi

//     return {
//       type: 'FeatureCollection',
//       features: [
//         {
//           type: 'Feature',
//           properties: { poi: this.props.poi },
//           geometry: {
//             type: 'Point',
//             coordinates: [location.longitude, location.latitude],
//           },
//         },
//       ],
//     }
//   }

//   render() {
//     const { type, id } = this.props.poi
//     const { selectPoi } = this.props
//     return (
//       <Mapbox.ShapeSource
//         id={`marker-source-${id}`}
//         shape={this.markers}
//         onPress={e => {
//           selectPoi(e.nativeEvent.payload.properties.poi)
//         }}
//         hitbox={{ width: 40, height: 40 }}
//       >
//         <Mapbox.SymbolLayer
//           id={`marker-style-layer-${id}`}
//           style={[{ iconImage: icons[type], iconSize }]}
//         />
//       </Mapbox.ShapeSource>
//     )
//   }
// }

// const iconStyle = StyleSheet.create({
//   poi: {
//     borderRadius: 23 / 2,
//     borderColor: 'white',
//     borderWidth: 2,
//   },
// })

// export default PoiMarker

import React, { PureComponent } from 'react'
import { StyleSheet, TouchableOpacity } from 'react-native'
import { poiLabels } from '@components/PoiIcons'
import { Callout, Marker } from '@components/map/Map'
import Icon from '@components/svg/Icon'

class PoiMarker extends PureComponent {
  render() {
    const { type, location, description, id, name } = this.props.poi
    const { size, selectPoi } = this.props
    return (
      <Marker
        coordinate={location}
        description={description || null}
        title={poiLabels[type]}
      >
        <TouchableOpacity onPress={() => selectPoi(this.props.poi)}>
          <Icon
            name={type}
            width="23"
            height="23"
            style={[iconStyle.poi, size]}
          />
        </TouchableOpacity>
        <Callout title={description || ''} />
      </Marker>
    )
  }
}

const iconStyle = StyleSheet.create({
  poi: {
    borderRadius: 23 / 2,
    borderColor: 'white',
    borderWidth: 2,
  },
})

export default PoiMarker
