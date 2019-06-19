import React, { PureComponent } from 'react'
import { StyleSheet, View } from 'react-native'
import moment from 'moment'
import { theme } from '@styles/theme'

import Text from '@components/Text'

class RecordAddRideStat extends PureComponent {
  renderValue = () => {
    const { value, unit } = this.props

    if (unit === 'date') {
      return moment(value).format('MMMM D, hh:mm a')
    }

    if (unit === 'hh:mm:ss') {
      return value.format('hh:mm:ss', { trim: false })
    }

    return value
  }

  render() {
    const { label, unit, shouldShowUnit = true } = this.props

    return (
      <View style={styles.container}>
        <View style={styles.valueContainer}>
          <Text
            type="title"
            weight="bold"
            style={styles.value}
            text={this.renderValue()}
          />

          {unit && shouldShowUnit && (
            <Text type="title" style={styles.unit} text={unit.toUpperCase()} />
          )}
        </View>

        {label && (
          <Text
            type="title"
            weight="bold"
            style={styles.label}
            text={label.toUpperCase()}
          />
        )}
      </View>
    )
  }
}

const styles = StyleSheet.create({
  container: {
    marginLeft: 15,
    marginBottom: 5,
  },
  valueContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  value: {
    color: '#747474',
    fontSize: 20,
  },
  unit: {
    fontSize: theme.font.sizes.smallest,
    color: '#747474',
    marginBottom: 3,
    marginLeft: 5,
  },
  label: {
    color: '#A8A8A8',
    fontSize: theme.font.sizes.smallest,
  },
})

export default RecordAddRideStat
