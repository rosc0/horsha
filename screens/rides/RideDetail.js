import React, { Component } from 'react'
import {
  Alert,
  Animated,
  Dimensions,
  Image,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
  Share,
  PermissionsAndroid,
  Platform,
  BackHandler,
} from 'react-native'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import { VictoryPie } from 'victory-native'
import ActionSheet from 'rn-action-sheet'
import idx from 'idx'
import Map, { Marker, Polyline } from '@components/map/Map'
import Text from '@components/Text'
import Icon from '@components/Icon'
import HorseImage from '@components/HorseImage'
import Button from '@components/Button'
import Loading from '@components/Loading'
import Distance from '@components/Distance'
import Speed from '@components/Speed'
import TrailPolyline from '@components/TrailPolyline'

import * as horsesActions from '@actions/horses'
import * as galleryActions from '@actions/gallery'
import * as trailsActions from '@actions/trails'
import * as ridesActions from '@actions/rides'

import t from '@config/i18n'
import TrailPassed from './components/TrailPassed'
import SpeedElevationGraph from './components/SpeedElevationGraph'
import BackButton from '@components/BackButton'
import HeaderTitle from '@components/HeaderTitle'

import {
  calculateDuration,
  calculateSpeed,
  fromNowDate,
  padZero,
} from '@application/utils'
import { theme } from '@styles/theme'

import Rides from '@api/rides'
import Upload from '@api/upload'
import { locationGreen, locationRed } from '@components/Icons'
import { arrowIcon } from '@components/Icons'

const { width: deviceWidth, height } = Dimensions.get('window')
const RidesAPI = new Rides()
const UploadAPI = new Upload()

const MAP_HEIGHT = 150
const deviceHeight = height - 60

class RideDetail extends Component {
  state = {
    ride: {},
    calculated: false,
    rideData: [],
    trailsPassed: [],
    speedStats: [],
    speedPolyCoords: [],
    mapLoaded: false,
    mapHeight: new Animated.Value(MAP_HEIGHT),
    addTrailImageId: null,
    showMap: false,
    progress: {},
    showUpload: {},
    levels: [],
    totalDescent: 0,
    totalAscent: 0,
  }

  static navigationOptions = ({ navigation }) => ({
    headerTitle: <HeaderTitle title={'rideDetail/ridesTitle'} />,
    tabBarVisible: false,
    headerLeft: (
      <BackButton
        onPress={
          navigation.state.params && navigation.state.params.handleBackButton
        }
      />
    ),
  })

  componentDidMount() {
    BackHandler.addEventListener('hardwareBackPress', this.handleBackPress)
    this.props.navigation.setParams({
      handleBackButton: this.handleBackButton,
    })

    this.requestDetails()
  }

  requestDetails = async () => {
    const { rideId } = this.props.navigation.state.params

    const ride = await this.props.actions.getRideById(rideId)

    const json = await fetch(ride.value.full_track_url)
    const rideData = await json.json()

    this.setLevels(ride.value)
    this.processRide(rideData, this.state.levels)

    this.setState({
      rideData,
      calculated: true,
    })

    if (ride.value.nr_of_trail_rides > 0) {
      this.props.actions.getTrailsPassed(rideId)
    }
  }

  async UNSAFE_componentWillReceiveProps(prevProps, nextProps) {
    if (nextProps.gallery && nextProps.gallery.length) {
      const { actions, gallery } = this.props
      const { addTrailImageId } = this.state

      if (addTrailImageId && gallery[0]) {
        this.setState({
          showUpload: {
            ...this.state.showUpload,
            [addTrailImageId]: true,
          },
        })

        const imageUpload = await UploadAPI.uploadImage(
          gallery[0],
          progress => {
            this.setState({
              progress: {
                ...this.state.progress,
                [addTrailImageId]: progress,
              },
            })
          }
        )

        if (imageUpload && imageUpload.key) {
          await actions.addTrailImage(addTrailImageId, imageUpload.key)
        }

        this.setState({
          showUpload: {
            ...this.state.showUpload,
            [addTrailImageId]: false,
          },
        })
      }
    }
  }

