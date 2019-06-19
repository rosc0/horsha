import React, { PureComponent } from 'react'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import Carousel from 'react-native-snap-carousel'
import { Dimensions, StyleSheet, View, Keyboard, Text } from 'react-native'
import ActionSheet from 'rn-action-sheet'
import { has, isEmpty, isNil } from 'ramda'
import TimerMixin from 'react-timer-mixin'
import BackgroundGeolocation from 'react-native-background-geolocation-android'

import * as userActions from '@actions/user'
import * as trailActions from '@actions/trails'
import * as poiActions from '@actions/poi'
import * as mapActions from '@actions/map'
import * as recordActions from '@actions/record'

import MapPoi from '@components/map/MapPoi'
import Loading from '@components/Loading'

import t from '@config/i18n'

import Map, {
  Mapbox,
  LATITUDE_DELTA,
  LONGITUDE_DELTA,
  MAP_STYLES,
  Marker,
  Polyline,
} from '@components/map/Map'
import Item from './components/Item'
import MapControl from './components/MapControl'
import { theme } from '@styles/theme'
import { debounce, throttle, getBBox, getGeoCurrentLocation } from '@utils'
import MapCluster from '../../components/map/MapCluster'
import { styles } from '@styles/screens/maps'
import Reasearch from './components/Reasearch'

const { width, height } = Dimensions.get('window')
const itemHeight = height * 0.24
const INITIAL_ZOOM_LEVEL = 15.5

class TrailsMap extends PureComponent {
  constructor(props) {
    super(props)
    this.mapRef = React.createRef()
    this._carousel = React.createRef()
  }

  state = {
    isLoaded: false,
    hideElements: false,
    region: {
      latitude: 0,
      longitude: 0,
      latitudeDelta: LATITUDE_DELTA,
      longitudeDelta: LONGITUDE_DELTA,
    },
    trails: {},
    focusedTrail: {
      id: null,
      index: null,
    },
    showPoi: false,
    pois: [],
    selectedPoi: {},
    mapStyle: MAP_STYLES.OUTDOORS.url,
    searchActive: false,
    lock: false,
    zoom: INITIAL_ZOOM_LEVEL,
    center: null,
    showCarousel: false,
    unMove: false,
    source: null,
    prevLatitude: null,
    lockMap: false,
    showReSearch: false,
    loading: false,
  }

  componentDidMount() {
    this.keyboardDidShowListener = Keyboard.addListener(
      'keyboardDidShow',
      this.keyboardDidShow
    )
    this.keyboardDidHideListener = Keyboard.addListener(
      'keyboardDidHide',
      this.keyboardDidHide
    )

    this.onStart()

    const {
      map: { region, source },
    } = this.props

    if (this.state.region.latitude === 0 && region.latitude !== 0) {
      this.setState({ region, searchActive: true })

      return this.props.actions.setLatitudeLongitude({
        latitude: region.latitude,
        longitude: region.longitude,
      })
    }

    if (this.state.region.latitude === 0 && region.latitude === 0) {
      getGeoCurrentLocation().then(position => {
        if (position) {
          this.setState(
            {
              region: {
                latitude: position.coords.latitude,
                longitude: position.coords.longitude,
                latitudeDelta: LATITUDE_DELTA,
                longitudeDelta: LONGITUDE_DELTA,
              },
            },
            () =>
              this.props.actions.setLatitudeLongitude({
                latitude: position.coords.latitude,
                longitude: position.coords.longitude,
              })
          )
        }
      })
    }

    if (source !== 'poi' && region.latitude === 0) {
      return this.getCurrentLocation(true)
    }
  }

  keyboardDidShow = () => this.setState({ hideElements: true })

  keyboardDidHide = () => this.setState({ hideElements: false })

  onStart = () => {
    this.setState(
      {
        isLoaded: true,
        showPoi: true,
        showCarousel: true,
      },
      () => this.requests()
    )
  }

