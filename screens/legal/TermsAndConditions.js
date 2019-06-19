import React, { PureComponent } from 'react'
import { StyleSheet, View, WebView } from 'react-native'

import config from 'react-native-config'
import HeaderTitle from '@components/HeaderTitle'

class TermsAndConditions extends PureComponent {
  static navigationOptions = ({ navigation }) => ({
    headerTitle: <HeaderTitle title={'legal/termsAndConditions'} />,
  })

  render() {
    return (
      <View style={styles.wrapper}>
        <WebView
          source={{ uri: `${config.WEBSITE_BASE_URL}#/terms-and-conditions` }}
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

export default TermsAndConditions
