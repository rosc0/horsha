import React, { PureComponent } from 'react'
import { StyleSheet, TouchableOpacity } from 'react-native'
import { IconImage } from '@components/Icons'

class AddButton extends PureComponent {
  static defaultProps = {
    onPress: () => {},
    buttonStyle: {},
    imageStyle: {},
  }

  render() {
    const { onPress, buttonStyle, imageStyle } = this.props

    return (
      <TouchableOpacity
        activeOpacity={0.7}
        onPress={onPress}
        style={[styles.button, buttonStyle]}
      >
        <IconImage source="addIcon" style={styles.image} fill="white" svg />
      </TouchableOpacity>
    )
  }
}

const styles = StyleSheet.create({
  image: {
    width: 25,
    height: 25,
    marginRight: 10,
  },
})

export default AddButton