  handleBackPress = () => {
    this.handleBackButton() // works best when the goBack is async
    return true
  }

  handleBackButton = () => {
    const { mapHeight } = this.state
    const isMapFullscreen = mapHeight._value === deviceHeight
    const { params } = this.props.navigation.state
    if (isMapFullscreen && !!this.state.showMap) {
      this.setState({ showMap: false })
      return this.toggleMapSize()
    }

    if (params && params.shouldResetRouterOnBack) {
      return this.props.navigation.navigate('HorseRides', {
        horseId: this.props.ride.horse.id,
      })
    }

    return this.props.navigation.goBack()
  }

  toggleMapSize = () => {
    const { mapHeight } = this.state
    const isMapFullscreen = mapHeight._value === deviceHeight

    this.setState({ showMap: !this.state.showMap })
    Animated.timing(mapHeight, {
      toValue: isMapFullscreen ? MAP_HEIGHT : deviceHeight,
      duration: 200,
    }).start()
  }

  toggleDropDown = ride => {
    const canDelete = ride.can_delete

    const shareFile = 'More'
    const downloadFile = t('rideDetail/downloadFile')
    const deleteRide = t('rideDetail/deleteRide')
    const cancelText = t('common/cancel')

    ActionSheet.show(
      {
        options: canDelete
          ? [downloadFile, shareFile, deleteRide, cancelText]
          : [downloadFile, shareFile, cancelText],
        cancelButtonIndex: canDelete ? 4 : 3,
        tintColor: theme.secondaryColor,
      },
      async index => {
        switch (index) {
          case 0: {
            return this.downloadFile(ride.full_track_url)
          }
          case 1: {
            return this.shareFile(ride.full_track_url)
          }
          case 2: {
            return canDelete ? this.confirmDeleteRide(ride) : null
          }
        }
      }
    )
  }

  createTrail = ride => {
    this.props.navigation.navigate('Create', {
      type: 'ride',
      ride: ride,
      callback: this.requestDetails,
      shouldResetRouterOnBack: true,
    })
  }

  downloadFile = async rideUrl => {
    let permissionsGranted

    if (Platform.OS === 'android') {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
        {
          title: t('permissions/storageTitle'),
          message: t('permissions/storageMessage'),
        }
      )
      permissionsGranted = granted === PermissionsAndroid.RESULTS.GRANTED
    } else {
      permissionsGranted = true
    }