  UNSAFE_componentWillReceiveProps(nextProps) {
    const { poi, trailsOriginal } = nextProps
    const { region, source, boundBox } = nextProps.map
    const { searchActive, lock } = this.state
    const { latitude, longitude } = region
    const { mapRef } = this

    if (lock) return

    if (source === 'poi' && this.mapRef) {
      if (this.state.prevLatitude === latitude) return
      return TimerMixin.setTimeout(() => {
        this.mapRef.animateToRegion({
          latitude,
          longitude,
          animationDuration: 300,
        })
        this.setState({ prevLatitude: latitude, lockMap: true })
        this.requests()
      }, 500)
    }

    if (
      region.latitude !== 0 &&
      source === null &&
      this.state.lockMap === false
    ) {
      if (this.state.prevLatitude === latitude) return
      TimerMixin.setTimeout(() => {
        this.getCurrentLocation()
      }, 500)
      this.setState({ prevLatitude: latitude, lockMap: true })
    }

    if (!!poi && !!poi.fetched && !poi.error && !isEmpty(poi.collection)) {
      this.setState({ pois: poi.collection })
    }

    if (source === 'search' && this.mapRef) {
      this.setState({ searchActive: true })
      this.loadLocation({ latitude, longitude, mapRef })
    }

    if (source === null) {
      this.setState({ searchActive: false, lock: false })
    }

    if (
      // First map load.
      this.state.unMove === false &&
      this.props.map.boundBox.bb_bottom_left_latitude === 0 &&
      boundBox.bb_bottom_left_latitude !== 0
    ) {
      this.setState({ unMove: true })
      this.loadLocation({ latitude, longitude, mapRef })
    }
  }

  loadLocation = async ({ latitude, longitude, mapRef, source = null }) => {
    if (!mapRef) {
      this.loadLocation()
    } else {
      await this.props.actions.setLatitudeLongitude(
        {
          latitude,
          longitude,
        },
        source
      )
      await mapRef.animateToRegion({
        latitude,
        longitude,
        zoomLevel: INITIAL_ZOOM_LEVEL,
        animationDuration: 300,
      })
      await this.requests()
      this.setState({ searchActive: false })
    }
    this.props.resetSource()
  }

  getCurrentLocation = async forceMove => {
    if (this.state.lock && !forceMove) return
    const { mapRef } = this
    this.setState({ lock: false })

    BackgroundGeolocation.getCurrentPosition({
      timeout: 30, // 30 second timeout to fetch location
      persist: false, // Defaults to state.enabled
      maximumAge: 5000, // Accept the last-known-location if not older than 5000 ms.
      desiredAccuracy: 10, // Try to fetch a location with an accuracy of `10` meters.
    }).then(
      ({ coords }) => {
        this.props.actions.setLatitudeLongitude({
          latitude: coords.latitude,
          longitude: coords.longitude,
        })
        this.loadLocation({
          latitude: coords.latitude,
          longitude: coords.longitude,
          mapRef,
        })
      },
      error => {
        console.warn('- getCurrentPosition error: ', error)
      },
      {
        persist: true,
      }
    )
  }

  loadTrails = () => {
    if (!this.state.isLoaded) return
    const {
      trailType,
      map: { boundBox, source },
    } = this.props
    if (trailType === 'created' || trailType === 'favorites') return

    this.props.actions.getTrails({
      boundingBox: {
        topRight: {
          latitude: boundBox.bb_top_right_latitude,
          longitude: boundBox.bb_top_right_longitude,
        },
        bottomLeft: {
          latitude: boundBox.bb_bottom_left_latitude,
          longitude: boundBox.bb_bottom_left_longitude,
        },
      },
    })

    if (source === 'search' || source === 'poi' || this.state.lock) return
  }

  requestPois = () => {
    const {
      map: { boundBox },
    } = this.props

    if (this.state.isLoaded) {
      this.props.actions.getPOIs({ ...boundBox })
    }
  }

