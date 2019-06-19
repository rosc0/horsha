import React, { PureComponent } from 'react'
import { StyleSheet, View } from 'react-native'

class Separator extends PureComponent {
  render = () => <View style={[styles.container, this.props.style]} />
}

const styles = StyleSheet.create({
  container: {
    borderBottomWidth: 1,
    borderBottomColor: '#CCC',
    marginVertical: 15,
  },
})

export default Separator
