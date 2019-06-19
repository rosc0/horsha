import React, { PureComponent } from 'react'
import { StyleSheet, View } from 'react-native'

import Text from '@components/Text'
import { theme } from '@styles/theme'

class ProfileStat extends PureComponent {
  render() {
    const { value, unit, label } = this.props

    return (
      <View style={styles.container}>
        <View style={styles.valueContainer}>
          <Text type="title" weight="bold" style={styles.value} text={value} />

          {unit && (
            <Text
              type="title"
              weight="semiBold"
              style={styles.unit}
              text={unit.toUpperCase()}
            />
          )}
        </View>

        <Text
          type="title"
          weight="bold"
          style={styles.label}
          text={label.toUpperCase()}
        />
      </View>
    )
  }
}

const styles = StyleSheet.create({
  container: {
    marginRight: 20,
  },
  valueContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  value: {
    ...theme.font.rideStatusNumber,
    // color: '#8E8E8E',
    fontSize: 23,
  },
  unit: {
    color: '#8C8C8C',
    fontSize: theme.font.sizes.smallest,
    marginLeft: 5,
    marginBottom: 5,
  },
  label: {
    color: '#A8A8A8',
    fontSize: theme.font.sizes.smallest,
  },
})

export default ProfileStat
