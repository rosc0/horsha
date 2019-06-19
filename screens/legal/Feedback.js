import React, { PureComponent } from 'react'
import { StyleSheet, View, WebView } from 'react-native'
import config from 'react-native-config'

import HeaderTitle from '@components/HeaderTitle'

class NavigateToSendFeedback extends PureComponent {
  static navigationOptions = {
    headerTitle: <HeaderTitle title={'profileAndSettings/sendFeedback'} />,
  }

  render() {
    return (
      <View style={styles.wrapper}>
        <WebView source={{ uri: `${config.WEBSITE_BASE_URL}#/sendFeedback` }} />
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

export default NavigateToSendFeedback
