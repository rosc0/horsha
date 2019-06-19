import React, { PureComponent } from 'react'
import { ScrollView, StyleSheet } from 'react-native'
import { connect } from 'react-redux'

import { theme } from '@styles/theme'
import HeaderTitle from '@components/HeaderTitle'
import MenuItem from '@components/MenuItem'

class SettingsList extends PureComponent {
  static navigationOptions = {
    headerTitle: <HeaderTitle title={'settings/settingsTitle'} />,
    tabBarVisible: false,
  }

  navigateToNotifications = () => {
    this.props.navigation.navigate('NotificationSettings')
  }

  navigateToUnits = () => {
    this.props.navigation.navigate('UnitSettings')
  }

  navigateToHorseHeight = () => {
    this.props.navigation.navigate('HeightSettings')
  }

  navigateToManageEmails = () => {
    this.props.navigation.navigate('ManageEmails')
  }

  navigateToChangePassword = () => {
    this.props.navigation.navigate('ChangePassword')
  }

  navigateToAbout = () => {
    this.props.navigation.navigate('About')
  }

  render() {
    const { user: user } = this.props
    const userUnit = `settings/${
      user.user.account.preferences.unitSystem.toLocaleLowerCase()
        ? user.user.account.preferences.unitSystem.toLocaleLowerCase()
        : 'metric'
    }`
    const userHeight = `settings/${
      user.user.account.preferences.heightUnit.toLocaleLowerCase()
        ? user.user.account.preferences.heightUnit.toLocaleLowerCase()
        : 'centimeters'
    }`

    return (
      <ScrollView style={styles.wrapper}>
        <MenuItem
          onPress={() => this.navigateToManageEmails()}
          icon="settings_account"
          title="settings/manageEmails"
        />

        <MenuItem
          onPress={() => this.navigateToChangePassword()}
          icon="settings_account"
          title="settings/changePassword"
        />

        <MenuItem
          onPress={() => this.navigateToNotifications()}
          icon="settings_notifications"
          title="settings/notifications"
        />

        <MenuItem
          onPress={() => this.navigateToUnits()}
          icon="settings_units_of_measure"
          title="settings/unitsOfMeasure"
          valueText={userUnit}
        />

        <MenuItem
          onPress={() => this.navigateToHorseHeight()}
          icon="settings_horse_height"
          title="settings/horseHeight"
          valueText={userHeight}
        />

        <MenuItem
          onPress={() => this.navigateToAbout()}
          icon="version"
          title="settings/about"
        />
      </ScrollView>
    )
  }
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    backgroundColor: theme.backgroundColor,
  },
})

export default connect(state => ({
  user: state.user,
}))(SettingsList)
