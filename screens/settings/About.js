import React, { PureComponent } from 'react'
import { StyleSheet, View } from 'react-native'
import DeviceInfo from 'react-native-device-info'

import HeaderTitle from '@components/HeaderTitle'
import MenuItem from '@components/MenuItem'
import { theme } from '@styles/theme'

class About extends PureComponent {
  static navigationOptions = {
    headerTitle: <HeaderTitle title={'settings/about'} />,
    tabBarVisible: false,
  }

  navigateToLicenses = () => {
    this.props.navigation.navigate('LicensesAndCredits')
  }

  navigateToPrivacy = () => {
    this.props.navigation.navigate('PrivacyPolicy')
  }

  navigateToTerms = () => {
    this.props.navigation.navigate('TermsAndConditions')
  }

  render() {
    const versionNumber = DeviceInfo.getVersion()

    return (
      <View style={styles.wrapper}>
        <MenuItem
          onPress={() => this.navigateToLicenses()}
          title="settings/licensesAndCredits"
        />

        <MenuItem
          onPress={() => this.navigateToPrivacy()}
          title="settings/privacyPolicy"
        />

        <MenuItem
          onPress={() => this.navigateToTerms()}
          title="legal/termsAndConditions"
        />

        <MenuItem
          title="settings/version"
          showArrow={false}
          valueText={versionNumber}
        />
      </View>
    )
  }
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    backgroundColor: theme.backgroundColor,
  },
})

export default About
