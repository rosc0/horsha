import React, { Component } from 'react'
import { connect } from 'react-redux'
import {
  ActivityIndicator,
  FlatList,
  Image,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native'

import moment from 'moment'
import HeaderButton from '@components/HeaderButton'

import t from '@config/i18n'
import Text from '@components/Text'
import Button from '@components/Button'
import TrailPolyline from '@components/TrailPolyline'
import Distance from '@components/Distance'
import Speed from '@components/Speed'

import { theme } from '@styles/theme'
import Horses from '@api/horses'
import Rides from '@api/rides'
import { fromNowDate } from '@application/utils'
import { horseIcon, userIcon, IconImage } from '@components/Icons'

const HorseAPI = new Horses()
const RideAPI = new Rides()

const avatar = (item, avatarType = 'horse') => {
  const picture = avatarType === 'horse' ? horseIcon : userIcon

  return item.profile_picture
    ? { uri: `${item.profile_picture.url}?t=300x300,fill` }
    : picture
}

class PickRide extends Component {
  static navigationOptions = ({ navigation }) => ({
    title: t('trails/chooseRide'),
    tabBarVisible: false,
    headerLeft: (
      <HeaderButton onPress={() => navigation.goBack(null)}>
        <IconImage
          source="closeIcon"
          resizeMode="contain"
          style={styles.closeIcon}
        />
      </HeaderButton>
    ),
  })

  constructor() {
    super()

    this.state = {
      currentHorseIndex: 0,
      horses: [],
      horsesLoaded: false,
      rides: [],
      ridesLoaded: false,
      showHorseOptions: false,
      currentPage: 1,
      perPage: 4,
    }

    this.filterRides = this.filterRides.bind(this)
    this.setCurrentHorse = this.setCurrentHorse.bind(this)
    this.getRides = this.getRides.bind(this)
  }

  componentDidMount() {
    const { id } = this.props.user.user

    const setHorses = data => {
      const { collection: horses } = data

      if (!horses.length) return false

      this.setState({ horses: horses, horsesLoaded: true })
      return horses[0].horse.id
    }

    HorseAPI.getHorsesByUser(id)
      .then(setHorses)
      .then(this.getRides)
  }

  getRides(horseId) {
    if (!horseId) return

    RideAPI.getRidesByHorse(horseId).then(rides => {
      const { collection } = rides

      this.setState({
        rides: collection ? collection : [],
        ridesLoaded: true,
      })
    })
  }

  filterRides() {
    // alert('common/done')
  }

  showContent() {
    if (!this.state.horsesLoaded) return this.showLoading()

    return (
      <View style={styles.content}>
        {this.showHorses()}
        {this.showRides()}
      </View>
    )
  }

  setCurrentHorse(horseIndex, horseContent) {
    this.getRides(horseContent.horse.id)

    this.setState({
      currentHorseIndex: horseIndex,
      showHorseOptions: false,
      ridesLoaded: false,
      currentPage: 1,
    })
  }

  showHorses() {
    const { horses, currentHorseIndex } = this.state
    const { horse } = horses[currentHorseIndex]

    if (!horses.length) {
      return <Text style={styles.empty} message="trails/youHaveNoHorses" />
    }

    return (
      <View style={styles.horsesWrapper}>
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => {
            this.setState({ showHorseOptions: !this.state.showHorseOptions })
          }}
        >
          <View style={styles.mainHorse}>
            <Image source={avatar(horse)} style={styles.mainHorseAvatar} />
            <Text
              type="title"
              weight="bold"
              style={styles.mainHorseName}
              text={horse.name}
            />
            <IconImage source="arrowIcon" style={styles.selectIcon} />
          </View>
        </TouchableOpacity>
      </View>
    )
  }

  onSelectPress = item => {
    this.props.navigation.state.params.onSelectPress(item)
    this.props.navigation.goBack(null)
  }

  showRides() {
    const {
      horses,
      rides,
      ridesLoaded,
      currentHorseIndex,
      perPage,
      currentPage,
    } = this.state

    if (!ridesLoaded) {
      return this.showLoading()
    }

    if (!rides.length && horses.length) {
      return <Text style={styles.empty} message="trails/noRides" />
    }

    const { horse } = horses[currentHorseIndex]

    return (
      <View style={styles.scrollView}>
        <FlatList
          data={rides.slice(0, perPage * currentPage)}
          keyExtractor={item => item.id}
          onEndReachedThreshold={0.5}
          onEndReached={() => this.setState({ currentPage: currentPage + 1 })}
          renderItem={({ item }) => (
            <View style={styles.ride}>
              <View style={[styles.rideInfo, styles.inline]}>
                <Image
                  source={avatar(item.user, 'user')}
                  style={styles.userIcon}
                />

                <View style={styles.wrapper}>
                  <Text
                    type="title"
                    weight="bold"
                    style={styles.rideTitle}
                    message="trails/userHorseRide"
                    values={{
                      user: <Text style={styles.bold} text={item.user.name} />,
                      horse: <Text style={styles.bold} text={horse.name} />,
                    }}
                  />
                  <Text
                    style={styles.ago}
                    text={`\n${fromNowDate(item.date_recorded)}`}
                  />
                </View>
              </View>

              <View style={styles.minimap}>
                <TrailPolyline
                  coordsFile={item.preview_track_url}
                  boundBox={item.bounding_box}
                />
              </View>

              <View
                style={[
                  styles.inline,
                  styles.right,
                  styles.rideInfo,
                  styles.infoRow,
                ]}
              >
                <Distance
                  distance={item.distance}
                  distanceStyle={styles.rideNumber}
                  unitStyle={styles.smallNumber}
                />
                <Text
                  type="title"
                  weight="bold"
                  style={styles.rideNumber}
                  text={moment()
                    .startOf('day')
                    .seconds(item.duration)
                    .format('HH:mm:ss')}
                />
                <Speed
                  speed={item.avg_speed}
                  speedStyle={styles.rideNumber}
                  unitStyle={styles.smallNumber}
                />
              </View>

              <View style={styles.rideInfo}>
                <Button
                  onPress={() => this.onSelectPress(item)}
                  type="secondary"
                  color={theme.secondaryColor}
                  style={styles.selectButton}
                  textStyle={styles.selectButtonText}
                  label="trails/selectButton"
                />
              </View>
            </View>
          )}
        />
      </View>
    )
  }

  showLoading() {
    return (
      <ActivityIndicator animating={true} style={styles.center} size="large" />
    )
  }

  showHorsesOptions() {
    const { horses, showHorseOptions, currentHorseIndex } = this.state

    if (!showHorseOptions) return null

    return (
      <View style={styles.horsePicker}>
        <ScrollView style={{ flex: 1 }}>
          {horses.map((item, i) => (
            <TouchableOpacity
              onPress={() => this.setCurrentHorse(i, item)}
              activeOpacity={0.7}
              key={`horse-${i}`}
            >
              <View style={styles.mainHorse}>
                <Image
                  source={avatar(item.horse)}
                  style={styles.mainHorseAvatar}
                />
                <Text
                  type="title"
                  weight="bold"
                  style={styles.mainHorseName}
                  text={item.horse.name}
                />

                {i === currentHorseIndex && (
                  <IconImage
                    style={styles.checkIcon}
                    source="checkIcon"
                    svg
                    fill={theme.secondaryColor}
                  />
                )}
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
    )
  }

  render() {
    const { horsesLoaded } = this.state

    return (
      <View style={styles.wrapper}>
        <View style={styles.contentWrapper}>
          {this.showHorsesOptions()}
          {this.showContent()}
        </View>
      </View>
    )
  }
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    backgroundColor: 'white',
  },
  scrollView: {
    height: '92%',
    width: '100%',
    zIndex: 100,
  },
  closeIcon: {
    width: 50,
    height: 16,
    resizeMode: 'contain',
    justifyContent: 'flex-end',
    alignSelf: 'flex-end',
    marginRight: 5,
    tintColor: 'white',
  },
  contentWrapper: {
    flex: 1,
    position: 'relative',
    zIndex: -1,
  },
  center: {
    marginTop: 30,
    alignSelf: 'center',
    justifyContent: 'center',
  },
  inline: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  right: {
    alignSelf: 'flex-end',
  },
  content: {},
  horsesWrapper: {
    zIndex: 1000,
  },
  mainHorse: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderColor: theme.border,
    padding: 10,
  },
  mainHorseAvatar: {
    width: 34,
    height: 34,
    borderRadius: 17,
    borderWidth: 1,
    borderColor: '#aaa',
    resizeMode: 'contain',
    marginRight: 10,
  },
  mainHorseName: {
    fontSize: 18,
    color: '#828282',
  },
  selectIcon: {
    width: 20,
    height: 10,
    position: 'absolute',
    right: 12,
  },
  empty: {
    color: 'silver',
    alignSelf: 'center',
    marginTop: 30,
  },
  horsePicker: {
    width: '100%',
    height: '100%',
    backgroundColor: 'white',
    zIndex: 10000,
  },
  rideInfo: {
    paddingHorizontal: 10,
  },
  ride: {
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderColor: theme.border,
  },
  checkIcon: {
    width: 20,
    height: 16,
    position: 'absolute',
    right: 12,
  },
  userIcon: {
    width: 30,
    height: 30,
    marginRight: 10,
    borderWidth: 1,
    borderColor: theme.border,
    borderRadius: 15,
    alignSelf: 'flex-start',
  },
  rideTitle: {
    fontSize: 16,
    color: '#7d7d7d',
    flexWrap: 'wrap',
    flex: 1,
  },
  bold: {
    color: '#555',
  },
  ago: {
    fontSize: theme.font.sizes.smallVariation,
  },
  rideNumber: {
    marginLeft: 20,
    fontSize: 18,
    color: '#7d7d7d',
  },
  smallNumber: {
    fontSize: theme.font.sizes.smallest,
    color: '#bbb',
    top: 8,
    marginLeft: 3,
  },
  selectButton: {
    borderWidth: 1,
    borderColor: theme.secondaryColor,
    width: 'auto',
    paddingHorizontal: 20,
    alignSelf: 'flex-end',
    paddingVertical: 5,
  },
  selectButtonText: {
    fontSize: theme.font.sizes.smallVariation,
  },
  minimap: {
    marginTop: 20,
  },
  infoRow: {
    marginTop: 20,
  },
})

export default connect(state => ({
  user: state.user,
  trails: state.trails,
}))(PickRide)
