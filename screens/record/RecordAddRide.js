import React, { PureComponent } from 'react'
import {
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
  SafeAreaView,
} from 'react-native'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import { NavigationActions } from 'react-navigation'
import BackgroundGeolocation from 'react-native-background-geolocation-android'
import moment from 'moment'
import idx from 'idx'
import { calculateDistance, calculateSpeed, calculateMaxSpeed } from '@utils'
import t from '@config/i18n'
import * as recordActions from '@actions/record'
import * as horsesActions from '@actions/horses'

import Map, { Marker, Polyline } from '@components/map/Map'
import RecordAddRideStat from './components/RecordAddRideStat'
import Loading from '@components/Loading'
import Text from '@components/Text'
import HeaderTitle from '@components/HeaderTitle'
import Icon from '@components/Icon'
import { locationRed, locationGreen, defaultHorse } from '@components/Icons'

class RecordAddRide extends PureComponent {
  state = {
    fetchingSelectedHorse: true,
    shouldFetchHorseOnDeviceConnected: false,
    mapLoaded: false,
  }

  static navigationOptions = {
    headerTitle: <HeaderTitle title={'record/addToRidesTitle'} />,
    tabBarVisible: false,
  }

  componentDidMount() {
    this.handlePreselectHorse()
  }

  componentDidUpdate(prevProps) {
    if (
      prevProps.horses.horses !== this.props.horses.horses &&
      this.state.fetchingSelectedHorse
    ) {
      return this.handleSelectHorse(this.props.horses.horses[0])
    }

    if (
      !prevProps.app.isDeviceConnected &&
      prevProps.app.isDeviceConected !== this.props.app.isDeviceConnected
    ) {
      this.setState({
        shouldFetchHorseOnDeviceConnected: false,
      })
      return this.handlePreselectHorse()
    }
  }

  handlePreselectHorse = () => {
    if (!this.props.app.isDeviceConnected) {
      return this.setState({
        shouldFetchHorseOnDeviceConnected: true,
      })
    }

    const { horses } = this.props

    if (horses.horse && horses.horse.id) {
      return this.setState({
        fetchingSelectedHorse: false,
      })
    }

    return this.props.actions.getHorses(1)
  }

  handleSelectHorse = async ({ horse, relation_type: relationType }) => {
    await this.props.actions.setHorse({
      ...horse,
      relationType,
    })

    this.setState({
      fetchingSelectedHorse: false,
    })
  }

  handleMapReady = async () => {
    const { locations } = this.props.record

    if (!locations.length) {
      return
    }

    const coordinates = locations.reduce(
      (allCoordinates, coordinate) => [
        ...allCoordinates,
        ...coordinate.coordinates,
      ],
      []
    )

    await this.map.fitBounds(coordinates, {
      shouldCalculateBounds: true,
    })

    this.setState({
      mapLoaded: true,
    })
  }

