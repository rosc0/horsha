import React, { Component } from 'react'
import { Alert, AppState, View, Text, SafeAreaView } from 'react-native'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import BackgroundGeolocation from 'react-native-background-geolocation-android'
import ActionSheet from 'rn-action-sheet'
import { isEmpty } from 'ramda'
import { getBBox, throttle } from '@utils'
import TimerMixin from 'react-timer-mixin'

import t from '@config/i18n'
import * as recordActions from '@actions/record'
import * as trailsActions from '@actions/trails'
import * as poiActions from '@actions/poi'
import * as mapActions from '@actions/map'

import Map, { MAP_STYLES, Mapbox, Marker, Polyline } from '@components/map/Map'
import HeaderButton from '@components/HeaderButton'
import HeaderTitle from '@components/HeaderTitle'

import RecordStats from './components/RecordStats'
import RecordActions from './components/RecordActions'
import MapControl from './components/MapControl'
import NotificationsHeader from '@components/NotificationsHeader'
import MapPoi from '@components/map/MapPoi'
import MapCluster from '../../components/map/MapCluster'

import { locationRed, locationGreen } from '@components/Icons'

import { theme } from '@styles/theme'
import { styles } from '@styles/screens/maps'

const INITIAL_ZOOM_LEVEL = 15

class Record extends Component {
  recordMap = null

  state = {
    fetching: true,
    showTrails: false,
    showStats: false,
    isStartingRide: false,
    mapStyle: MAP_STYLES.OUTDOORS.url,
    appState: AppState.currentState,
    showPoi: false,
    pois: [],
    selectedPoi: {},
    zoom: INITIAL_ZOOM_LEVEL,
    isLoaded: false,
    permissionGranted: false,
    neverAskAgain: false,
    recordingMessage: null,
    showMessage: false,
    timeout: null,
    followCamera: true, // if user touch on screen and move map set to false to avoid map auto get center
    // when user touch get center set true again
  }

  static navigationOptions = ({ navigation }) => ({
    headerTitle: <HeaderTitle title={'record/recordTitle'} />,
    headerRight: (
      <View style={styles.header}>
        <NotificationsHeader navigation={navigation} />
      </View>
    ),
    headerLeft: (
      <HeaderButton onPress={() => navigation.goBack(null)}>
        {t('record/hide')}
      </HeaderButton>
    ),
  })

  componentDidMount() {
    const { trail } = this.props.record

    if (trail.id === null) {
      this.handleFocusUserLocation()
    }

    if (trail.id && trail.boundingBox) {
      const {
        currentLocation,
        trail: { boundingBox, fullWaypointsUrl },
      } = this.props.record
      this.fetchTrail(fullWaypointsUrl)
      const timer = TimerMixin.setTimeout(
        () =>
          this.recordMap.fitBounds(
            [currentLocation, boundingBox.topRight, boundingBox.bottomLeft],
            { shouldCalculateBounds: true }
          ),
        200
      )

      return timer
    }

    AppState.addEventListener('change', this.handleAppStateChange)
  }

  // TODO: share this function
  fetchTrail = async file => {
    const req = await fetch(file)
    const response = await req.json()
    const polyline = response.reduce(
      (acc, val) => acc.concat({ longitude: val.lng, latitude: val.lat }),
      []
    )

    const elevation = response.reduce(
      (acc, val) => acc.concat({ distance: val.ds, altitude: val.alt }),
      []
    )

    this.setState({ polyline, elevation, loading: false })
  }
  // TODO: when map move
  onStart = async e => {
    if (this.recordMap === null) return
    this.setState({ isLoaded: true })
    // if recording navigate to last point
    if (this.props.record.currentLocation.latitude !== 0) {
      this.recordMap.animateToRegion({
        latitude: this.props.record.currentLocation.latitude,
        longitude: this.props.record.currentLocation.longitude,
        zoomLevel: INITIAL_ZOOM_LEVEL,
        animationDuration: 300,
      })
    }

    return this.setState({ showPoi: true }, () => {
      this.requests(e)
    })
  }

