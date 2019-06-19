import React from 'react'
import { Platform } from 'react-native'
import { icons } from '@components/PoiIcons'
import { Mapbox } from '@components/map/Map'
import { isIphoneX } from '@utils'

const iconSize = Platform.OS === 'android' ? 1 : isIphoneX() ? 0.9 : 0.5

const MapCluster = ({ pois = [], selectPoi, cluster = false }) => {
  let geojson = {}
  geojson['type'] = 'FeatureCollection'
  geojson['features'] = []

  pois.reduce((oldvalue, value) => {
    const changed = {
      properties: {
        ...value,
        icon: value.kind,
      },
      type: 'Feature',
      geometry: {
        type: 'Point',
        coordinates: [value.location.longitude, value.location.latitude],
      },
    }
    return geojson['features'].push(changed)
  }, [])

  const layerStyles = Mapbox.StyleSheet.create({
    icon: {
      iconAllowOverlap: true,
      iconIgnorePlacement: false,
      iconSize,
      // iconOffset: [0, 5],
    },
    clusteredPoints: {
      circlePitchAlignment: Mapbox.CirclePitchAlignment.Map,
      circleColor: '#1f8583',

      circleRadius: Mapbox.StyleSheet.source(
        [[0, 10], [100, 10], [750, 10]],
        'point_count',
        Mapbox.InterpolationMode.Exponential
      ),

      circleOpacity: 0.84,
      circleStrokeOpacity: 0.5,
      circleStrokeWidth: 4,
      circleStrokeColor: 'white',
    },

    clusterCount: {
      textField: '{point_count}',
      textSize: 12,
      textColor: 'white',
      textPitchAlignment: Mapbox.TextPitchAlignment.Map,
    },
  })

  return (
    <Mapbox.ShapeSource
      id="symbolLocationSource"
      shape={geojson}
      cluster={cluster}
      clusterRadius={5}
      iconAllowOverlap={true}
      onPress={e => {
        const { cluster = false } = e.nativeEvent.payload.properties
        if (!cluster) selectPoi(e.nativeEvent.payload.properties)
      }}
      hitbox={{ width: 30, height: 30 }}
    >
      <Mapbox.SymbolLayer id="pointCount" style={layerStyles.clusterCount} />
      <Mapbox.CircleLayer
        id="clusteredPoints"
        belowLayerID="pointCount"
        filter={['has', 'point_count']}
        style={layerStyles.clusteredPoints}
      />
      {pois.map(({ kind, id }) => (
        <Mapbox.SymbolLayer
          key={`singlePoint${id}`}
          id={`singlePoint${id}`}
          filter={['!has', 'point_count']}
          filter={['all', ['!has', 'point_count'], ['==', 'kind', kind]]}
          style={[layerStyles.icon, { iconImage: icons[kind] }]}
        />
      ))}
    </Mapbox.ShapeSource>
  )
}

export default MapCluster