    if (permissionsGranted) {
      await RidesAPI.downloadRide(rideUrl)
    } else {
      Alert.alert(null, t('permissions/needStorageDownload'), [
        {
          text: t('common/ok'),
          onPress: () => {},
        },
      ])
    }
  }

  shareFile = rideUrl => {
    // TODO: Improve this informations
    Share.share(
      {
        message: t('share/message'),
        url: rideUrl,
        title: t('share/title'),
      },
      {
        // Android only:
        dialogTitle: t('share/dialogTitle'),
      }
    )
  }

  confirmDeleteRide = ride => {
    const areYouSureText = t('rideDetail/areYouSureText')
    const deleteRide = t('rideDetail/deleteRide')
    const cancelText = t('common/cancel')

    ActionSheet.show(
      {
        title: areYouSureText,
        options: [deleteRide, cancelText],
        cancelButtonIndex: 1,
        tintColor: theme.secondaryColor,
      },
      async index => {
        switch (index) {
          case 0: {
            return this.deleteRide(ride)
          }
        }
      }
    )
  }

  async deleteRide(ride) {
    await RidesAPI.deleteRide(ride.id)

    this.props.navigation.navigate('HorseRides', {
      horseId: ride.horse.id,
      callback: this.requestDetails,
    })
  }

  addToJournal = ride => {
    this.props.actions.setHorse(ride.horse)

    this.props.navigation.navigate('AddJournalPostModal', {
      ride: ride,
      goBackRoute: 'HorseJournal',
      goBackData: {
        horseId: ride.horse.id,
      },
      callback: this.requestDetails,
    })
  }

  processRide = (waypointsJson, levels) => {
    const speedStats = []
    const polyCoords = []
    let totalDistance = 0
    let totalAscent = 0
    let totalDescent = 0

    // set base stats for each level
    for (let i = 0; i < levels.length + 1; i++) {
      speedStats.push({
        distance: 0,
        time: 0,
        distancePercent: 0,
      })
    }

    waypointsJson.segments.forEach((trackSegment, segmentKey) => {
      let polyLevel = null
      let prevPoint = null
      let prevPolyLevel = null
      let segmentCoords = []
      let tempCoords = []

      trackSegment.waypoints.forEach(wayPoint => {
        // get level at which to set this waypoint to
        polyLevel = this.getSpeedLevel(wayPoint)

        if (prevPoint) {
          // distance/time travelled between last waypoint
          let d_distance = wayPoint.ds - prevPoint.ds
          let d_timestamp = wayPoint.dt - prevPoint.dt

          // get current speed level index
          let curLevel = levels.length
          for (let i = 0; i < levels.length; i++) {
            if (wayPoint.v < levels[i]) {
              curLevel = i
              break
            }
          }

          // add to totals for speed stats (graph)
          speedStats[curLevel].distance += d_distance
          speedStats[curLevel].time += d_timestamp
          totalDistance += d_distance

          // if this and prev level different add to main array with colour of line as key
          if (prevPolyLevel !== polyLevel) {
            segmentCoords.push({ level: prevPolyLevel, coords: tempCoords })
            tempCoords = [{ longitude: prevPoint.lng, latitude: prevPoint.lat }]
          }

          // get total ascent/descent
          if (wayPoint.alt < prevPoint.alt) {
            totalDescent += prevPoint.alt - wayPoint.alt
          }
          if (wayPoint.alt > prevPoint.alt) {
            totalAscent += wayPoint.alt - prevPoint.alt
          }
        }

        // add to temp array to group all that speed together
        tempCoords.push({ longitude: wayPoint.lng, latitude: wayPoint.lat })

        // save last level and waypoint to compare
        prevPolyLevel = polyLevel
        prevPoint = wayPoint
      })

      // add last in temp array before we start next segment
      if (polyLevel && tempCoords.length) {
        segmentCoords.push({ level: polyLevel, coords: tempCoords })
      }

      polyCoords[segmentKey] = segmentCoords
    })

    if (totalDistance > 0) {
      for (let i = 0; i < levels.length + 1; i++) {
        speedStats[i].distancePercent = Math.round(
          (100 * speedStats[i].distance) / totalDistance
        )
      }
    }

    this.setState({
      totalDescent,
      totalAscent,
      speedStats,
      speedPolyCoords: polyCoords,
    })
  }

  getSpeedLevel = wayPoint => {
    let prevPolyLevel = null

    if (wayPoint.v < this.state.levels[0]) {
      prevPolyLevel = 'green'
    } else if (
      wayPoint.v >= this.state.levels[0] &&
      wayPoint.v <= this.state.levels[1]
    ) {
      prevPolyLevel = 'yellow'
    } else if (wayPoint.v > this.state.levels[0]) {
      prevPolyLevel = 'red'
    }

    return prevPolyLevel
  }

  setLevels = ride => {
    const lowLevel = Math.round(ride.max_speed * 0.33)
    const highLevel = Math.round(ride.max_speed * 0.66)

    this.setState({
      levels: [lowLevel, highLevel],
    })

    // let lowSpeed = null
    // let highSpeed = null
    // waypointsJson.segments.map(trackSegment => {
    //   trackSegment.waypoints.map(wayPoint => {
    //     if (wayPoint.v > highSpeed) {
    //       highSpeed = wayPoint.v
    //     }
    //     if (wayPoint.v < lowSpeed) {
    //       lowSpeed = wayPoint.v
    //     }
    //   })
    // })
    //
    // const lowSpeedRounded = Math.floor(lowSpeed)
    // const highSpeedRounded = Math.ceil(highSpeed)
    // const range = highSpeedRounded - lowSpeedRounded
    // const levels = [Math.floor(range * 0.33), Math.ceil(range * 0.66)]
    //
    // this.setState({
    //   levels,
    //   lowSpeed: lowSpeedRounded,
    //   highSpeed: highSpeedRounded,
    // })
  }

  handleMapReady = () => {
    const { ride } = this.props

    this.map.fitBounds([
      ride.bounding_box.top_right,
      ride.bounding_box.bottom_left,
    ])

    this.setState({
      mapLoaded: true,
    })
  }

  addTrailPhoto = trailId => {
    const optionsTitleText = t('gallery/optionsTitle')
    const takePictureText = t('gallery/takePicture')
    const chooseFromGalleryText = t('gallery/chooseFromGallery')
    const cancelText = t('common/cancel')

    this.setState({ addTrailImageId: trailId })

    this.props.actions.clearImages()

    ActionSheet.show(
      {
        title: optionsTitleText,
        options: [takePictureText, chooseFromGalleryText, cancelText],
        cancelButtonIndex: 2,
        tintColor: theme.secondaryColor,
      },
      async index => {
        switch (index) {
          case 0: {
            return this.props.navigation.navigate('TakePicture', {
              callback: true,
            })
          }
          case 1: {
            return this.props.navigation.navigate('Gallery', {
              callback: true,
            })
          }
        }
      }
    )
  }

  addTrailReview = trail => {
    this.props.navigation.navigate('CreateReview', {
      data: {
        id: trail.id,
        reviews: trail.nr_of_reviews,
        callback: this.requestDetails,
      },
    })
  }

  addTrailPoint = trail => {
    const { navigate, state } = this.props.navigation

    return navigate('CreatePOI', {
      data: {
        origin: trail,
        trail: {
          longitude:
            (trail.bounding_box.bottom_left.longitude +
              trail.bounding_box.top_right.longitude) /
            2,
          latitude:
            (trail.bounding_box.bottom_left.latitude +
              trail.bounding_box.top_right.latitude) /
            2,
          file: trail.full_waypoint_list_url,
        },
        chooseLocation: false,
        callback: this.requestDetails,
        parentKey: state.routeName,
      },
    })
  }

  toggleTrailFavourite = async trail => {
    const { trailsPassed } = this.state

    const toggle = await this.props.actions.toggleTrailFavorite(
      !!trail.trail_favorite_id,
      trail.id,
      trail.trail_favorite_id
    )

    trailsPassed.length > 0 &&
      trailsPassed.map(trailPassed => {
        if (trailPassed.trail.id === trail.id) {
          if (trailPassed.trail.trail_favorite_id) {
            delete trailPassed.trail.trail_favorite_id
          } else {
            if (toggle.value && toggle.value.id) {
              trailPassed.trail.trail_favorite_id = toggle.value.id
            }
          }
        }
        return trailPassed
      })

    this.setState({ trailsPassed })
  }

  createPOI = ({ geometry }) => {
    const { navigate, state } = this.props.navigation
    navigate('CreatePOI', {
      data: {
        coords: {
          longitude: geometry.coordinates[0],
          latitude: geometry.coordinates[1],
        },
        parentKey: state.routeName,
      },
    })
  }

  componentWillUnmount() {
    BackHandler.removeEventListener('hardwareBackPress', this.handleBackPress)
  }

  render() {
    const {
      calculated,
      mapLoaded,
      speedPolyCoords,
      mapHeight,
      showMap,
      progress,
      showUpload,
      totalDescent,
      totalAscent,
    } = this.state
    const { ride } = this.props
    // const { trailsPassed } = this.props.rides
    const firstSpeed = this.state.speedStats[0]
    const secondSpeed = this.state.speedStats[1]
    const thirdSpeed = this.state.speedStats[2]

    const { user } = this.props
    const idxTrails =
      idx(this.props.rides.trailsPassed, _ => _.collection) || []
    if (!calculated) {
      return <Loading type="spinner" />
    }
    const hasTrails = ride.nr_of_trail_rides > 0

    const pieData = [
      { x: null, y: firstSpeed.distancePercent, fill: theme.chartGreen },
      { x: null, y: secondSpeed.distancePercent, fill: theme.chartYellow },
      { x: null, y: thirdSpeed.distancePercent, fill: theme.chartRed },
    ]

    const unitSystem = user.account.preferences.unitSystem
    const speedUnit = unitSystem === 'IMPERIAL' ? 'MPH' : 'KM/H'
    const distanceUnit = unitSystem === 'IMPERIAL' ? 'ml' : 'km'
    const sizeUnit = unitSystem === 'IMPERIAL' ? 'inches' : 'meters'

    const firstCoord = speedPolyCoords[0][0].coords[0]

    const lastSection = speedPolyCoords[speedPolyCoords.length - 1]
    const lastSectionCoords = lastSection[lastSection.length - 1]
    const lastCoord =
      lastSectionCoords.coords[lastSectionCoords.coords.length - 1]

    return (
      <ScrollView style={styles.wrapper}>
        <Animated.View style={[styles.map, { height: mapHeight }]}>
          {!!showMap ? (
            <Map
              ref={el => {
                if (!!el) {
                  this.map = el
                }
              }}
              onPress={() => this.toggleMapSize()}
              onLongPress={this.createPOI}
              scrollEnabled={true}
              compassEnabled={false}
              rotateEnabled={false}
              onMapReady={this.handleMapReady}
              style={[styles.map, StyleSheet.absoluteFill]}
            >
              {speedPolyCoords.map((segment, key) => {
                // get last coords from the previous segment, and the first from the current segment
                let segmentCoords = null
                if (key > 0) {
                  const prevSegment = speedPolyCoords[key - 1]
                  const lastLine = prevSegment[prevSegment.length - 1]
                  segmentCoords = [
                    lastLine.coords[lastLine.coords.length - 1],
                    segment[0].coords[0],
                  ]
                }

                return (
                  <View key={`polyline-view-${key}`}>
                    {segmentCoords && (
                      <Polyline
                        key={`polyline-dashed-${key}`}
                        coordinates={segmentCoords}
                        strokeWidth={4}
                        strokeColor="#278583"
                        dashed
                      />
                    )}

                    {segment.map((line, lineKey) => {
                      let color = '#278583'
                      if (line.level === 'yellow') {
                        color = '#F39200'
                      } else if (line.level === 'red') {
                        color = '#CA3F28'
                      }

                      return (
                        <Polyline
                          key={`polyline-${key}${lineKey}`}
                          coordinates={line.coords}
                          strokeWidth={4}
                          strokeColor={color}
                        />
                      )
                    })}
                  </View>
                )
              })}

              {mapLoaded && [
                <Marker
                  key="marker-0"
                  coordinate={firstCoord}
                  image={locationGreen}
                />,
                <Marker
                  key="marker-1"
                  coordinate={lastCoord}
                  image={locationRed}
                />,
              ]}
            </Map>
          ) : (
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => this.toggleMapSize()}
              style={styles.map}
            >
              <TrailPolyline
                coordsFile={ride.preview_track_url}
                boundBox={ride.bounding_box}
              />
            </TouchableOpacity>
          )}
        </Animated.View>

        <View style={styles.userInfo}>
          <HorseImage horse={ride.horse} style={styles.horseImage} />
          <View style={styles.rideTitleContainer}>
            <Text
              weight="semiBold"
              type="title"
              message="rideDetail/userRideWithHorse"
              values={{
                userName: (
                  <Text
                    type="title"
                    text={ride.user.name}
                    style={[styles.title, styles.greenText]}
                  />
                ),
                horseName: (
                  <Text
                    type="title"
                    text={ride.horse.name}
                    style={[styles.title, styles.greenText]}
                  />
                ),
              }}
              style={styles.title}
            />
            <Text text={fromNowDate(ride.date_recorded)} style={styles.date} />
          </View>
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => this.toggleDropDown(ride)}
          >
            <Image source={arrowIcon} style={styles.dropDownArrow} />
          </TouchableOpacity>
        </View>

        <View style={styles.separator} />

        <View style={styles.paddedContainer}>
          <Button
            label={'rideDetail/addToJournal'}
            onPress={() => this.addToJournal(ride)}
            style={styles.addToJournal}
          />
        </View>

        <View style={styles.separator} />

        <View style={styles.paddedContainer}>
          <View style={styles.row}>
            <Icon name="stats" style={styles.icon} />
            <Text
              weight="bold"
              type="title"
              message="rideDetail/stats"
              style={styles.sectionTitle}
            />
          </View>

          {this.state.rideData && (
            <View>
              <View style={styles.statsRow}>
                <View style={styles.statBlock}>
                  <Distance
                    distance={ride.distance}
                    rowStyle={styles.statsDetailRow}
                    distanceStyle={styles.statsTextBig}
                    unitStyle={styles.statsUnit}
                  />
                  <Text
                    message="rideDetail/distance"
                    style={styles.statTitle}
                  />
                </View>
                <View style={styles.statBlock}>
                  <View style={styles.statsDetailRow}>
                    <Text
                      weight={'semiBold'}
                      text={calculateDuration(ride.duration)}
                      style={styles.statsTextBig}
                    />
                  </View>
                  <Text
                    message="rideDetail/duration"
                    style={styles.statTitle}
                  />
                </View>
              </View>

              <View style={styles.statsRow}>
                <View style={styles.statBlock}>
                  <View style={styles.row}>
                    <Icon name="arrow_ascent" style={styles.descentArrow} />
                    <Distance
                      distance={totalAscent}
                      rowStyle={styles.statsDetailRow}
                      distanceStyle={styles.statsTextBig}
                      unitStyle={styles.statsUnit}
                      elevation
                    />
                  </View>
                  <Text message="rideDetail/ascent" style={styles.statTitle} />
                </View>

                <View style={styles.statBlock}>
                  <View style={styles.row}>
                    <Icon name="arrow_descent" style={styles.descentArrow} />
                    <Distance
                      distance={totalDescent}
                      rowStyle={styles.statsDetailRow}
                      distanceStyle={styles.statsTextBig}
                      unitStyle={styles.statsUnit}
                      elevation
                    />
                  </View>
                  <Text message="rideDetail/descent" style={styles.statTitle} />
                </View>
              </View>

              <View style={styles.statsRow}>
                <View style={styles.statBlock}>
                  <Speed
                    speed={ride.avg_speed}
                    rowStyle={styles.statsDetailRow}
                    speedStyle={styles.statsTextBig}
                    unitStyle={styles.statsUnit}
                  />
                  <Text
                    message="rideDetail/avgSpeed"
                    style={styles.statTitle}
                  />
                </View>
                <View style={styles.statBlock}>
                  <Speed
                    speed={ride.max_speed}
                    rowStyle={styles.statsDetailRow}
                    speedStyle={styles.statsTextBig}
                    unitStyle={styles.statsUnit}
                  />
                  <Text
                    message="rideDetail/maxSpeed"
                    style={styles.statTitle}
                  />
                </View>
              </View>

              <View style={[styles.statsGraphContainer, styles.row]}>
                <VictoryPie
                  animate={{ duration: 500 }}
                  padding={{ top: 0, right: 0, bottom: 0, left: 0 }}
                  width={95}
                  height={95}
                  innerRadius={30}
                  colorScale={[
                    theme.secondaryColor,
                    theme.chartYellow,
                    theme.chartRed,
                  ]}
                  data={pieData}
                />
                <View style={styles.statsGraphDetails}>
                  <View style={styles.speedStatRow}>
                    <View
                      style={[
                        styles.speedStatRow,
                        { justifyContent: 'flex-end', width: 35 },
                      ]}
                    >
                      <Text
                        weight="semiBold"
                        text={padZero(firstSpeed.distancePercent)}
                        style={[styles.statsText]}
                      />
                      <Text text="%" style={styles.statsUnitText} />
                    </View>
                    <Text
                      weight="semiBold"
                      text={calculateDuration(firstSpeed.time)}
                      style={[styles.statsText, styles.paddingLeft]}
                    />
                    <Text
                      message="horseRides/minutes"
                      style={styles.statsUnitText}
                    />
                    <Text
                      message="rideDetail/belowLow"
                      values={{
                        lowValue: calculateSpeed(
                          this.state.levels[0],
                          unitSystem
                        ),
                        unit: speedUnit,
                      }}
                      style={[
                        styles.statsUnitText,
                        styles.paddingLeft,
                        styles.greenText,
                      ]}
                    />
                  </View>

                  <View style={styles.speedStatRow}>
                    <View
                      style={[
                        styles.speedStatRow,
                        { justifyContent: 'flex-end', width: 35 },
                      ]}
                    >
                      <Text
                        weight="semiBold"
                        text={padZero(secondSpeed.distancePercent)}
                        style={[styles.statsText]}
                      />
                      <Text text="%" style={styles.statsUnitText} />
                    </View>
                    <Text
                      weight="semiBold"
                      text={calculateDuration(secondSpeed.time)}
                      style={[styles.statsText, styles.paddingLeft]}
                    />
                    <Text
                      message="horseRides/minutes"
                      style={styles.statsUnitText}
                    />
                    <Text
                      message="rideDetail/betweenLowHigh"
                      values={{
                        lowValue: calculateSpeed(
                          this.state.levels[0],
                          unitSystem
                        ),
                        highValue: calculateSpeed(
                          this.state.levels[1],
                          unitSystem
                        ),
                        unit: speedUnit,
                      }}
                      style={[
                        styles.statsUnitText,
                        styles.paddingLeft,
                        styles.yellowText,
                      ]}
                    />
                  </View>

                  <View style={styles.speedStatRow}>
                    <View
                      style={[
                        styles.speedStatRow,
                        { justifyContent: 'flex-end', width: 35 },
                      ]}
                    >
                      <Text
                        weight="semiBold"
                        text={padZero(thirdSpeed.distancePercent)}
                        style={[styles.statsText]}
                      />
                      <Text text="%" style={styles.statsUnitText} />
                    </View>
                    <Text
                      weight="semiBold"
                      text={calculateDuration(thirdSpeed.time)}
                      style={[styles.statsText, styles.paddingLeft]}
                    />
                    <Text
                      message="horseRides/minutes"
                      style={styles.statsUnitText}
                    />
                    <Text
                      message="rideDetail/overHigh"
                      values={{
                        highValue: calculateSpeed(
                          this.state.levels[1],
                          unitSystem
                        ),
                        unit: speedUnit,
                      }}
                      style={[
                        styles.statsUnitText,
                        styles.paddingLeft,
                        styles.redText,
                      ]}
                    />
                  </View>
                </View>
              </View>
            </View>
          )}
        </View>

        <View style={styles.separator} />

        <View style={styles.paddedContainer}>
          <View style={styles.row}>
            <Icon name="elevation" style={styles.icon} />
            <Text
              weight="bold"
              type="title"
              message="rideDetail/speedTitle"
              values={{
                unit: speedUnit,
              }}
              style={styles.sectionTitle}
            />
          </View>
        </View>

        {this.state.rideData && (
          <SpeedElevationGraph speed rideData={this.state.rideData} />
        )}

        <View style={styles.separator} />

        <View style={styles.paddedContainer}>
          <View style={styles.row}>
            <Icon name="elevation" style={styles.icon} />
            <Text
              weight="bold"
              type="title"
              message="rideDetail/elevationTitle"
              values={{
                unit: sizeUnit,
              }}
              style={styles.sectionTitle}
            />
          </View>
        </View>

        {this.state.rideData && (
          <SpeedElevationGraph elevation rideData={this.state.rideData} />
        )}

        <View style={styles.trailsOnRideContainer}>
          <View style={styles.row}>
            <Icon name="trails" style={styles.icon} />
            <Text
              weight="bold"
              type="title"
              message="rideDetail/trailsOnThisRide"
              values={{
                nrOfTrails: ride.nr_of_trail_rides,
              }}
              style={styles.sectionTitle}
            />
          </View>
        </View>

        {hasTrails &&
          idxTrails &&
          idxTrails.length > 0 &&
          idxTrails.map(trailPassed => (
            <TrailPassed
              key={`trail-${trailPassed.trail.id}`}
              trail={trailPassed.trail}
              addTrailPhoto={this.addTrailPhoto}
              addTrailReview={this.addTrailReview}
              addTrailPoint={this.addTrailPoint}
              toggleTrailFavourite={this.toggleTrailFavourite}
              navigation={this.props.navigation}
              showUpload={showUpload[trailPassed.trail.id] || false}
              progress={progress[trailPassed.trail.id] || 0}
              callback={this.requestDetails}
            />
          ))}

        {!hasTrails && (
          <View>
            <View style={styles.noTrails}>
              <Text message="rideDetail/youPassedNoTrails" />
            </View>
          </View>
        )}

        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => this.createTrail(ride)}
          style={styles.buttonContainer}
        >
          <View style={styles.greenButtonContainer}>
            <Image
              source={require('../../images/plus.png')}
              style={styles.buttonPlus}
            />
            <Text
              type="title"
              weight="bold"
              style={styles.greenButtonIconText}
              message="rideDetail/createTrail"
            />
          </View>
        </TouchableOpacity>
      </ScrollView>
    )
  }
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    backgroundColor: 'white',
  },
  paddedContainer: {
    padding: 15,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  userInfo: {
    padding: 15,
    flexDirection: 'row',
  },
  title: {
    ...theme.font.userName,
    color: theme.fontColorDark,
  },
  greenText: {
    color: theme.secondaryColor,
  },
  horseImage: {
    width: 90,
    height: 90,
  },
  rideTitleContainer: {
    flex: 1,
    paddingHorizontal: 10,
  },
  date: {
    ...theme.font.date,
  },
  dropDownArrow: {
    width: 20,
    height: 20,
    resizeMode: 'contain',
  },
  separator: {
    marginHorizontal: 15,
    borderTopWidth: 1,
    borderTopColor: theme.border,
  },
  icon: {
    fontSize: 28,
  },
  sectionTitle: {
    paddingLeft: 8,
    fontSize: theme.font.sizes.defaultPlus,
    color: theme.fontColorDark,
  },
  noTrails: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: theme.border,
  },
  trailsOnRideContainer: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: theme.border,
  },
  buttonContainer: {
    alignItems: 'center',
    paddingVertical: 15,
  },
  greenButtonContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'transparent',
    borderRadius: 4,
    borderColor: theme.secondaryColor,
    borderWidth: 1,
  },
  buttonPlus: {
    height: 13,
    width: 13,
    marginLeft: 8,
    marginRight: 4,
  },
  greenButtonIconText: {
    color: theme.secondaryColor,
    fontSize: theme.font.sizes.smallest,
    paddingVertical: 8,
    paddingRight: 8,
  },
  addToJournal: {
    width: '100%',
  },
  statBlock: {
    width: 120,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginTop: 15,
  },
  statsDetailRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  statsText: {
    ...theme.font.rideStatusNumber,
  },
  statsTextBig: {
    ...theme.font.rideStatusNumberBig,
  },
  statsUnitText: {
    marginTop: 6,
    paddingLeft: 4,
    ...theme.font.rideStatusLabel,
  },
  statsUnit: {
    paddingLeft: 4,
    marginBottom: 2,
    ...theme.font.rideStatusLabel,
    marginTop: 6,
  },
  statTitle: {
    fontSize: theme.font.sizes.smallest,
    color: theme.fontColorLight,
  },
  statsGraphContainer: {
    marginTop: 20,
  },
  statsGraphDetails: {
    flex: 1,
    paddingLeft: 5,
  },
  descentArrow: {
    // fontSize: 16,
    width: 26,
    height: 26,
    // marginRight: 5,
  },
  speedStatRow: {
    flexDirection: 'row',
  },
  paddingLeft: {
    paddingLeft: 10,
  },
  yellowText: {
    color: theme.chartYellow,
  },
  redText: {
    color: theme.chartRed,
  },
  map: {
    width: deviceWidth,
    position: 'relative',
  },
})

const mapStateToProps = ({ user, gallery, rides }) => ({
  user: user.user,
  gallery: gallery.images,
  rides,
  ride: rides.rideDetails,
})

const mapDispatchToProps = dispatch => ({
  actions: bindActionCreators(
    {
      ...horsesActions,
      ...galleryActions,
      ...trailsActions,
      ...ridesActions,
    },
    dispatch
  ),
})

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(RideDetail)
