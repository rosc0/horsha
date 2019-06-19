import React, { PureComponent } from 'react'
import { StyleSheet, View, WebView } from 'react-native'
import config from 'react-native-config'
import HeaderTitle from '@components/HeaderTitle'

class LicensesAndCredits extends PureComponent {
  static navigationOptions = ({ navigation }) => ({
    headerTitle: <HeaderTitle title={'settings/licensesAndCredits'} />,
  })

  render() {
    return (
      <View style={styles.wrapper}>
        <WebView
          source={{ uri: `${config.WEBSITE_BASE_URL}#/license-and-credits` }}
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

export default LicensesAndCredits