  openDetails = trail =>
    this.props.navigation.navigate('Details', { trailId: trail.id })

  createPOI = ({ geometry }) => {
    const { navigate, state } = this.props.navigation
    return navigate('CreatePOI', {
      data: {
        coords: {
          longitude: geometry.coordinates[0],
          latitude: geometry.coordinates[1],
        },
        parentKey: state.routeName,
      },
    })
  }

  togglePoi = () => this.setState({ showPoi: !this.state.showPoi })

  showActionSheet = () => {
    const mapStyles = Object.keys(MAP_STYLES)
    const options = mapStyles.map(mapStyle => MAP_STYLES[mapStyle].label)

    const cancelButtonIndex = mapStyles.length

    return ActionSheet.show(
      {
        title: t('trails/mapType'),
        options: [...options, t('common/cancel')],
        cancelButtonIndex,
        tintColor: theme.secondaryColor,
      },
      index => {
        if (index !== cancelButtonIndex) {
          this.setState({
            mapStyle: MAP_STYLES[mapStyles[index]].url,
          })
        }
      }
    )
  }

  handleFollowTrail = trail => {
    this.props.actions.followTrail(trail.id)

    return this.props.navigation.navigate('RecordModal')
  }

  handleFocusTrail = (trail, index) => {
    this.setState({
      focusedTrail: {
        id: trail.id,
        index,
      },
    })

    this.mapRef.fitBounds(
      [trail.boundingBox.topRight, trail.boundingBox.bottomLeft],
      {
        bounds: {
          paddingTop: 80,
          paddingLeft: 60,
          paddingBottom: 150,
        },
      }
    )

    debounce(this.setState({ showReSearch: true }), 2000)
    return this._carousel.current.snapToItem(index)
  }

  renderItem = ({ item, index }) => (
    <Item
      key={`trail-${item.id}`}
      onPressSeeDetails={this.openDetails}
      onPress={index => debounce(this.onTrailVisible(item, index), 2000)}
      trail={item}
      index={index}
      toggleFavorite={this.props.toggleFavorite}
      onPressFollowTrail={item => this.handleFollowTrail(item)}
    />
  )

  renderTrailsDrawed = (trails, focusedTrailId) =>
    trails.map((trail, index) => (
      <Polyline
        key={trail.id}
        id={trail.id}
        coordinates={trail.coordinates.map(({ lat, lng }) => ({
          latitude: lat,
          longitude: lng,
        }))}
        onPress={() => this.handleFocusTrail(trail, index, 'Polyline')}
        strokeColor={
          trail.id === focusedTrailId ? theme.mainColor : theme.secondaryColor
        }
      />
    ))

  renderMapPois = () => {
    const { zoom, showPoi, pois } = this.state
    return (
      zoom > 11 &&
      !!showPoi &&
      !isEmpty(pois) && (
        <MapCluster
          pois={pois}
          region={getBBox(this.state.region)}
          selectPoi={this.selectPoi}
          cluster={true}
        />
      )
    )
  }

  onTrailVisible = async (item, index) =>
    this.handleFocusTrail(item, index, 'Trail')

  selectPoi = poi => this.setState({ selectedPoi: poi })

  goToPOI = async () => {
    const { selectedPoi } = this.state
    await this.props.navigation.navigate('POIDetail', {
      selectedPoi,
      trailsStack: true,
    })
    return this.selectPoi({})
  }

  onRegionDidChange = geometry => {
    const { isLoaded, showReSearch } = this.state
    this.props.actions.setLatitudeLongitude({
      latitude: geometry.latitude,
      longitude: geometry.longitude,
    })
    if (!isLoaded || !geometry) return
    // throttle(this.requests(), 2000)
    if (showReSearch === false) {
      this.setState({ showReSearch: true })
    }
  }

  requests = async () => {
    const { showPoi } = this.state
    this.loadTrails()
    showPoi && this.requestPois()
  }

