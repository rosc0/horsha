import React, { PureComponent } from 'react'
import { StyleSheet, TouchableOpacity } from 'react-native'

import Icon from '../Icon'

class AddButton extends PureComponent {
  render() {
    const { icon, onPress, buttonStyle, style, ...rest } = this.props

    return (
      <TouchableOpacity
        activeOpacity={0.7}
        onPress={onPress}
        style={buttonStyle}
      >
        <Icon {...rest} name={icon} style={[styles.icon, style]} />
      </TouchableOpacity>
    )
  }
}

const styles = StyleSheet.create({
  icon: {
    fontSize: 37,
    color: 'white',
    marginRight: 5,
  },
})

export default AddButton
