import React, { PureComponent } from 'react'
import { Dimensions } from 'react-native'
import Mapbox from '@mapbox/react-native-mapbox-gl'
import BackgroundGeolocation from 'react-native-background-geolocation-android'
import getBounds from 'bound-points'

import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import * as recordActions from '@actions/record'

import t from '@config/i18n'
import Marker from './MapMarker'
import Callout from './MapCallout'
import Polyline from './MapPolyline'
import MapCluster from './MapCluster'

import { styles } from '@styles/screens/maps'

const DEFAULT_ZOOM_LEVEL = 13.5

const { width, height } = Dimensions.get('window')

export const ASPECT_RATIO = width / height
export const LATITUDE_DELTA = 0.09412
export const LONGITUDE_DELTA = LATITUDE_DELTA * ASPECT_RATIO

export const MAP_STYLES = {
  OUTDOORS: {
    label: 'Outdoors',
    url: 'mapbox://styles/mapbox/outdoors-v9?optimize=true',
  },
  STREETS: {
    label: 'Streets',
    url: Mapbox.StyleURL.Street,
  },
  SATELLITE: {
    label: 'Satellite',
    url: Mapbox.StyleURL.Satellite,
  },
}

const ANIMATION_DURATION = 300

class Map extends PureComponent {
  mapRef = null

  state = {
    mapInitialized: false,
    initialZoomLevel: this.props.initialZoomLevel,
  }

  static defaultProps = {
    initialZoomLevel: DEFAULT_ZOOM_LEVEL,
    compassEnabled: false,
    pitchEnabled: false,
    onMapReady: () => {},
    onRegionChangeComplete: () => {},
    changeMessage: () => {},
  }

  componentDidMount() {
    this.handleSetupGeolocation()

    BackgroundGeolocation.getState()
      .then(state => {
        if (state.enabled === false) {
          return this.handleSetupGeolocation()
        }
      })
      .catch(error => {
        console.log('- location error: ', error)
      })
  }

  handleSetupGeolocation = () => {
    this.props.changeMessage('Configuring geolocation', true, 'green')
    BackgroundGeolocation.logger.info('Configuring geolocation')
    BackgroundGeolocation.on('location', this.handleLocationChange)
    // BackgroundGeolocation.on('error', this.handleLocationError)

    BackgroundGeolocation.on('providerchange', function(provider) {
      // console.log('- Provider Change: ', provider)
      // console.log('  enabled: ', provider.enabled)
      // console.log('  gps: ', provider.gps)
      // console.log('  network: ', provider.network)
      // console.log('  status: ', provider.status)

      // https://github.com/transistorsoft/react-native-background-geolocation-android/blob/master/docs/README.md#callbackfn-paramters
      switch (provider.enabled) {
        case false:
          // GPS offline
          this.props &&
            this.props.changeMessage('- Retriving GPX position', true, 'red')
          break
        case true:
          // GPS online
          this.props &&
            this.props.changeMessage('- Retriving GPX enabled', false, 'green')
          break
      }
    })

    BackgroundGeolocation.ready({
      reset: false, // <-- true to always apply the supplied config
      // desiredAccuracy: -1,
      // distanceFilter: 10,
      stopOnTerminate: false, // Set false to continue tracking after user teminates the app.
      startOnBoot: false, // Set to true to enable background-tracking after the device reboots.
      foregroundService: true,
      // stopTimeout: 2,
      stopOnStationary: false,
      heartbeatInterval: 60,
      notificationLargeIcon: 'mipmap/ic_launcher',
      // debug: true, // <-- enable this hear sounds for background-geolocation life-cycle.
      logLevel: BackgroundGeolocation.LOG_LEVEL_VERBOSE,
    })
      .then(state => {
        BackgroundGeolocation.logger.on('Starting geolocation')
        this.setState({
          enabled: state.enabled,
          isMoving: state.isMoving,
          followsUserLocation: state.enabled,
          showsUserLocation: state.enabled,
          bgGeo: state,
        })
        this.props.changeMessage(null, false, 'green')
      })
      .catch(e => {
        this.handleLocationError(e, true, 'red')
      })
  }

  handleLocationError = error => {
    console.warn('error', error)
    let message = error

    if (typeof error === 'object' && error.code >= 0) {
      switch (error.code) {
        case 0:
          {
            message = t('maps/locationUnknown')
          }
          break
        case 1:
          {
            message = t('maps/locationPermissionDenied')
          }
          break
        case 2:
          {
            message = t('maps/networkError')
          }
          break
        case 408:
          {
            message = t('maps/locationTimeout')
          }
          break
        default: {
          message = t('maps/locationError')
        }
      }
    }

    this.props.changeMessage(message, true, 'red')
  }

  handleStartRide = async () => {
    this.props.actions.clearRecording()
    BackgroundGeolocation.start()
      .then(state => {
        this.props.startUpdates()
        this.props.changeMessage(null, false, 'green')
        console.log('- current start: ', state)
      })
      .catch(error => {
        console.log('- location error: ', error)
      })

    return this.props.actions.startRecording()
  }

  handleLocationChange = ({ coords }) => {
    const { isRecording } = this.props.record
    const { followCamera } = this.props

    if (!!isRecording) {
      this.props.actions.addRecordLocation(coords)
    }
    if (followCamera === true) {
      return this.props.actions.setCurrentLocation(coords)
    }
  }

