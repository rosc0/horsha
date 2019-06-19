import React, { PureComponent } from 'react'
import { StyleSheet, View } from 'react-native'
import Text from './Text'

class ListEmpty extends PureComponent {
  static defaultProps = {
    message: null,
    text: null,
    rowStyle: null,
    textStyle: null,
  }

  render() {
    const { message, text, rowStyle, textStyle } = this.props

    return (
      <View style={[styles.row, rowStyle]}>
        <Text message={message} text={text} style={textStyle} />
      </View>
    )
  }
}

const styles = StyleSheet.create({
  row: {
    padding: 15,
    backgroundColor: 'white',
  },
})

export default ListEmpty
