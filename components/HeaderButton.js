import React, { PureComponent } from 'react'
import { StyleSheet, TouchableOpacity } from 'react-native'

import Text from './Text'

class HeaderButton extends PureComponent {
  render() {
    const { children, style, textStyle, ...props } = this.props

    return (
      <TouchableOpacity {...props} style={[styles.container, style]}>
        {typeof children === 'string' ? (
          <Text
            type="title"
            weight="bold"
            style={[styles.text, textStyle]}
            text={children}
          />
        ) : (
          children
        )}
      </TouchableOpacity>
    )
  }
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
  },
  text: {
    color: 'white',
    paddingLeft: 10,
    fontSize: 16,
    fontFamily: 'Nunito-Bold',
  },
})

export default HeaderButton
