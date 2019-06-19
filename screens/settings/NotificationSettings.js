import React, { PureComponent } from 'react'
import { StyleSheet, Switch, TouchableOpacity, View } from 'react-native'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import Text from '@components/Text'
import HeaderTitle from '@components/HeaderTitle'
import Icon from '@components/Icon'
import { theme } from '@styles/theme'
import * as userActions from '@actions/user'

class NotificationSettings extends PureComponent {
  static navigationOptions = ({ navigation }) => ({
    headerTitle: <HeaderTitle title={'settings/notificationSettingsTitle'} />,
    tabBarVisible: false,
  })

  state = {
    notifications: true,
    settings: {
      horse: false,
      post: false,
      // trail_content: false,
    },
  }

  savePreferences = () => {
    const { user } = this.props

    const preferences = {
      ...user.user.account.preferences,
      pushEnabled: this.state.notifications,
      pushTopics: this.state.settings,
    }

    this.props.actions.updateUserPreferences(preferences)
  }

  toggleNotifications = async () => {
    await this.setState({
      notifications: !this.state.notifications,
      settings: {
        post: !this.state.notifications,
        trail_content: !this.state.notifications,
        horse: !this.state.notifications,
      },
    })

    this.savePreferences()
  }

  optionPress = async option => {
    if (this.state.notifications) {
      await this.setState({
        settings: {
          ...this.state.settings,
          [option]: !this.state.settings[option],
        },
      })

      this.savePreferences()
    }
  }

  componentDidMount() {
    const { user } = this.props

    this.setState({
      notifications: user.user.account.preferences.pushEnabled,
      settings: user.user.account.preferences.pushTopics,
    })
  }

  render() {
    const activeOpacity = this.state.notifications ? 0.7 : 1

    return (
      <View style={styles.wrapper}>
        <View style={styles.notificationsSelect}>
          <View style={styles.row}>
            <Text
              weight="semiBold"
              message="settings/notifications"
              style={styles.rowText}
            />
            <Switch
              onValueChange={this.toggleNotifications.bind(this)}
              value={this.state.notifications}
              trackColor={{ true: theme.secondaryColor }}
            />
          </View>
        </View>

        <View style={styles.settingsList}>
          <View style={[styles.row, styles.settingsRow, styles.rowBorder]}>
            <Icon name="horse" style={styles.icon} />
            <Text
              weight="semiBold"
              message="settings/horseTeamUpdates"
              style={styles.rowText}
            />
            <TouchableOpacity
              activeOpacity={activeOpacity}
              onPress={() => this.optionPress('horse')}
              style={styles.touch}
            >
              <View
                style={[
                  styles.checkbox,
                  this.state.settings.horse
                    ? styles.checkboxOn
                    : styles.checkboxOff,
                ]}
              >
                {this.state.settings.horse && (
                  <Icon name="settings_tick" style={styles.checkIcon} />
                )}
              </View>
            </TouchableOpacity>
          </View>

          <View style={[styles.row, styles.settingsRow, styles.rowBorder]}>
            <Icon name="journal" style={styles.icon} />
            <Text
              weight="semiBold"
              message="settings/horseJounalUpdates"
              style={styles.rowText}
            />
            <TouchableOpacity
              activeOpacity={activeOpacity}
              onPress={() => this.optionPress('post')}
              style={styles.touch}
            >
              <View
                style={[
                  styles.checkbox,
                  this.state.settings.post
                    ? styles.checkboxOn
                    : styles.checkboxOff,
                ]}
              >
                {this.state.settings.post && (
                  <Icon name="settings_tick" style={styles.checkIcon} />
                )}
              </View>
            </TouchableOpacity>
          </View>

          {/* <View style={[styles.row, styles.settingsRow]}>
            <Icon name="trails" style={styles.icon} />
            <Text
              weight="semiBold"
              message="settings/trailNews"
              style={styles.rowText}
            />
            <TouchableOpacity
              activeOpacity={activeOpacity}
              onPress={() => this.optionPress('trail_content')}
              style={styles.touch}
            >
              <View
                style={[
                  styles.checkbox,
                  this.state.settings.trail_content
                    ? styles.checkboxOn
                    : styles.checkboxOff,
                ]}
              >
                {this.state.settings.trail_content && (
                  <Icon name="settings_tick" style={styles.checkIcon} />
                )}
              </View>
            </TouchableOpacity>
          </View> */}
        </View>
      </View>
    )
  }
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    backgroundColor: theme.backgroundColor,
  },
  notificationsSelect: {
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: theme.border,
    borderTopWidth: 1,
    borderTopColor: theme.border,
    marginTop: 15,
    padding: 10,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingsRow: {
    paddingLeft: 15,
  },
  rowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: theme.border,
  },
  rowText: {
    flex: 1,
    fontSize: theme.font.sizes.defaultPlus,
    color: '#757575',
  },
  settingsList: {
    backgroundColor: 'white',
    marginTop: 15,
    marginHorizontal: 15,
    borderRadius: 10,
  },
  icon: {
    fontSize: 22,
    marginRight: 10,
  },
  touch: {
    padding: 15,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxOff: {
    backgroundColor: theme.border,
  },
  checkboxOn: {
    backgroundColor: theme.secondaryColor,
  },
  checkIcon: {
    fontSize: 20,
    color: 'white',
  },
})

export default connect(
  state => ({
    user: state.user,
  }),
  dispatch => ({
    actions: bindActionCreators(
      {
        ...userActions,
      },
      dispatch
    ),
  })
)(NotificationSettings)