  componentDidUpdate(prevProps) {
    // TODO: unnescessary?
    // if (
    //   this.props.record.locations.length === 0 &&
    //   this.props.record.locations.length !== prevProps.record.locations.length
    // ) {
    //   BackgroundGeolocation.logger.on('Restarting geolocation')

    //   return BackgroundGeolocation.start()
    // }
    if (
      this.props.record.trail.id !== prevProps.record.trail.id &&
      this.props.record.trail.id !== null
    ) {
      const {
        currentLocation,
        trail: { boundingBox, fullWaypointsUrl },
      } = this.props.record

      this.fetchTrail(fullWaypointsUrl)
      const timer = TimerMixin.setTimeout(
        () =>
          this.recordMap.fitBounds(
            [currentLocation, boundingBox.topRight, boundingBox.bottomLeft],
            { shouldCalculateBounds: true }
          ),
        200
      )

      return timer
    }
  }

  handleAppStateChange = nextAppState => {
    const { isRecording } = this.props.record
    this.setState({
      appState: nextAppState,
    })

    if (nextAppState.match(/inactive|background/) && !isRecording) {
      return BackgroundGeolocation.stop()
    }

    if (isRecording) return BackgroundGeolocation.start()
    return
  }

  handleStopGeolocation = () => {
    BackgroundGeolocation.logger.info('Stopping geolocation')
    this.changeMessage(null, false)
    BackgroundGeolocation.removeListeners()
  }

  handleSaveRecord = () => this.goToAddRide()

  goToAddRide = () => this.props.navigation.navigate('AddRide')

  handleStartRide = async () => {
    this.handleFocusUserLocation(this.state.followCamera)
    this.props.actions.clearRecording()
    this.changeMessage('- Preparing', true, 'green')

    this.setState({
      isStartingRide: true,
      followCamera: true,
    })

    this.recordMap.handleStartRide()
    return this.changeMessage(null, false, 'green')
  }

  handlePauseRide = () => this.props.actions.pauseRecording()

  handleResumeRide = () => this.props.actions.resumeRecording()

  handleStopRide = () => {
    const { totalDistance } = this.props.record

    const rideText = t('record/ride')
    const shortRideMessage = t('record/shortRideMessage')
    const stopText = t('record/stopLower')
    const dontStopText = t('record/dontStop')

    if (totalDistance < 500) {
      return Alert.alert(
        rideText,
        shortRideMessage,
        [
          {
            text: stopText,
            onPress: () => this.stopRecording(),
          },
          {
            text: dontStopText,
            onPress: () => this.handleResumeRide(),
            style: 'cancel',
          },
        ],
        { cancelable: false }
      )
    } else {
      this.handleSaveRecord()
    }
  }

  stopRecording = () => {
    if (this.state.isStartingRide) {
      this.setState({
        isStartingRide: false,
      })
    }
    BackgroundGeolocation.stop()
    this.handleFocusUserLocation(this.state.followCamera)
    this.props.actions.clearRecording()
  }

  handleChangeRegion = coords => {
    if (this.recordMap === null) return
    if (this.state.followCamera === false) return

    return this.recordMap.animateToRegion({
      latitude: coords.latitude,
      longitude: coords.longitude,
      animationDuration: 300,
    })
  }

  onRegionDidChange = async (source, e) => {
    if (this.state.followCamera === false) return
    if (this.recordMap === null) return
    if (e.isUserInteraction === true) {
      this.setState({ followCamera: false })
    }

    const { currentLocation } = this.props.record

    const bb = await getBBox({
      latitude: currentLocation.latitude,
      longitude: currentLocation.longitude,
    })

    this.props.actions.setBoundBox(bb)
    this.requests(source)
  }

  handleLocationChange = async (coords, properties) => {
    const { shouldFocusUserLocation, isRecording } = this.props.record
    if (shouldFocusUserLocation && this.recordMap) {
      this.handleChangeRegion(coords, properties)
    }

    if (isRecording) {
      if (this.state.isStartingRide) {
        this.setState({
          isStartingRide: false,
        })
      }

      this.props.actions.addRecordLocation(coords)
    }

    return this.props.actions.setCurrentLocation(coords)
  }

  handleToggleTrails = () => {
    if (!this.props.app.isDeviceConnected) {
      const noInternetTitle = t('offline/noInternetTitle')
      const tryAgainLaterMessage = t('offline/tryAgainLaterMessage')
      const tryLater = t('offline/tryLater')
      const tryAgain = t('offline/tryAgain')

      return Alert.alert(
        noInternetTitle,
        tryAgainLaterMessage,
        [
          {
            text: tryLater,
            onPress: () => {},
          },
          {
            text: tryAgain,
            onPress: this.handleToggleTrails,
            style: 'default',
          },
        ],
        { cancelable: false }
      )
    }

    const showTrails = !this.state.showTrails

    this.setState({
      showTrails,
    })

    if (showTrails) {
      const { currentLocation } = this.props.record
      return this.props.actions.getTrails(getBBox(currentLocation))
    }
  }

