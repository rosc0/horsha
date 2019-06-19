import React, { PureComponent } from 'react'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import { StyleSheet, View } from 'react-native'

import { calculateDistance, calculateElevation } from '../utils'

import Text from './Text'

class Distance extends PureComponent {
  render() {
    const {
      distance,
      rowStyle,
      distanceStyle,
      unitStyle,
      distanceWeight,
      unitWeight,
      style,
      user,
      elevation,
      decimalPlaces,
      unitLowerCase = false,
      statsRounded = false,
    } = this.props

    const { unitSystem: userUnit } = user.user.account.preferences
    let calculatedDistance
    let unit

    if (distance !== 0) {
      if (elevation) {
        calculatedDistance = calculateElevation(
          distance,
          userUnit,
          decimalPlaces
        )
        unit = userUnit === 'IMPERIAL' ? 'ft' : 'm'
      } else {
        calculatedDistance = calculateDistance(
          distance,
          userUnit,
          decimalPlaces
        )
        if (statsRounded && calculatedDistance >= 100) {
          calculatedDistance = Math.floor(calculatedDistance)
        }
        unit = userUnit === 'IMPERIAL' ? 'Mi' : 'KM'
      }
    } else {
      calculatedDistance = '0'
    }

    return (
      <View style={[styles.row, rowStyle]}>
        <Text
          weight={distanceWeight ? distanceWeight : 'semiBold'}
          text={
            calculatedDistance.length > 5
              ? calculatedDistance.slice(0, calculatedDistance.length - 3)
              : calculatedDistance
          }
          localeFallback={true}
          style={[distanceStyle, style]}
        />
        <Text
          text={unitLowerCase ? unit.toLowerCase() : unit}
          weight={unitWeight ? unitWeight : 'normal'}
          style={[unitStyle, style]}
        />
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
)(Distance)
