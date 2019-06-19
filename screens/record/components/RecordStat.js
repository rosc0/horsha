import React, { PureComponent } from 'react'
import { StyleSheet, View } from 'react-native'

import { theme } from '@styles/theme'
import Text from '@components/Text'

class RecordStat extends PureComponent {
  render() {
    const { value, label, style, valueStyle } = this.props

    return (
      <View style={[styles.container, style]}>
        <Text
          type="title"
          weight="bold"
          style={[styles.text, styles.value, valueStyle]}
          text={value}
        />
        <Text style={styles.text} text={label.toUpperCase()} />
      </View>
    )
  }
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'rgba(255,255,255,0.9)',
    flex: 1,
    flexDirection: 'column',
    margin: 5,
    paddingHorizontal: theme.paddingHorizontal,
    paddingVertical: 10,
    borderRadius: 5,
  },
  text: {
    color: '#DA5F35',
    fontSize: 12,
    textAlign: 'center',
    backgroundColor: 'transparent',
  },
  value: {
    fontSize: 20,
  },
})

export default RecordStat
