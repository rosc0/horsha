import React, { PureComponent } from 'react'
import { View, StyleSheet, Dimensions, TouchableOpacity } from 'react-native'
import Text from '@components/Text'
import { theme } from '../../../styles/theme'

const { width } = Dimensions.get('screen')

export default class Reasearch extends PureComponent {
  render() {
    return (
      <TouchableOpacity onPress={this.props.onPress} style={styles.wrapper}>
        <Text message={'trails/redo'} weight="bold" style={styles.text} />
      </TouchableOpacity>
    )
  }
}

const styles = StyleSheet.create({
  wrapper: {
    justifyContent: 'center',
    alignItems: 'center',
    width: width / 2,
    backgroundColor: 'white',
    borderRadius: 5,
    borderColor: theme.secondaryColor,
    borderWidth: 1,
    padding: 5,
  },
  text: {
    color: theme.secondaryColor,
  },
})
