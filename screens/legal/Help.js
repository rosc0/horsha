import React, { PureComponent } from 'react'
import { StyleSheet, View, WebView } from 'react-native'
import config from 'react-native-config'

import HeaderTitle from '@components/HeaderTitle'
class LicensesAndCredits extends PureComponent {
  static navigationOptions = {
    headerTitle: <HeaderTitle title={'profileAndSettings/help'} />,
  }

  render() {
    return (
      <View style={styles.wrapper}>
        <WebView source={{ uri: `${config.WEBSITE_BASE_URL}#/help` }} />
      </View>
    )
  }
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    backgroundColor: 'white',
  },
})

export default LicensesAndCredits
