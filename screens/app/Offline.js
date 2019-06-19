import React, { PureComponent } from 'react'
import { StyleSheet, View } from 'react-native'
import { connect } from 'react-redux'
import hoistStatics from 'hoist-non-react-statics'

import Text from '@components/Text'

export default WrappedComponent => {
  class Offline extends PureComponent {
    render() {
      if (this.props.app.isDeviceConnected) {
        return <WrappedComponent {...this.props} />
      }

      return (
        <View style={styles.container}>
          <Text
            type="title"
            weight="bold"
            style={styles.errorTitle}
            message="offline/noInternetTitle"
          />

          <Text
            type="title"
            style={styles.errorContent}
            message="offline/noInternetContent"
          />
        </View>
      )
    }
  }

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: 30,
      backgroundColor: 'white',
    },
    errorTitle: {
      fontSize: 24,
      textAlign: 'center',
      color: '#1E8583',
    },
    errorContent: {
      marginTop: 10,
      fontSize: 20,
      textAlign: 'center',
      color: 'black',
    },
  })

  const mapStateToProps = ({ app }) => ({ app })
  return hoistStatics(connect(mapStateToProps)(Offline), WrappedComponent)
}
