import React, { PureComponent } from 'react'
import { StyleSheet, TouchableHighlight, View } from 'react-native'
import { connect } from 'react-redux'

import Text from '@components/Text'

// const STATUSBAR_HEIGHT = Platform.OS === 'ios' ? 20 : 0
// const APPBAR_HEIGHT = Platform.OS === 'ios' ? 44 : 55

class OfflineWarning extends PureComponent {
  constructor(props) {
    super(props)

    this.state = {
      show: !props.app.isDeviceConnected,
    }
  }

  componentDidUpdate(prevProps) {
    if (this.props.app.isDeviceConnected !== prevProps.app.isDeviceConnected) {
      return this.setState({
        show: !this.props.app.isDeviceConnected,
      })
    }
  }

  handleCloseWarning = () => this.setState({ show: false })

  render() {
    if (!this.state.show) {
      return <View />
    }

    return (
      <TouchableHighlight
        onPress={this.handleCloseWarning}
        style={styles.container}
      >
        <Text style={styles.text} message="offline/noInternetContent" />
      </TouchableHighlight>
    )
  }
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    width: '100%',
    padding: 10,
    justifyContent: 'space-between',
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#418382',
  },
  text: {
    color: '#418382',
    textAlign: 'center',
  },
})

const mapStateToProps = ({ app }) => ({
  app,
})

export default connect(mapStateToProps)(OfflineWarning)
