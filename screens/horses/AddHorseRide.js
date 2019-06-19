import React, { PureComponent } from 'react'
import {
  Alert,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
  SafeAreaView,
} from 'react-native'
import { connect } from 'react-redux'
import moment from 'moment'

import t from '@config/i18n'
import Text from '@components/Text'
import UploadProgress from '@components/UploadProgress'
import Loading from '@components/Loading'
import HeaderTitle from '@components/HeaderTitle'
import Map, { Marker, Polyline } from '@components/map/Map'
import HorseImage from '@components/HorseImage'
import Icon from '@components/Icon'
import { locationRed, locationGreen } from '@components/Icons'

import Rides from '@api/rides'
import Upload from '@api/upload'
import RecordAddRideStat from '../record/components/RecordAddRideStat'
import { calculateDistance, calculateSpeed } from '@utils'

const RidesAPI = new Rides()
const UploadAPI = new Upload()

class AddHorseRide extends PureComponent {
  static navigationOptions = {
    headerTitle: <HeaderTitle title={'horses/ridePreview'} />,
  }

  state = {
    file: null,
    uploadKey: null,
    polyline: [],
    bb: [],
    uploadDone: false,
    progress: 0,
    uploadText: null,
    distance: 0,
    duration: 0,
    averageSpeed: 0,
    dateCreated: null,
    error: false,
    loading: false,
    mapLoaded: false,
  }

  componentDidMount = async () => {
    const { file } = this.props.navigation.state.params

    if (file) {
      await this.uploadFile(file)
    }
  }

  uploadFile = async file => {
    try {
      this.setState({ uploadText: t('upload/uploadingGpx') })

      const uploadGpx = await UploadAPI.uploadGpx(file, progress => {
        this.setState({
          progress: progress / 2,
        })
      })

      if (uploadGpx && uploadGpx.key) {
        this.setState({ uploadText: t('upload/processingFile') })

        const rideCoords = await RidesAPI.convertGpxToJson(uploadGpx.key)

        const uploadJson = await UploadAPI.uploadJson(rideCoords, progress => {
          this.setState({
            progress: progress / 2 + this.state.progress,
          })
        })

        this.setState({ loading: true })
        this.processWaypoints(rideCoords)

        if (uploadJson && uploadJson.key) {
          this.setState({
            uploadKey: uploadJson.key,
            uploadDone: true,
          })
        }

        this.setState({ loading: false })
      }
    } catch (error) {
      Alert.alert(
        t('upload/uploadGpxErrorTitle'),
        t('upload/uploadGpxError'),
        [
          {
            text: t('common/ok'),
            onPress: () => this.props.navigation.goBack(null),
          },
        ],
        { cancelable: false }
      )
    }
  }

  // cancelUpload = () => {
  //   UploadAPI.cancelUpload()
  //
  //   this.setState({
  //     progress: 0,
  //     uploadDone: false,
  //   })
  // }

  processWaypoints = coords => {
    const dateCreated = coords.segments[0].date_created

    let distance = 0
    let duration = 0
    let polyline = []
    let top = null
    let right = null
    let bottom = null
    let left = null

    coords.segments.forEach((segment, segmentIndex) => {
      let tempDuration = 0

      segment.waypoints.forEach((waypoint, waypointIndex) => {
        polyline.push({
          latitude: waypoint.lat,
          longitude: waypoint.lng,
        })

        // work out edge of polyline for bb
        if (segmentIndex === 0 && waypointIndex === 0) {
          top = waypoint.lat
          bottom = waypoint.lat
          left = waypoint.lng
          right = waypoint.lng
        } else {
          if (waypoint.lat > top) top = waypoint.lat
          if (waypoint.lat < bottom) bottom = waypoint.lat
          if (waypoint.lng > right) right = waypoint.lng
          if (waypoint.lng < left) left = waypoint.lng
        }

        if (waypoint.ds > distance) {
          distance = waypoint.ds
        }

        if (waypoint.dt > tempDuration) {
          tempDuration = waypoint.dt
        }
      })

      duration += tempDuration
    })

    const rideDuration = moment.duration(duration, 'milliseconds').asSeconds()
    const averageSpeed = distance / rideDuration

    const bb = [
      { longitude: right, latitude: top },
      { longitude: left, latitude: bottom },
    ]

    this.setState({
      dateCreated,
      distance,
      duration: rideDuration,
      averageSpeed,
      polyline,
      bb,
    })
  }

  goBack = () => this.props.navigation.goBack(null)

  addRide = async () => {
    const { uploadKey } = this.state
    const { id: horseId } = this.props.horse

    const ride = await RidesAPI.uploadRide(uploadKey, horseId)
    return this.props.navigation.navigate('RideDetail', {
      rideId: ride.id,
      shouldResetRouterOnBack: true,
      resetToRide: 'Horses',
    })
  }

  goToChooseHorse = () => this.props.navigation.navigate('ChooseHorse')

  handleMapReady = () => {
    const { bb } = this.state

    this.map.fitBounds(bb)

    this.setState({
      mapLoaded: true,
    })
  }

  handleCancel = () => {
    this.props.navigation.goBack(null)
  }

