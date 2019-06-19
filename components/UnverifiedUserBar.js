import React, { PureComponent } from 'react'
import { connect } from 'react-redux'
//import { bindActionCreators } from 'redux'
import { StyleSheet, TouchableOpacity } from 'react-native'

import Text from '@components/Text'
import Icon from '@components/Icon'

import { theme } from '@styles/theme'

class UnverifiedUserBar extends PureComponent {
  render() {
    const { navigation } = this.props

    return (
      <TouchableOpacity
        onPress={() => navigation.navigate('UnverifiedEmail')}
        activeOpacity={0.7}
        style={styles.container}
      >
        <Icon name="flag_report" style={styles.icon} />
        <Text type="title" message={'unverified/bar'} style={styles.text} />
      </TouchableOpacity>
    )
  }
}

const styles = StyleSheet.create({
  container: {
    padding: 14,
    flexDirection: 'row',
    backgroundColor: '#f1af44',
    justifyContent: 'center',
    alignItems: 'center',
  },
  icon: {
    color: 'white',
    fontSize: 22,
  },
  text: {
    color: 'white',
    fontSize: theme.font.sizes.default,
    marginLeft: 5,
  },
})

export default connect(state => ({ user: state.user }))(UnverifiedUserBar)
