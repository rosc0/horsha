import React, { PureComponent } from 'react'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import {
  Alert,
  Linking,
  Platform,
  ScrollView,
  StyleSheet,
  View,
  TouchableOpacity,
} from 'react-native'
import config from 'react-native-config'

import Loading from '@components/Loading'
import UserImage from '@components/UserImage'
import HeaderTitle from '@components/HeaderTitle'
import UserLink from '@components/UserLink'
import MenuItem from '@components/MenuItem'

import t from '@config/i18n'
import * as horseActions from '@actions/horses'
import * as authActions from '@actions/auth'
import { theme } from '@styles/theme'

class ProfileAndSettings extends PureComponent {
  static navigationOptions = {
    headerTitle: <HeaderTitle title={'profileAndSettings/myProfileTitle'} />,
    tabBarVisible: false,
  }

  state = {
    horseId: null,
    userId: null,
  }

  componentDidMount = async () => {
    const { horseUser } = this.props

    if (!horseUser) {
      await this.props.actions.getHorses()
      this.setState({ horseUser: this.props.horseUser })
    } else {
      this.setState({ horseUser })
    }
  }

  navigateToUserProfile = userId => {
    const { navigation } = this.props

    navigation.navigate('UserProfile', {
      userId: userId,
      fromRoute: navigation.state.params && navigation.state.params.fromRoute,
    })
  }

  navigateToJournal = () => {
    this.props.navigation.navigate('HorseJournal', {
      horseId: this.state.horseUser.horse.id,
      shouldBeBack: true,
    })
  }

  navigateToRides = () => {
    this.props.navigation.navigate('HorseRides', {
      horseId: this.state.horseUser.horse.id,
      shouldBeBack: true,
    })
  }

  navigateToAlbum = () => {
    this.props.navigation.navigate('HorseAlbum', {
      horseId: this.state.horseUser.horse.id,
      shouldBeBack: true,
    })
  }

  navigateToProfile = () => {
    this.props.navigation.navigate('Profile', {
      horseId: this.state.horseUser.horse.id,
    })
  }

  navigateToStats = userId => {
    this.props.navigation.navigate('UserStats', {
      userId,
    })
  }

  navigateToSettings = () => {
    this.props.navigation.navigate('SettingsList')
  }

  navigateToHelp = () => {
    this.props.navigation.navigate('NavigateToHelp')
  }

  navigateToSendFeedback = () => {
    this.props.navigation.navigate('NavigateToSendFeedback')
  }

  navigateToRateThisApp = () => {
    const iosLink = `itms://itunes.apple.com/us/app/apple-store/${
      config.APPLE_STORE_ID
    }?mt=8`
    const androidLink = `market://details?id=${config.PLAY_STORE_ID}`

    const rateHorshaTitle = t('profileAndSettings/rateHorshaTitle')
    const rateHorshaDescription = t('profileAndSettings/rateHorshaDescription')
    const rateHorshaLink = t('profileAndSettings/rateHorshaLink')
    const notNowText = t('common/notNow')

    Alert.alert(rateHorshaTitle, rateHorshaDescription, [
      {
        text: rateHorshaLink,
        onPress: () => {
          Linking.openURL(Platform.OS === 'android' ? androidLink : iosLink)
        },
      },
      { text: notNowText },
    ])
  }

  logout = () => {
    this.props.actions.logoutCurrentUser()
    this.props.navigation.navigate('Login')
  }

  render() {
    const { user, horses } = this.props

    if (horses.fetching) {
      return <Loading type="spinner" />
    }

    const hasHorses = !!horses && !!horses.horses.length
    return (
      <ScrollView style={styles.scrollView}>
        <View style={styles.whiteBg}>
          <TouchableOpacity onPress={() => this.navigateToUserProfile(user.id)}>
            <View style={styles.section}>
              <UserImage user={user} style={styles.userImage} />

              <View style={styles.userContent}>
                <UserLink
                  userId={user.id}
                  text={user.name}
                  type="title"
                  weight="bold"
                  style={styles.userNameText}
                  navigation={this.props.navigation}
                />
              </View>
            </View>
          </TouchableOpacity>
        </View>

        {hasHorses && (
          <View>
            <MenuItem
              onPress={() => this.navigateToJournal()}
              icon="journal"
              title="horses/journal"
            />

            <MenuItem
              onPress={() => this.navigateToRides()}
              icon="rides"
              title="horses/rides"
            />

            <MenuItem
              onPress={() => this.navigateToAlbum()}
              icon="add_photo"
              title="horses/album"
            />

            <MenuItem
              onPress={() => this.navigateToUserProfile(user.id)}
              icon="profile"
              title="horses/profile"
            />

            <MenuItem
              onPress={() => this.navigateToStats(user.id)}
              icon="stats"
              title="horses/stats"
            />
          </View>
        )}

        <View style={styles.linkSection}>
          <MenuItem
            onPress={() => this.navigateToSettings()}
            icon="settings"
            title="profileAndSettings/settings"
          />

          <MenuItem
            onPress={() => this.navigateToHelp()}
            icon="help"
            title="profileAndSettings/help"
          />

          <MenuItem
            onPress={() => this.navigateToSendFeedback()}
            icon="send_feedback_option_a"
            title="profileAndSettings/sendFeedback"
          />

          {/*TODO: This is added back in HYB-1041 */}
          {/*<MenuItem*/}
          {/*onPress={() => this.navigateToRateThisApp()}*/}
          {/*icon='settings_rate_app'*/}
          {/*title='profileAndSettings/rateTheApp'*/}
          {/*iconStyle={styles.yellowIcon}*/}
          {/*/>*/}
        </View>

        <View style={[styles.linkSection, styles.logoutSection]}>
          <MenuItem
            onPress={() => this.logout()}
            title="profileAndSettings/logout"
          />
        </View>
      </ScrollView>
    )
  }
}

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
    backgroundColor: theme.backgroundColor,
  },
  whiteBg: {
    backgroundColor: 'white',
  },
  section: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomColor: theme.border,
    borderBottomWidth: 1,
    padding: theme.paddingHorizontal,
  },
  linkSection: {
    borderTopColor: theme.border,
    borderTopWidth: 1,
    marginTop: 30,
  },
  logoutSection: {
    marginBottom: 50,
  },
  userImage: {
    width: 85,
    height: 85,
    resizeMode: 'contain',
  },
  userContent: {
    flex: 1,
    flexWrap: 'wrap',
    marginLeft: 15,
  },
  userNameText: {
    fontSize: 18,
  },
  grayIcon: {
    fontSize: 24,
    color: '#b3b3b3',
  },
  greenIcon: {
    fontSize: 24,
    color: theme.secondaryColor,
  },
  largerIcon: {
    fontSize: 26,
  },
})

export default connect(
  state => ({
    user: state.user.user,
    horses: state.horses,
    horseUser:
      (state && state.horses !== undefined && state.horses.horses[0]) || [],
  }),
  dispatch => ({
    actions: bindActionCreators({ ...horseActions, ...authActions }, dispatch),
  })
)(ProfileAndSettings)