  render() {
    const {
      polyline,
      progress,
      uploadText,
      uploadDone,
      distance,
      duration,
      averageSpeed,
      dateCreated,
      loading,
      mapLoaded,
    } = this.state

    const { horse, user } = this.props

    if (!uploadDone) {
      return (
        <View style={styles.container}>
          <UploadProgress
            progress={progress}
            text={uploadText}
            //onCancel={this.cancelUpload}
          />
        </View>
      )
    }

    if (loading) {
      return <Loading type="spinner" />
    }
    const unitSystem = user.account.preferences.unitSystem

    const dateText = t('record/date')
    const distanceText = t('record/distance')
    const durationText = t('record/duration')
    const avgSpeedText = t('record/avgSpeed')
    const distanceUnit = unitSystem === 'IMPERIAL' ? 'Mi' : 'KM'
    const speedUnit = unitSystem === 'IMPERIAL' ? 'MPH' : 'KM/H'

    const convertedDistance = calculateDistance(distance, unitSystem)
    const convertedSpeed = calculateSpeed(averageSpeed, unitSystem)

    return (
      <SafeAreaView style={[styles.container, { backgroundColor: '#fff' }]}>
        <View style={styles.container}>
          <View style={styles.mapContainer}>
            <Map
              ref={el => {
                if (!!el) {
                  this.map = el
                }
              }}
              scrollEnabled={true}
              onMapReady={this.handleMapReady}
              style={styles.map}
            >
              <Polyline coordinates={polyline} strokeColor="#1E8583" />

              {mapLoaded &&
                polyline && [
                  <Marker
                    key="marker-0"
                    coordinate={polyline[0]}
                    image={locationGreen}
                  />,
                  <Marker
                    key="marker-1"
                    coordinate={polyline[polyline.length - 1]}
                    image={locationRed}
                  />,
                ]}
            </Map>
          </View>

          <TouchableOpacity
            style={styles.horseContainer}
            onPress={this.goToChooseHorse}
          >
            <HorseImage horse={horse} style={styles.horseImage} />

            <TouchableOpacity
              style={styles.horseInfoContainer}
              onPress={this.goToChooseHorse}
            >
              <Text
                type="title"
                weight="bold"
                style={styles.horseName}
                text={horse.name}
              />

              {horse.relationType && horse.relationType.length > 0 && (
                <Text
                  type="title"
                  style={styles.horseRelationType}
                  text={
                    horse.relationType[0].toUpperCase() +
                    horse.relationType.slice(-(horse.relationType.length - 1))
                  }
                />
              )}
            </TouchableOpacity>
            <Icon name="arrow_right" />
          </TouchableOpacity>
          <ScrollView contentContainerStyle={styles.statsContainer}>
            <RecordAddRideStat
              value={dateCreated}
              label={dateText}
              unit="date"
              shouldShowUnit={false}
            />
            <View style={{ flexDirection: 'row' }}>
              <View style={{ flex: 1 }}>
                <RecordAddRideStat
                  value={convertedDistance}
                  label={distanceText}
                  unit={distanceUnit}
                />
                <RecordAddRideStat
                  value={convertedSpeed}
                  label={avgSpeedText}
                  unit={speedUnit}
                />
              </View>
              <View style={{ flex: 2 }}>
                <RecordAddRideStat
                  value={moment.duration(duration, 'seconds')}
                  label={durationText}
                  unit="hh:mm:ss"
                />
              </View>
            </View>
          </ScrollView>

          <View style={styles.buttonsContainer}>
            <TouchableOpacity
              onPress={this.handleCancel}
              style={[styles.buttonContainer, styles.secondaryButtonContainer]}
            >
              <Icon
                name="delete"
                style={[styles.buttonIcon, styles.secondaryButtonIcon]}
              />

              <Text
                style={[styles.buttonLabel, styles.secondaryButtonLabel]}
                message="common/cancel"
              />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={this.addRide}
              style={styles.buttonContainer}
            >
              <Text
                type="title"
                weight="bold"
                style={styles.buttonLabel}
                message="common/save"
              />
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    )
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#eaeaea',
  },
  mapContainer: {
    width: '100%',
    height: '25%',
    borderBottomWidth: 1,
    borderBottomColor: '#CCC',
  },
  horseContainer: {
    padding: 10,
    marginVertical: 15,
    flexDirection: 'row',
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#CCC',
    alignItems: 'center',
  },
  horseImage: {
    width: 70,
    height: 70,
    resizeMode: 'contain',
  },
  horseInfoContainer: {
    flex: 1,
    flexDirection: 'column',
    marginLeft: 15,
    justifyContent: 'center',
  },
  horseName: {
    color: '#7C7C7C',
    fontSize: 17,
  },
  horseRelationType: {
    color: '#7C7C7C',
  },
  statsContainer: {
    flex: 1,
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#CCC',
    paddingVertical: 10,
  },
  buttonsContainer: {
    backgroundColor: 'white',
    flexDirection: 'row',
    paddingTop: 15,
    padding: 15,
  },
  buttonContainer: {
    flex: 2,
    backgroundColor: '#1E8583',
    justifyContent: 'center',
    flexDirection: 'row',
    borderRadius: 7,
    padding: 10,
  },
  buttonLabel: {
    color: 'white',
    textAlign: 'center',
    alignSelf: 'center',
  },
  buttonIcon: {
    color: 'white',
    marginRight: 5,
  },
  secondaryButtonContainer: {
    marginRight: 10,
    flex: 1,
    backgroundColor: 'white',
    borderWidth: 2,
    borderColor: '#1E8583',
  },
  secondaryButtonIcon: {
    color: '#1E8583',
  },
  secondaryButtonLabel: {
    color: '#1E8583',
  },
})

const mapStateToProps = ({ horses, user }) => ({
  horse: horses.horses[0].horse || {},
  user: user.user,
})

export default connect(mapStateToProps)(AddHorseRide)