  handleChangeMapType = () => {
    const mapStyles = Object.keys(MAP_STYLES)
    const options = mapStyles.map(mapStyle => MAP_STYLES[mapStyle].label)

    const cancelButtonIndex = mapStyles.length

    const chooseMapText = t('record/chooseMap')
    const cancelText = t('common/cancel')

    return ActionSheet.show(
      {
        title: chooseMapText,
        options: [...options, cancelText],
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

  handleFocusUserLocation = (shouldFocusUserLocation = true) => {
    if (this.state.followCamera === false) return

    // if message showing and is an error, remove as we have a location now?
    if (this.state.showMessage && this.state.messageType === 'red') {
      this.changeMessage(null, false)
    }

    BackgroundGeolocation.getCurrentPosition({
      timeout: 30, // 30 second timeout to fetch location
      persist: false, // Defaults to state.enabled
      maximumAge: 5000, // Accept the last-known-location if not older than 5000 ms.
      desiredAccuracy: 10, // Try to fetch a location with an accuracy of `10` meters.
    })
      .then(({ coords }) => {
        this.props.actions.setCurrentLocation(coords)
        this.props.actions.setFocusUserLocation(shouldFocusUserLocation)
        return this.recordMap.animateToRegion({
          latitude: coords.latitude,
          longitude: coords.longitude,
          zoomLevel: INITIAL_ZOOM_LEVEL,
          animationDuration: 300,
        })
      })
      .catch(error => {
        console.warn('error', error)
        this.changeMessage('error to get center', true, 'red')
      })
  }

  handleFollowTrail = () => {
    const { trail: trailFollowed } = this.props.record

    const title = t('record/chooseTrailTitle')
    const discoverNearbyText = t('record/discoverNeaby')
    const favoriteTrailsText = t('record/favoriteTrails')
    const stopFollowingTrail = t('record/stopFollowingTrail')
    const cancelText = t('common/cancel')

    let cancelButtonIndex = 2
    let options = [discoverNearbyText, favoriteTrailsText, cancelText]

    if (trailFollowed.id) {
      cancelButtonIndex = 3
      options.splice(2, 0, stopFollowingTrail)
    }

    ActionSheet.show(
      {
        title,
        options,
        cancelButtonIndex,
        tintColor: theme.secondaryColor,
      },
      async index => {
        if (this.state.showTrails) {
          this.setState({ showTrails: false })
        }
        switch (index) {
          case 0: {
            this.props.actions.setShouldFollowTrail()

            await this.props.actions.setTrailListType('discover')

            return this.props.navigation.navigate('Trails')
          }
          case 1: {
            this.props.actions.setShouldFollowTrail({
              shouldFollowTrailShowTrailList: true,
            })

            await this.props.actions.setTrailListType('favorites')

            return this.props.navigation.navigate('Trails')
          }
          case 2: {
            this.props.actions.stopFollowingTrail()
            if (this.state.isStartingRide) {
              this.setState({
                isStartingRide: false,
              })
            }
            this.handleFocusUserLocation(this.state.followCamera)
          }
        }
      }
    )
  }

  togglePoi = () => this.setState({ showPoi: !this.state.showPoi })
  selectPoi = poi => this.setState({ selectedPoi: poi })

  goToPOI = async () => {
    const { selectedPoi } = this.state
    await this.props.navigation.navigate('POIDetail', {
      selectedPoi,
    })
    return this.selectPoi({})
  }

  requestPois = () => {
    if (!this.state.isLoaded) return

    const {
      map: { boundBox },
    } = this.props

    if (this.state.showPoi) {
      this.props.actions.getPOIs({ ...boundBox })
    }
  }

  loadTrails = () => {
    if (!this.state.isLoaded) return
    const {
      map: { boundBox },
    } = this.props

    if (this.state.showTrails) {
      this.props.actions.getTrails({ ...boundBox })
    }
  }

  requests = async source => {
    const { showTrails, showPoi } = this.state
    showTrails && (await this.loadTrails(source))
    showPoi && (await this.requestPois())
  }

  renderMapContent = () => {
    const { currentLocation, locations } = this.props.record

    const isRecording =
      this.props.record.isRecording &&
      locations.length &&
      locations[0].coordinates.length > 0

    const hasLocationBeenCaptured =
      locations.length &&
      (locations[0].coordinates[0].latitude !== currentLocation.latitude ||
        locations[0].coordinates[0].longitude !== currentLocation.longitude)

    const firstPointText = t('record/firstPoint')
    const youAreHereText = t('record/youAreHere')

    if (isRecording && hasLocationBeenCaptured) {
      return (
        <View>
          <Marker
            coordinate={locations[0].coordinates[0]}
            title={firstPointText}
            image={locationGreen}
          />

          <Marker
            coordinate={currentLocation}
            title={youAreHereText}
            image={locationRed}
          />
        </View>
      )
    }
  }

  renderPoisMap = () => {
    const { zoom, showPoi } = this.state
    const {
      poi: { collection: pois },
    } = this.props

    return (
      zoom > 11 &&
      showPoi &&
      !isEmpty(pois) && <MapCluster pois={pois} selectPoi={this.selectPoi} />
    )
  }

  renderTrailsMap = () => {
    const { showTrails } = this.state

    const {
      trails: { trails },
    } = this.props

    return (
      !isEmpty(trails) &&
      showTrails &&
      trails.map((trail, key) => (
        <Polyline
          key={`trail-line-${key}`}
          coordinates={trail.coordinates.map(({ lat, lng }) => ({
            latitude: lat,
            longitude: lng,
          }))}
          onPress={() => this.handleTrailOptions(trail)}
          strokeColor="#1E8583"
        />
      ))
    )
  }

  changeMessage = (recordingMessage, showMessage, messageType) => {
    if (showMessage === true) {
      const timeout = TimerMixin.setTimeout(() => {
        this.setState({ recordingMessage, showMessage, messageType })
      }, 300)
      this.setState({ timeout }) // all TimerMixin.setTimeout generates a new id, here we save timout id to reset if message change
    }
    if (showMessage === false) {
      clearTimeout(this.state.timeout)
      this.setState({ recordingMessage, showMessage, messageType: 'green' })
    }
  }

  handleTrailOptions = trail => {
    const title = t('record/chooseTrailTitle')
    const seeTrailsText = t('record/seeTrailDetails')
    const followingTrail = t('record/followTrailsmall')
    const cancelText = t('common/cancel')

    const cancelButtonIndex = 2
    const options = [seeTrailsText, followingTrail, cancelText]

    ActionSheet.show(
      {
        title,
        options,
        cancelButtonIndex,
        tintColor: theme.secondaryColor,
      },
      async index => {
        switch (index) {
          case 0: {
            return this.props.navigation.navigate('TrailDetails', {
              trailId: trail.id,
            })
          }
          case 1: {
            this.props.actions.followTrail(trail.id)

            this.setState({ showTrails: false })

            if (this.state.isStartingRide) {
              this.setState({
                isStartingRide: false,
              })
            }
            this.handleFocusUserLocation(this.state.followCamera)
          }
        }
      }
    )
  }

  handleFollowedTrailOptions = trailFollowed => {
    const title = t('record/chooseTrailTitle')
    const seeTrailsText = t('record/seeTrailDetails')
    const stopFollowingTrail = t('record/stopFollowingTrail')
    const cancelText = t('common/cancel')

    const cancelButtonIndex = 2
    const options = [seeTrailsText, stopFollowingTrail, cancelText]

    ActionSheet.show(
      {
        title,
        options,
        cancelButtonIndex,
        tintColor: theme.secondaryColor,
      },
      async index => {
        if (this.state.showTrails) {
          this.setState({ showTrails: false })
        }
        switch (index) {
          case 0: {
            return this.props.navigation.navigate('TrailDetails', {
              trailId: trailFollowed.id,
            })
          }
          case 1: {
            this.props.actions.stopFollowingTrail()
            if (this.state.isStartingRide) {
              this.setState({
                isStartingRide: false,
              })
            }
            this.handleFocusUserLocation(this.state.followCamera)
          }
        }
      }
    )
  }

  componentWillUnmount() {
    const { isRecording } = this.props.record
    if (!isRecording) {
      this.handleStopGeolocation()
    }
    AppState.removeEventListener('change', this.handleAppStateChange)
  }

  render() {
    const { showTrails, mapStyle, showPoi, selectedPoi } = this.state
    const {
      record: {
        isPaused,
        currentLocation,
        pausedLocation,
        locations,
        trail: trailFollowed,
      },
    } = this.props

    const isRecording =
      this.props.record.isRecording &&
      locations.length &&
      locations[0].coordinates.length > 0

    const tracking = Mapbox.UserTrackingModes.Follow
    // const tracking = Mapbox.UserTrackingModes.none
    return (
      <SafeAreaView
        style={[styles.recordContainer, { backgroundColor: 'white' }]}
      >
        <View style={styles.recordContainer}>
          <Map
            ref={el => {
              if (!!el) {
                this.recordMap = el
              }
            }}
            initialZoomLevel={INITIAL_ZOOM_LEVEL}
            zoomLevel={INITIAL_ZOOM_LEVEL}
            // initialRegion={currentLocation}
            userTrackingMode={tracking}
            onUserLocationUpdate={() =>
              this.handleFocusUserLocation(this.state.followCamera)
            }
            startUpdates={() =>
              this.handleFocusUserLocation(this.state.followCamera)
            }
            mapStyle={mapStyle}
            handleRegionWillChange={this.onRegionDidChange}
            handleLocationChange={this.handleLocationChange}
            compassEnabled
            changeMessage={this.changeMessage}
            onMapReady={this.onStart}
            followCamera={this.state.followCamera}
          >
            <React.Fragment>
              {trailFollowed.id && (
                <Polyline
                  onPress={() => this.handleFollowedTrailOptions(trailFollowed)}
                  coordinates={this.state.polyline}
                  strokeColor="#1E8583"
                  strokeOpacity={0.5}
                />
              )}

              {this.renderTrailsMap()}
              {this.renderMapContent()}
              {isPaused && (
                <Polyline
                  coordinates={[pausedLocation, currentLocation]}
                  strokeWidth={4}
                  strokeColor="#DA5E34"
                  dashed
                />
              )}
              {isRecording &&
                locations.map((location, key) => {
                  const { coordinates } = location
                  // get last coords from the previous segment, and the first from the current segment
                  let segmentCoords = null
                  if (key > 0) {
                    const prevLocation = locations[key - 1]
                    segmentCoords = [
                      prevLocation.coordinates[
                        prevLocation.coordinates.length - 1
                      ],
                      coordinates[0],
                    ]
                  }

                  return (
                    <View key={`polyline-view-${key}`}>
                      {segmentCoords && (
                        <Polyline
                          key={`polyline-dashed-${key}`}
                          coordinates={segmentCoords}
                          strokeWidth={3}
                          strokeColor="#DA5E34"
                          dashed
                        />
                      )}

                      <Polyline
                        key={`polyline-${key}`}
                        coordinates={coordinates}
                        strokeWidth={3}
                        strokeColor="#DA5E34"
                      />
                    </View>
                  )
                })}
              {this.renderPoisMap()}
            </React.Fragment>
          </Map>
          {this.state.showMessage && (
            <View
              style={{
                height: 30,
                backgroundColor:
                  this.state.messageType === 'red' ? '#464546' : '#2C74ED',
                width: '100%',
                alignItems: 'flex-start',
                justifyContent: 'center',
              }}
            >
              <Text style={{ color: 'white', marginLeft: 15 }}>
                {this.state.recordingMessage}
              </Text>
            </View>
          )}
          {this.props.record.isRecording === true && <RecordStats />}

          <RecordActions
            onPressStartRide={this.handleStartRide}
            onPressStopRide={this.handleStopRide}
            onPressPauseRide={this.handlePauseRide}
            onPressResumeRide={this.handleResumeRide}
            onPressFollowTrail={this.handleFollowTrail}
            isRecording={this.props.record.isRecording}
            isFinished={this.props.record.isFinished}
            isPaused={isPaused}
            isStartingRide={this.state.isStartingRide}
            trailFollowed={trailFollowed}
          />

          {!isEmpty(selectedPoi) && (
            <MapPoi
              poi={selectedPoi}
              reset={() => this.selectPoi({})}
              action={this.goToPOI}
            />
          )}

          <MapControl
            onPressTrails={this.handleToggleTrails}
            showTrails={showTrails}
            poiActive={showPoi}
            onPoiPress={this.togglePoi}
            onPressMapType={this.handleChangeMapType}
            onPressSetUserLocation={() => {
              this.setState({ followCamera: true }, () =>
                this.handleFocusUserLocation(true)
              )
            }}
          />
        </View>
      </SafeAreaView>
    )
  }
}

const mapStateToProps = ({ record, trails, app, auth, poi, map }) => ({
  record,
  trails,
  app,
  auth,
  poi,
  map,
})

const mapDispatchToProps = dispatch => ({
  actions: bindActionCreators(
    {
      ...trailsActions,
      ...poiActions,
      ...mapActions,
      ...recordActions,
    },
    dispatch
  ),
})

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Record)