  componentWillUnmount() {
    if (this.keyboardDidShowListener) {
      this.keyboardDidShowListener.remove()
    }
    if (this.keyboardDidHideListener) {
      this.keyboardDidHideListener.remove()
    }
  }

  render() {
    const {
      mapStyle,
      region,
      focusedTrail,
      selectedPoi,
      showCarousel,
      hideElements,
      showReSearch,
      loading,
    } = this.state

    const data = this.props.trails.trailsOriginal
    const focusedTrailCoordinates = !isNil(focusedTrail.index)
      ? focusedTrail.coordinates
      : false

    if (!region && !region.latitude) {
      return <Loading fullScreen type="spinner" />
    }

    return (
      <View style={styles.wrapper}>
        <View style={[styles.container, StyleSheet.absoluteFillObject]}>
          {!!loading && <Loading fullScreen type="spinner" />}
          <Map
            ref={el => {
              if (!!el) {
                this.mapRef = el
              }
            }}
            initialZoomLevel={this.state.zoom}
            mapStyle={mapStyle}
            showsUserLocation
            userTrackingMode={Mapbox.UserTrackingModes.Follow}
            onLongPress={this.createPOI}
            onRegionChangeComplete={throttle(this.onRegionDidChange, 3000)}
            rotateEnabled={false}
          >
            <React.Fragment>
              {this.renderMapPois()}

              {this.renderTrailsDrawed(data, focusedTrail.id)}

              {focusedTrailCoordinates && (
                <Marker
                  coordinate={{
                    latitude:
                      focusedTrailCoordinates[
                        focusedTrailCoordinates.length - 1
                      ].lat,
                    longitude:
                      focusedTrailCoordinates[
                        focusedTrailCoordinates.length - 1
                      ].lng,
                  }}
                  image={require('../../images/location_green.png')}
                />
              )}

              {focusedTrailCoordinates && (
                <Marker
                  coordinate={{
                    latitude: focusedTrailCoordinates[0].lat,
                    longitude: focusedTrailCoordinates[0].lng,
                  }}
                  image={require('../../images/location_red.png')}
                />
              )}
            </React.Fragment>
          </Map>
          {!hideElements && (
            <MapControl
              style={[styles.mapControl, { bottom: itemHeight + 20 }]}
              onPoiPress={this.togglePoi}
              onLayerPress={this.showActionSheet}
              onLocationPress={() => this.getCurrentLocation(true)}
            />
          )}
          {!hideElements && !!showReSearch && (
            <View style={styles.redoSearch}>
              <Reasearch
                onPress={async () => {
                  console.log('on refetch pressed')
                  this.setState({ loading: true })
                  await this.requests()
                  this.setState({ showReSearch: false, loading: false })
                }}
              />
            </View>
          )}

          {!hideElements && !!showCarousel && !isNil(data) && !isEmpty(data) && (
            <View style={styles.scrollView}>
              <Carousel
                ref={this._carousel}
                data={this.props.trails.trailsOriginal}
                inactiveSlideScale={0.85}
                inactiveSlideOpacity={0.7}
                showsHorizontalScrollIndicator={false}
                sliderWidth={width}
                itemWidth={width * 0.8}
                renderItem={this.renderItem}
              />
            </View>
          )}

          {!isEmpty(selectedPoi) && (
            <MapPoi
              poi={selectedPoi}
              reset={() => this.selectPoi({})}
              action={this.goToPOI}
            />
          )}
        </View>
      </View>
    )
  }
}

export default connect(
  state => ({
    user: state.user,
    auth: state.auth,
    map: state.map,
    poi: state.poi,
    record: state.record,
    trails: state.trails,
  }),
  dispatch => ({
    actions: bindActionCreators(
      {
        ...trailActions,
        ...poiActions,
        ...userActions,
        ...mapActions,
        ...recordActions,
      },
      dispatch
    ),
  })
)(TrailsMap)
