import React, { PureComponent } from 'react'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import { StyleSheet, View } from 'react-native'

import { calculateSpeed } from '../utils'
import Text from './Text'

class Speed extends PureComponent {
  render() {
    const { speed, rowStyle, speedStyle, unitStyle, style, user } = this.props

    const userUnit = user.user.account.preferences.unitSystem
    const calculatedSpeed = calculateSpeed(speed, userUnit)
    const unit = userUnit === 'IMPERIAL' ? 'MPH' : 'KM/H'

    return (
      <View style={[styles.row, rowStyle]}>
        <Text
          weight="semiBold"
          text={calculatedSpeed}
          style={[speedStyle, style]}
        />
        <Text text={unit} style={[unitStyle, style]} />
      </View>
    )
  }
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
  },
})

export default connect(
  state => ({
    user: state.user,
  }),
  dispatch => ({
    actions: bindActionCreators(dispatch),
  })
)(Speed)
