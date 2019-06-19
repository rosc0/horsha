import React, { PureComponent } from 'react'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import {
  Alert,
  FlatList,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native'
import moment from 'moment'
import { NavigationActions } from 'react-navigation'

import Distance from '@components/Distance'
import UserImage from '@components/UserImage'
import HorseImage from '@components/HorseImage'
import HeaderTitle from '@components/HeaderTitle'
import Text from '@components/Text'
import RideStats from '@components/RideStats'
import Loading from '@components/Loading'
import AddFriendButton from '@components/AddFriendButton'
import { IconImage } from '@components/Icons'
import ProfileAboutInfo from '@components/ProfileAboutInfo'
import ProfileAboutDescription from '@components/ProfileAboutDescription'
import ProfileHeader from '@components/ProfileHeader'

import t from '@config/i18n'
import * as userActions from '@actions/user'
import * as friendActions from '@actions/friends'
import { theme } from '@styles/theme'
import { birthDate, outputCountry } from '@application/utils'

import User from '@api/user'
import Friends from '@api/friends'
import Horses from '@api/horses'
import { friendsIcon } from '@components/Icons'

const FRIEND_SIZE = 70
const HORSE_SIZE = 70

const UserAPI = new User()
const FriendsAPI = new Friends()
const HorsesAPI = new Horses()

class UserProfile extends PureComponent {
  static navigationOptions = ({ navigation }) => {
    return {
      headerTitle: (
        <HeaderTitle
          title={
            navigation.state.params.ownProfile
              ? 'userProfile/myUserProfileTitle'
              : 'userProfile/userProfileTitle'
          }
        />
      ),
      tabBarVisible: false,
    }
  }

  state = {
    user: {},
    friends: [],
    horses: [],
    horsesRemaining: '',
    userFetched: false,
    friendsFetched: false,
    horsesFetched: false,
    ownProfile: false,
    showMoreProfile: false,
    requested: false,
  }

  componentDidMount() {
    const { params: navigationParams } = this.props.navigation.state

    if (navigationParams && navigationParams.userId) {
      if (this.state.user && navigationParams.userId !== this.state.user.id) {
        this.setState({ user: {} })
      }

      const ownProfile = navigationParams.userId === this.props.user.user.id

      this.props.navigation.setParams({ ownProfile })

      this.setState({
        ownProfile,
      })

      this.getUser(navigationParams.userId)
    }
  }

  static getDerivedStateFromProps(props, state) {
    if (props.user.user !== state.user.user && state.ownProfile) {
      return {
        user: props.user.user,
        userFetched: true,
      }
    }

    return null
  }

  async getUser(userId) {
    await UserAPI.getUser(userId, true).then(response => {
      this.setState({
        user: response,
        userFetched: true,
      })

      if (!this.state.ownProfile) {
        this.props.navigation.setParams({
          title: response.name,
        })
      }
    })

    await HorsesAPI.getHorsesByUser(userId).then(response => {
      this.setState({
        horses: response.collection,
        horsesRemaining: response.remaining,
        horsesFetched: true,
      })
    })

    await FriendsAPI.getFriends(userId).then(response => {
      this.setState({
        friends: response.collection,
        friendsFetched: true,
      })
    })
  }

  navigateToEditProfile = () => this.props.navigation.navigate('EditProfile')

  navigateToUserStats = userId =>
    this.props.navigation.navigate('UserStats', {
      userId,
    })

  navigateToHorses = () => {
    if (this.props.navigation.state.params.fromRoute === 'Horses') {
      return this.props.navigation.dispatch(
        NavigationActions.navigate({
          index: 0,
          actions: [NavigationActions.navigate({ routeName: 'Main' })],
        })
      )
    }

    this.props.navigation.navigate('Horses')
  }

  navigateToHorseProfile = horseId =>
    this.props.navigation.navigate('Profile', { horseId: horseId })

  navigateToFriends() {
    if (this.props.navigation.state.params.fromRoute === 'Friends') {
      this.props.navigation.navigate('Friends')
    }

    this.props.navigation.navigate('FriendList')
  }

  async switchUser(userId) {
    await this.getUser(userId)

    this.screenScrollRef.scrollTo({ x: 0, y: 0, animated: true })
    this.friendListRef.scrollToIndex({ animated: false, index: 0 })
    // TODO: if the user has not horses do should not scroll
    this.horseListRef.scrollToIndex({ animated: false, index: 0 })
  }

  location(user) {
    let locationText = false
    if (user.country_code) return outputCountry(user.country_code)

    return false
  }

  friendItem = ({ item }) => {
    return (
      <TouchableOpacity
        activeOpacity={0.7}
        onPress={() => {
          this.switchUser(item.id)
        }}
      >
        <UserImage user={item} style={styles.friendImage} />
      </TouchableOpacity>
    )
  }

  horseItem(horseUser) {
    return (
      <TouchableOpacity
        activeOpacity={0.7}
        onPress={() => {
          this.navigateToHorseProfile(horseUser.horse.id)
        }}
      >
        <HorseImage horse={horseUser.horse} style={styles.horseImage} />
      </TouchableOpacity>
    )
  }

  showMoreProfileButton = () => {
    return (
      <TouchableOpacity
        activeOpacity={0.7}
        onPress={this.toggleShowMore.bind(this)}
      >
        <Text
          message={
            this.state.showMoreProfile ? 'common/showLess' : 'common/showMore'
          }
          style={
            this.state.showMoreProfile
              ? styles.showLessText
              : styles.showMoreText
          }
        />
      </TouchableOpacity>
    )
  }

  toggleShowMore() {
    this.setState({
      showMoreProfile: !this.state.showMoreProfile,
    })
  }

  async addFriend(userId) {
    if (!this.state.requested) {
      await this.props.actions.addFriend(userId)
      this.setState({
        requested: true,
      })
    }
  }

  unFriend = async () => {
    const { user } = this.state
    Alert.alert(
      t('userProfile/unfriendConfirmation'),
      t('userProfile/unfriendMessage'),
      [
        {
          text: t('common/cancel'),
          style: 'cancel',
        },
        {
          text: t('userProfile/unfriend'),
          style: 'destructive',
          onPress: async () => {
            await this.props.actions.unFriend(user.id)
            await this.props.actions.getFriends()
            await this.getUser(user.id)
          },
        },
      ],
      { cancelable: true }
    )
  }

  render() {
    const {
      user,
      userFetched,
      horses,
      horsesFetched,
      friends,
      friendsFetched,
      ownProfile,
      horsesRemaining,
    } = this.state

    const { user: currentUser } = this.props.user
    const locationText = userFetched && this.location(user)
    const horseCount = horsesFetched
      ? horses && horses.length + horsesRemaining
      : 0
    const friendCount = !!friends && friendsFetched ? friends.length : 0
    const isCurrentUser = currentUser.id === user.id
    const userLocationLabel = t('userProfile/location')
    const birthdayTextLabel = t('userProfile/birthday')

    if (!userFetched) {
      return (
        <View style={styles.wrapper}>
          <Loading type="spinner" />
        </View>
      )
    }

    return (
      <ScrollView
        ref={ref => {
          this.screenScrollRef = ref
        }}
      >
        <View style={styles.wrapper}>
          <View style={[styles.section, styles.row, styles.nameRow]}>
            <UserImage lightbox user={user} style={styles.userImage} />

            <View style={styles.userContent}>
              {ownProfile && (
                <TouchableOpacity
                  activeOpacity={0.7}
                  onPress={() => this.navigateToEditProfile()}
                  style={[styles.editButton, { alignSelf: 'flex-end' }]}
                >
                  <Text
                    type="title"
                    message="userProfile/edit"
                    weight="bold"
                    style={styles.titleLink}
                  />
                </TouchableOpacity>
              )}
              <Text
                text={user.name}
                type="title"
                weight="bold"
                style={styles.userNameText}
              />
              {!!user.riding_totals && user.riding_totals.distance > 0 && (
                <Distance distance={user.riding_totals.distance} />
              )}
              <View style={styles.buttons}>
                {!isCurrentUser && (
                  // TODO: move these styles to styles and re-use for follow button when implemented
                  <AddFriendButton
                    user={user}
                    showIcon={false}
                    buttonContainerStyle={{
                      backgroundColor: theme.secondaryColor,
                      flex: 2,
                    }}
                    buttonTextStyle={{
                      color: 'white',
                      paddingVertical: 3,
                    }}
                    requestedContainer={{
                      flex: 2,
                    }}
                  />
                )}
              </View>
            </View>
          </View>

          <View style={styles.section}>
            {/* <View style={[styles.row, styles.titleMargin]}>
              <IconImage source="userIcon" style={styles.icon} />

              <Text
                type="title"
                message="userProfile/aboutTitle"
                weight="bold"
                style={styles.sectionTitle}
              />

              {ownProfile && (
                <TouchableOpacity
                  activeOpacity={0.7}
                  onPress={this.navigateToEditProfile.bind(this)}
                  style={styles.editButton}
                >
                  <Text
                    type="title"
                    message="userProfile/edit"
                    weight="bold"
                    style={styles.titleLink}
                  />
                </TouchableOpacity>
              )}
            </View> */}

            <ProfileHeader
              icon="profile" // horse
              title={t('userProfile/aboutTitle')}
              // additionalText={'1'}
              renderRight={
                ownProfile && (
                  <TouchableOpacity
                    activeOpacity={0.7}
                    onPress={this.navigateToEditProfile.bind(this)}
                    style={styles.editButton}
                  >
                    <Text
                      type="title"
                      message="userProfile/edit"
                      weight="bold"
                      style={styles.titleLink}
                    />
                  </TouchableOpacity>
                )
              }
            />

            <View style={styles.baselineRow}>
              <ProfileAboutInfo
                ownProfile={ownProfile}
                label={userLocationLabel}
                value={locationText}
                edit={() => this.navigateToEditProfile()}
                string="common/addLocation"
              />
              <ProfileAboutInfo
                ownProfile={ownProfile}
                label={birthdayTextLabel}
                value={moment(user.birthday).format('LL')}
                extraValue={
                  <Text
                    message="userProfile/friendsOnly"
                    style={styles.friendsOnly}
                  />
                }
                edit={() => this.navigateToEditProfile()}
              />
              {user.gender && (
                <ProfileAboutInfo
                  ownProfile={ownProfile}
                  label={t('userProfile/gender')}
                  value={user.gender}
                  edit={() => this.navigateToEditProfile()}
                />
              )}
              <ProfileAboutInfo
                ownProfile={ownProfile}
                label={t('userProfile/onHorshaSince')}
                style={{ width: 130 }}
                value={moment(user.date_created).format('LL')}
                edit={() => this.navigateToEditProfile()}
              />
            </View>

            <ProfileAboutDescription
              ownProfile={ownProfile}
              description={user.profile_text}
              edit={() => this.navigateToEditProfile()}
            />
          </View>
          {!!user.riding_totals && (
            <View style={styles.section}>
              <RideStats
                titleMessageKey={t('userProfile/statsTitle')}
                totalRidingDistance={user.riding_totals.distance}
                totalRidingTime={user.riding_totals.duration}
                nrOfRides={user.riding_totals.count}
                rounded
                linkOnPress={
                  ownProfile ? () => this.navigateToUserStats(user.id) : null
                }
              />
            </View>
          )}

          <View style={styles.section}>
            <ProfileHeader
              icon="horse" // horse
              message="userProfile/horsesTitle"
              values={{ count: horseCount }}
              renderRight={
                ownProfile && (
                  <TouchableOpacity
                    activeOpacity={0.7}
                    onPress={this.navigateToHorses}
                    style={styles.row}
                  >
                    <Text
                      type="title"
                      message="userProfile/manage"
                      weight="bold"
                      style={styles.titleLinkGrey}
                    />
                    <IconImage style={styles.rightArrow} source="nextIcon" />
                  </TouchableOpacity>
                )
              }
            />

            {horsesFetched && (
              <FlatList
                ref={ref => {
                  this.horseListRef = ref
                }}
                initialNumToRender={8}
                horizontal={true}
                data={horses}
                getItemLayout={(data, index) => ({
                  length: HORSE_SIZE,
                  offset: HORSE_SIZE * index,
                  index,
                })}
                keyExtractor={horse => horse.id}
                renderItem={horse => this.horseItem(horse.item)}
              />
            )}
          </View>

          <View style={styles.section}>
            <ProfileHeader
              icon="horse_team" // horse
              message="userProfile/friendsTitle"
              values={{ count: friendCount }}
              renderRight={
                ownProfile && (
                  <TouchableOpacity
                    activeOpacity={0.7}
                    onPress={this.navigateToFriends.bind(this)}
                    style={styles.row}
                  >
                    <Text
                      type="title"
                      message="common/seeAll"
                      weight="bold"
                      style={styles.titleLinkGrey}
                    />
                    <IconImage style={styles.rightArrow} source="nextIcon" />
                  </TouchableOpacity>
                )
              }
            />
            {friendsFetched && (
              <FlatList
                ref={ref => {
                  this.friendListRef = ref
                }}
                initialNumToRender={8}
                horizontal={true}
                data={friends}
                getItemLayout={(data, index) => ({
                  length: FRIEND_SIZE,
                  offset: FRIEND_SIZE * index,
                  index,
                })}
                keyExtractor={user => user.id}
                renderItem={user => this.friendItem(user)}
              />
            )}
          </View>
        </View>

        {user.friends_since && (
          <TouchableOpacity
            activeOpacity={0.7}
            style={[styles.section, styles.unFriendContainer]}
            onPress={() => this.unFriend()}
          >
            <Text message="userProfile/unfriend" style={styles.unFriendText} />
          </TouchableOpacity>
        )}
      </ScrollView>
    )
  }
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    paddingLeft: 15,
    paddingRight: 15,
    backgroundColor: 'white',
  },
  section: {
    borderBottomColor: theme.border,
    borderBottomWidth: 1,
    paddingTop: 15,
    paddingBottom: 15,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    margin: 0,
    padding: 0,
  },
  userImage: {
    width: 150,
    height: 150,
    resizeMode: 'contain',
    backgroundColor: '#eaeaea',
  },
  editButton: {
    paddingVertical: 5,
  },
  nameRow: {
    alignItems: 'flex-start',
  },
  userContent: {
    marginLeft: 15,
    flex: 1,
    flexWrap: 'wrap',
  },
  userNameText: {
    ...theme.font.profileName,
  },
  buttons: {
    marginTop: 20,
    flexDirection: 'row',
  },
  icon: {
    width: 23,
    height: 23,
    resizeMode: 'contain',
  },
  sectionTitle: {
    flex: 1,
    fontSize: theme.font.sizes.defaultPlus,
    color: '#535353',
    paddingLeft: 15,
  },
  titleMargin: {
    marginBottom: 15,
  },
  titleLink: {
    fontSize: theme.font.sizes.smallVariation,
    color: theme.secondaryColor,
  },
  titleLinkGrey: {
    fontSize: theme.font.sizes.smallVariation,
    color: theme.fontColor,
  },
  rightArrow: {
    width: 13,
    height: 13,
    marginLeft: 2,
    resizeMode: 'contain',
  },
  baselineRow: {
    flexDirection: 'column',
    alignItems: 'baseline',
  },
  showMoreText: {
    fontSize: theme.font.sizes.smallVariation,
    color: theme.secondaryColor,
  },
  showLessText: {
    fontSize: theme.font.sizes.smallVariation,
    color: theme.secondaryColor,
    paddingLeft: 15,
    paddingTop: 5,
  },
  friendsOnly: {
    height: 20,
    fontSize: theme.font.sizes.smallest,
    paddingTop: 3,
    paddingLeft: 7,
    color: theme.fontColorLight,
  },
  friendImage: {
    width: FRIEND_SIZE,
    height: FRIEND_SIZE,
    marginRight: 10,
  },
  horseImage: {
    width: HORSE_SIZE,
    height: HORSE_SIZE,
    marginRight: 10,
  },
  unFriendContainer: {
    backgroundColor: 'white',
    borderTopColor: theme.border,
    borderTopWidth: 1,
    marginVertical: 20,
  },
  unFriendText: {
    color: theme.chartRed,
    textAlign: 'center',
  },
})

export default connect(
  state => ({
    auth: state.auth,
    user: state.user,
    horses: state.horses,
  }),
  dispatch => ({
    actions: bindActionCreators(
      {
        ...userActions,
        ...friendActions,
      },
      dispatch
    ),
  })
)(UserProfile)