  handleSaveRide = async () => {
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
            onPress: this.handleSaveRide,
            style: 'default',
          },
        ],
        { cancelable: false }
      )
    }

    try {
      const ride = await this.props.actions.saveRide()
      if (!ride.id) {
        console.log('error with ride id', ride)
        throw new Error()
      }

      BackgroundGeolocation.stop()
      await this.props.actions.clearRecording()
      return this.goToRideDetail(ride.id)
    } catch (err) {
      console.log('Error saving record', err)

      alert(t('record/error'))
    }
  }

  goToRideDetail = rideId =>
    this.props.navigation.navigate('RideDetail', {
      rideId,
      shouldResetRouterOnBack: true,
      resetToRide: 'RecordModal',
    })

  goToChooseHorse = () =>
    this.props.navigation.navigate('ChooseHorse', {
      nextRoute: 'AddRide',
    })

  goBackToRecord = () => {
    const resetAction = NavigationActions.navigate({
      index: 0,
      actions: [
        NavigationActions.navigate({
          routeName: 'RecordModal',
        }),
      ],
    })

    return this.props.navigation.dispatch(resetAction)
  }

  handleDeleteRide = () =>
    Alert.alert(t('record/deleteRecording'), null, [
      {
        text: t('common/cancel'),
        onPress: () => {},
      },
      {
        text: t('common/delete'),
        onPress: this.handleProceedDeleteRide,
        style: 'default',
      },
    ])

  handleProceedDeleteRide = () => {
    this.props.actions.clearRecording()
    this.props.navigation.goBack(null)
  }

  getLastLocation = () => {
    const { locations } = this.props.record

    if (!locations.length) {
      return
    }

    const lastLocationIndex = locations.length - 1
    const lastCoordinateIndex =
      locations[lastLocationIndex].coordinates.length - 1

    if (lastCoordinateIndex === -1) {
      return locations[lastLocationIndex - 1].coordinates[
        locations[lastLocationIndex - 1].coordinates.length - 1
      ]
    }

    return locations[lastLocationIndex].coordinates[lastCoordinateIndex]
  }

  renderSelectedHorse = () => {
    if (!this.props.app.isDeviceConnected) {
      return (
        <View style={styles.horseLoadingContainer}>
          <Text
            message="record/deviceNotConnected"
            style={styles.deviceNotConnectedText}
          />
        </View>
      )
    }

    if (this.state.fetchingSelectedHorse) {
      return (
        <View style={styles.horseLoadingContainer}>
          <Loading type="spinner" />
        </View>
      )
    }

    const {
      name,
      profile_picture: horseImage,
      relationType,
    } = this.props.horses.horse

    const imageSource = idx(horseImage, _ => _.url)
      ? { uri: idx(horseImage, _ => _.url) }
      : defaultHorse

    return (
      <TouchableOpacity
        style={styles.horseContainer}
        onPress={this.goToChooseHorse}
      >
        <Image
          source={imageSource}
          style={styles.horseImage}
          resizeMode="cover"
        />

        <TouchableOpacity
          style={styles.horseInfoContainer}
          onPress={this.goToChooseHorse}
        >
          <Text
            type="title"
            weight="bold"
            style={styles.horseName}
            text={name}
          />

          {relationType && relationType.length > 0 && (
            <Text
              type="title"
              style={styles.horseRelationType}
              text={
                relationType[0].toUpperCase() +
                relationType.slice(-(relationType.length - 1))
              }
            />
          )}
        </TouchableOpacity>

        <Icon name="arrow_right" />
      </TouchableOpacity>
    )
  }

  render() {
    const { mapLoaded } = this.state
    const {
      fetching,
      startedAt,
      pausedAt,
      totalDistance,
      pauseDuration,
      averageSpeed,
      isSaving,
      locations,
    } = this.props.record

    const { user } = this.props

    if (fetching || isSaving) {
      return <Loading type="spinner" />
    }

    const lastLocation = this.getLastLocation()

    const now = pausedAt || new Date()
    const duration = moment.duration(moment(now).diff(moment(startedAt)))
    const totalDuration = pauseDuration
      ? duration.subtract(pauseDuration, 'milliseconds')
      : duration

    const dateText = t('record/date')
    const distanceText = t('record/distance')
    const durationText = t('record/duration')
    const avgSpeedText = t('record/avgSpeed')
    const maxSpeedText = t('record/maxSpeed')

    const unitSystem = user.account.preferences.unitSystem

    const convertedSpeed = calculateSpeed(averageSpeed, unitSystem)
    const convertedDistance = calculateDistance(totalDistance, unitSystem)
    const maxSpeed = calculateMaxSpeed(locations, unitSystem)
    const speedUnit = unitSystem === 'IMPERIAL' ? 'MPH' : 'KM/H'
    const distanceUnit = unitSystem === 'IMPERIAL' ? 'Mi' : 'KM'

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
              onMapReady={this.handleMapReady}
            >
              {locations.length > 0 && (
                <View>
                  <Marker
                    coordinate={locations[0].coordinates[0]}
                    image={locationGreen}
                  />

                  {locations.map((location, key) => {
                    const coordinates = location.coordinates

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
                            strokeWidth={4}
                            strokeColor="#DA5E34"
                            dashed
                          />
                        )}

                        <Polyline
                          key={`polyline-${key}`}
                          coordinates={coordinates}
                          strokeWidth={4}
                          strokeColor="#DA5E34"
                        />
                      </View>
                    )
                  })}

                  <Marker coordinate={lastLocation} image={locationRed} />
                </View>
              )}
            </Map>

            {!mapLoaded && (
              <View style={styles.loadingMapContainer}>
                <Loading type="spinner" />
              </View>
            )}
          </View>

          {this.renderSelectedHorse()}

          <ScrollView contentContainerStyle={styles.statsContainer}>
            <RecordAddRideStat
              value={startedAt}
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
                  value={totalDuration}
                  label={durationText}
                  unit="hh:mm:ss"
                />
                <RecordAddRideStat
                  value={maxSpeed}
                  label={maxSpeedText}
                  unit={speedUnit}
                />
              </View>
            </View>
          </ScrollView>

          <View style={styles.buttonsContainer}>
            <TouchableOpacity
              onPress={this.handleDeleteRide}
              style={[styles.buttonContainer, styles.secondaryButtonContainer]}
            >
              <Icon
                name="delete"
                style={[styles.buttonIcon, styles.secondaryButtonIcon]}
              />

              <Text
                style={[styles.buttonLabel, styles.secondaryButtonLabel]}
                message="record/delete"
              />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={this.handleSaveRide}
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
  loadingMapContainer: {
    width: '100%',
    height: '100%',
    backgroundColor: 'white',
  },
  deviceNotConnectedText: {
    textAlign: 'center',
  },
  horseLoadingContainer: {
    height: 90,
    padding: 10,
    marginVertical: 15,
    flexDirection: 'row',
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#CCC',
    alignItems: 'center',
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

const mapStateToProps = ({ record, horses, app, user }) => ({
  record,
  horses,
  app,
  user: user.user,
})

const mapDispatchToProps = dispatch => ({
  actions: bindActionCreators(
    {
      ...recordActions,
      ...horsesActions,
    },
    dispatch
  ),
})

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(RecordAddRide)