  queryRenderedFeaturesAtPoint = (...args) =>
    this.mapRef.queryRenderedFeaturesAtPoint(...args)

  handleMapReady = () => {
    this.props.onMapReady()

    return this.handleSetupGeolocation()
  }

  getBounds = (coordinate, shouldCalculateBounds) => {
    if (shouldCalculateBounds) {
      const coordinates = coordinate.map(({ latitude, longitude }) => [
        longitude,
        latitude,
      ])

      const bounds = getBounds(coordinates)

      return {
        northEast: {
          latitude: bounds[0][1],
          longitude: bounds[0][0],
        },
        southEast: {
          latitude: bounds[1][1],
          longitude: bounds[1][0],
        },
      }
    }

    return {
      northEast: coordinate[0],
      southEast: coordinate[1],
    }
  }

  fitBounds = (
    coordinates,
    { shouldCalculateBounds = false, animationDuration = null, ...rest } = {}
  ) => {
    const props = {
      ...rest,
      bounds: {
        paddingTop: 30,
        paddingRight: 30,
        paddingBottom: 15,
        paddingLeft: 30,
        ...rest.bounds,
      },
      duration: animationDuration,
      mode: Mapbox.CameraModes.None,
    }

    const bounds = this.getBounds(coordinates, shouldCalculateBounds)
    if (this.mapRef === null) return
    return this.mapRef.setCamera({
      ...props,
      bounds: {
        ...props.bounds,
        ne: [bounds.northEast.longitude, bounds.northEast.latitude],
        sw: [bounds.southEast.longitude, bounds.southEast.latitude],
      },
    })
  }

  setCenterCoordinate = ({
    latitude,
    longitude,
    zoomLevel = this.state.initialZoomLevel,
  }) => {
    new Promise(res => {
      this.mapRef.setCenterCoordinateZoomLevel(
        latitude,
        longitude,
        zoomLevel,
        true,
        res
      )
    })
  }

  handleRegionChange = ({ coords, properties }) => {
    // TODO: if the first time from trails request I can pass a force param
    if (this.props.handleLocationChange) {
      return this.props.handleLocationChange(coords, properties)
    }
  }

  handleRegionComplete = ({ properties, geometry }) => {
    if (!geometry) return
    if (!properties) return
    if (properties.isUserInteraction === false) return
    this.props.onRegionChangeComplete(
      {
        longitude: geometry.coordinates[0],
        latitude: geometry.coordinates[1],
        latitudeDelta: LATITUDE_DELTA,
        longitudeDelta: LONGITUDE_DELTA,
      },
      properties
    )
  }

  handleRegionWillChange = ({ properties, geometry }) => {
    if (!geometry) return
    if (!properties) return
    if (this.props.handleRegionWillChange) {
      this.props.handleRegionWillChange(
        {
          longitude: geometry.coordinates[0],
          latitude: geometry.coordinates[1],
          latitudeDelta: LATITUDE_DELTA,
          longitudeDelta: LONGITUDE_DELTA,
        },
        properties
      )
    }
  }

  getZoom = async () => await this.mapRef.getZoom()

  getCenter = async () => {
    if (this.mapRef === null) return
    const center = await this.mapRef.getCenter()
    return center
  }

  zoomTo = async number => {
    if (this.mapRef === null) return
    await this.mapRef.zoomTo(number, 300)
  }

  animateToRegion = ({
    latitude,
    longitude,
    zoomLevel,
    animationDuration = ANIMATION_DURATION,
  }) => {
    if (latitude === 0 || longitude === 0) return
    if (this.mapRef === null) return
    this.mapRef.setCamera({
      centerCoordinate: [longitude, latitude],
      zoom: zoomLevel,
      duration: animationDuration,
    })
  }

  render() {
    const {
      mapStyle = MAP_STYLES.OUTDOORS.url,
      initialRegion = { latitude: 0, longitude: 0 },
      initialZoomLevel,
      style,
      onMapReady, // eslint-disable-line no-unused-vars
      onRegionChangeComplete, // eslint-disable-line no-unused-vars
      zoomLevel, // eslint-disable-line no-unused-vars
      onPress,
      onLongPress,
      ...props
    } = this.props
    return (
      <Mapbox.MapView
        ref={ref => (this.mapRef = ref)}
        animated
        centerCoordinate={[initialRegion.longitude, initialRegion.latitude]}
        zoomLevel={initialZoomLevel}
        style={[styles.mapRootContainer, style]}
        styleURL={mapStyle}
        // onUserLocationUpdate={e => this.onUserLocationUpdate(e)}
        onRegionWillChange={e => this.handleRegionWillChange(e)}
        onRegionDidChange={e => this.handleRegionComplete(e)}
        onDidFinishLoadingMap={() => this.handleMapReady()}
        onPress={onPress}
        onLongPress={onLongPress}
        {...props}
      />
    )
  }
}

const mapStateToProps = ({ record }) => ({ record })

const mapDispatchToProps = dispatch => ({
  actions: bindActionCreators(
    {
      ...recordActions,
    },
    dispatch
  ),
})

export { Marker, Callout, Polyline, MapCluster, Mapbox }
export default connect(
  mapStateToProps,
  mapDispatchToProps,
  null,
  { forwardRef: true }
)(Map)
