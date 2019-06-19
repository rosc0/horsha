import React, { PureComponent } from 'react'
import { StyleSheet, View, WebView } from 'react-native'

import config from 'react-native-config'
import HeaderTitle from '@components/HeaderTitle'

class PrivacyPolicy extends PureComponent {
  static navigationOptions = ({ navigation }) => ({
    headerTitle: <HeaderTitle title={'legal/privacyPolicy'} />,
  })

  render() {
    return (
      <View style={styles.wrapper}>
        <WebView
          source={{ uri: `${config.WEBSITE_BASE_URL}#/privacy-policy` }}
        />
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

export default PrivacyPolicy
