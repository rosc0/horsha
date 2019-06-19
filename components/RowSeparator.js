import React, { PureComponent } from 'react'
import { StyleSheet, View } from 'react-native'
import { theme } from '@styles/theme'

class RowSeparator extends PureComponent {
  render = () => <View style={[styles.rowSeparator, this.props.style]} />
}

const styles = StyleSheet.create({
  rowSeparator: {
    borderTopColor: theme.backgroundColor,
    borderTopWidth: 1,
  },
})

export default RowSeparator
