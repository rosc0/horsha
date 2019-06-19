import React, { PureComponent } from 'react'
import {
  Alert,
  Dimensions,
  FlatList,
  PermissionsAndroid,
  Platform,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import moment from 'moment'
import { DocumentPicker } from 'react-native-document-picker'
import ActionSheet from 'rn-action-sheet'

import t from '@config/i18n'
import * as horsesAction from '@actions/horses'
import HorseNavigationBarTitle from './components/HorseNavigationBarTitle'
import EmptyRides from './components/EmptyRides'
import Loading from '@components/Loading'
import Text from '@components/Text'
import AddButton from '@components/AddButton'
import RowSeparator from '@components/RowSeparator'
import RideStats from '@components/RideStats'
import Distance from '@components/Distance'
import TrailPolyline from '@components/TrailPolyline'
import ArchivedUserBar from './components/ArchivedUserBar'
import Button from '@components/Button'

import { fromNowDate, padZero } from '@application/utils'

import { theme } from '@styles/theme'

import Horses from '@api/horses'
import Rides from '@api/rides'
import UserImage from '@components/UserImage'
import BackButton from '@components/BackButton'

const { width } = Dimensions.get('screen')

const HorsesAPI = new Horses()
const RidesAPI = new Rides()

class HorseRides extends PureComponent {
  static navigationOptions = ({ navigation }) => ({
    headerTitle: (
      <HorseNavigationBarTitle
        title={t('horses/rides')}
        navigation={navigation}
      />
    ),
    headerRight:
      navigation.state.params && navigation.state.params.showAddButton ? (
        <AddButton onPress={navigation.state.params.handleAddRide} />
      ) : null,
    headerLeft: (
      <BackButton onPress={navigation.state.params.handleBackButton} />
    ),
  })

  state = {
    horse: {},
    rides: [],
    remaining: 0,
    dataFetched: false,
    userFilterId: null,
  }

  handleBackButton = () => {
    if (this.props.navigation.state.params.shouldBeBack) {
      return this.props.navigation.goBack(null)
    }
    return this.props.navigation.popToTop()
  }

  validateFile(fileInfo) {
    const { fileSize, fileName } = fileInfo
    const getExtension = name => name.split('.').pop()
    const extension = getExtension(fileName)

    const fileTooBigTitleText = t('trails/fileTooBigTitle')
    const fileTooBigMessageText = t('trails/fileTooBigMessage')
    const wrongFileExtTitleText = t('trails/wrongFileExtTitle')
    const wrongFileExtMessageText = t('trails/wrongFileExtMessage', {
      extension: extension,
    })

    // 10mb
    if (fileSize > 1e7) {
      Alert.alert(
        fileTooBigTitleText,
        fileTooBigMessageText,
        [
          {
            text: t('common/ok'),
            onPress: () => {},
          },
        ],
        { cancelable: false }
      )

      return false
    }

    if (extension !== 'gpx' && extension !== 'GPX') {
      Alert.alert(
        wrongFileExtTitleText,
        wrongFileExtMessageText,
        [
          {
            text: t('common/ok'),
            onPress: () => {},
          },
        ],
        { cancelable: false }
      )

      return false
    }

    return true
  }

  addRide = async () => {
    if (Platform.OS === 'android') {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
        {
          title: t('permissions/storageTitle'),
          message: t('permissions/storageMessage'),
        }
      )
      if (granted === PermissionsAndroid.RESULTS.GRANTED) {
        this.openDocumentPicker()
      } else {
        Alert.alert(null, t('permissions/needStorageRide'), [
          {
            text: t('common/ok'),
            onPress: () => {},
          },
        ])
      }
    } else {
      this.openDocumentPicker()
    }
  }

  openDocumentPicker = () => {
    const filetype = [Platform.OS === 'android' ? '*/*' : 'public.xml']

    DocumentPicker.show({ filetype }, async (error, information) => {
      if (this.validateFile(information)) {
        this.props.navigation.navigate('AddHorseRide', {
          horseId: this.state.horse.id,
          file: information,
        })
      }
    })
  }

  handleAddRide = () => {
    ActionSheet.show(
      {
        title: t('rideDetail/newRide'),
        options: [
          t('rideDetail/recordRide'),
          t('rideDetail/uploadRide'),
          t('common/cancel'),
        ],
        cancelButtonIndex: 2,
        tintColor: theme.secondaryColor,
      },
      async index => {
        switch (index) {
          case 0: {
            return this.navigateToRecord()
          }
          case 1: {
            return this.addRide()
          }
        }
      }
    )
  }

  navigateToHorseStats(horseId) {
    this.props.navigation.navigate('HorseStats', { horseId: horseId })
  }

  navigateToRideDetail(rideId) {
    this.props.navigation.navigate('RideDetail', { rideId: rideId })
  }

  navigateToRecord() {
    this.props.navigation.navigate('RecordModal')
  }

  async componentDidMount() {
    this.props.navigation.setParams({
      handleBackButton: this.handleBackButton,
      shouldAllowBackGesture: true,
    })

    const horseId = this.props.navigation.state.params.horseId
    const horse = await HorsesAPI.getHorseProfile(horseId)
    const rides = await RidesAPI.getRidesByHorse(horseId)
    const horseUser = await HorsesAPI.getHorseUser(horseId, this.props.user.id)

    if (horseUser.collection.length) {
      const relationType = horseUser.collection[0].relation_type
      this.props.navigation.setParams({
        showAddButton: relationType === 'owner' || relationType === 'sharer',
      })
    }

    this.setState({
      horse: horse,
      rides: rides.collection,
      remaining: rides.remaining,
      cursor: null,
      dataFetched: true,
    })

    this.props.navigation.setParams({
      handleAddRide: this.handleAddRide,
    })
  }

  onListEnd = async () => {
    const { cursor, remaining } = this.state

    if (remaining) {
      const horseId = this.props.navigation.state.params.horseId

      if (cursor) {
        const newRides = await RidesAPI.getRidesByHorse(
          horseId,
          cursor,
          this.state.userFilterId
        )

        this.setState({
          rides: this.state.rides.concat(newRides.collection),
          remaining: newRides.remaining,
          cursor: newRides.cursor,
        })
      }
    }
  }

  userFilter = async () => {
    const userFilterId = this.state.userFilterId ? null : this.props.user.id
    this.setState({
      userFilterId: userFilterId,
      dataFetched: false,
    })

    const horseId = this.props.navigation.state.params.horseId
    const rides = await RidesAPI.getRidesByHorse(horseId, null, userFilterId)

    this.setState({
      rides: rides.collection,
      remaining: rides.remaining,
      cursor: rides.cursor,
      dataFetched: true,
    })
  }

  handleSelectRide = ride => {
    this.props.actions.selectRide(ride)
    this.props.navigation.goBack(null)
  }

  rideItem = ride => {
    const { shouldSelectRide } = this.props.navigation.state.params

    const rideDuration = moment.duration(ride.duration)
    const duration = {
      hours: rideDuration.hours(),
      minutes: rideDuration.minutes(),
      seconds: rideDuration.seconds(),
    }

    return (
      <View style={styles.rideItem}>
        <View style={styles.row}>
          <UserImage
            user={ride.user || this.props.user}
            style={styles.userImage}
          />

          <View>
            <Text
              type="title"
              weight="bold"
              text={(ride.user && ride.user.name) || this.props.user.name}
              numberOfLines={1}
              ellipsizeMode="tail"
              style={styles.userName}
            />
            <Text text={fromNowDate(ride.date_recorded)} style={styles.date} />
          </View>
        </View>

        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => this.navigateToRideDetail(ride.id)}
          style={styles.marginTop}
        >
          <TrailPolyline
            coordsFile={ride.preview_track_url}
            boundBox={ride.bounding_box}
          />
        </TouchableOpacity>

        <View style={[styles.row, styles.marginTop]}>
          <Distance
            distance={ride.distance}
            distanceStyle={styles.statsText}
            unitStyle={styles.unit}
          />

          <View style={styles.duration}>
            {duration.hours > 0 && [
              <Text
                weight="semiBold"
                key="hours"
                text={duration.hours}
                style={styles.statsText}
              />,
              <Text
                weight="semiBold"
                key="hoursText"
                message="horseRides/hours"
                style={styles.statsUnitText}
              />,
            ]}

            <Text
              weight="semiBold"
              text={duration.minutes > 0 ? duration.minutes : '00'}
              style={styles.statsText}
            />
            <Text
              weight="semiBold"
              message="horseRides/minutes"
              style={styles.statsUnitText}
            />

            <Text
              weight="semiBold"
              text={padZero(duration.seconds)}
              style={styles.statsText}
            />
            <Text
              weight="semiBold"
              message="horseRides/seconds"
              style={styles.statsUnitText}
            />
          </View>
        </View>

        <View style={styles.trailsPassedContainer}>
          <Text
            message={
              ride.nr_of_trail_rides > 0
                ? 'horseRides/trailsPassed'
                : 'horseRides/noTrailsPassed'
            }
            style={styles.user}
            values={{ trailsPassed: ride.nr_of_trail_rides }}
          />
        </View>

        <View style={styles.actionsContainer}>
          <Button
            label="common/seeMore"
            style={styles.greenButton}
            textStyle={styles.greenButtonText}
            onPress={() => this.navigateToRideDetail(ride.id)}
          />
          {shouldSelectRide && (
            <Button
              label="horseRides/selectRide"
              style={styles.greenButton}
              textStyle={styles.greenButton1Text}
              onPress={() => this.handleSelectRide(ride)}
            />
          )}
        </View>
      </View>
    )
  }

  render() {
    const { horses } = this.props
    const { horse, rides, dataFetched } = this.state

    if (!dataFetched) {
      return <Loading type="spinner" />
    }

    const isArchived =
      horses && horses[0] && horses[0].relation_type === 'archived'

    return (
      <View style={styles.container}>
        {isArchived && (
          <ArchivedUserBar
            navigation={this.props.navigation}
            horseUser={horses[0]}
          />
        )}
        {!rides || !rides.length ? (
          <EmptyRides isArchived={isArchived} />
        ) : (
          <FlatList
            initialNumToRender={4}
            data={rides}
            keyExtractor={ride => ride.id}
            renderItem={ride => this.rideItem(ride.item)}
            onEndReachedThreshold={0.5}
            onEndReached={() => this.onListEnd()}
            ItemSeparatorComponent={() => <RowSeparator />}
            ListHeaderComponent={() => (
              <View>
                <RideStats
                  titleMessageKey={t('horseRides/horseStats')}
                  totalRidingDistance={horse.riding_stats.total_distance}
                  totalRidingTime={horse.riding_stats.total_duration}
                  nrOfRides={horse.riding_stats.nr_of_rides}
                  containerStyle={styles.statsContainer}
                  linkOnPress={() => {
                    this.navigateToHorseStats(horse.id)
                  }}
                />
                <View style={styles.buttonContainer}>
                  <TouchableOpacity
                    activeOpacity={0.7}
                    onPress={this.userFilter}
                  >
                    <View style={styles.greenFilterButton}>
                      <Text
                        type="title"
                        weight="bold"
                        message={
                          this.state.userFilterId
                            ? 'horseRides/showAllRides'
                            : 'horseRides/showMyRides'
                        }
                        style={[styles.greenButtonText, styles.whiteButtonText]}
                      />
                    </View>
                  </TouchableOpacity>
                </View>
              </View>
            )}
          />
        )}
      </View>
    )
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  statsContainer: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: theme.border,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingHorizontal: theme.paddingHorizontal,
  },
  rideItem: {
    paddingVertical: 15,
  },
  userImage: {
    width: 40,
    height: 40,
    marginRight: 10,
  },
  userName: {
    width: width - 80,
    ...theme.font.userName,
  },
  date: {
    ...theme.font.date,
  },
  marginTop: {
    marginTop: 15,
  },
  duration: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginLeft: 15,
  },
  greenButton: {
    ...theme.buttons.custom,
  },
  greenFilterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 3,
    borderColor: theme.lightGreen,
    borderWidth: 1,
    alignSelf: 'center',
    backgroundColor: theme.lightGreen,
    padding: 8,
  },
  greenButtonText: {
    color: theme.secondaryColor,
    fontSize: theme.font.sizes.small,
  },
  whiteButtonText: {
    color: 'white',
  },
  statsText: {
    ...theme.font.rideStatusNumber,
  },
  statsUnitText: {
    paddingHorizontal: 4,
    ...theme.font.rideStatusLabel,
  },
  trailsPassedContainer: {
    marginTop: 10,
    paddingHorizontal: theme.paddingHorizontal,
  },
  buttonContainer: {
    padding: 20,
    backgroundColor: theme.backgroundColor,
    borderBottomWidth: 1,
    borderBottomColor: theme.border,
    paddingHorizontal: theme.paddingHorizontal,
  },
  actionsContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingHorizontal: theme.paddingHorizontal,
  },
  unit: {
    paddingLeft: 4,
    marginBottom: 2,
    ...theme.font.rideStatusLabel,
    marginTop: 6,
  },
  user: {
    ...theme.font.userName,
    color: theme.fontColorDark,
  },
})

const mapStateToProps = ({ horses, user }) => ({
  horses: horses.horses,
  rides: horses.rides,
  user: user.user,
})

const mapDispatchToProps = dispatch => ({
  actions: bindActionCreators(horsesAction, dispatch),
})

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(HorseRides)
