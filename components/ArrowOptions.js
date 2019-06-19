import React, { PureComponent } from 'react'
import { Image, StyleSheet, TouchableOpacity } from 'react-native'
import { arrowIcon } from './Icons'

class ArrowBottomButton extends PureComponent {
  static defaultProps = {
    style: {},
    onPress: () => {},
    wrapperStyle: {},
  }

  render() {
    const { style, onPress, wrapperStyle } = this.props
    const styling = [styles.image, style]

    return (
      <TouchableOpacity
        activeOpacity={1}
        onPress={onPress}
        style={wrapperStyle}
      >
        <Image style={styling} source={arrowIcon} />
      </TouchableOpacity>
    )
  }
}

const styles = StyleSheet.create({
  image: {
    width: 20,
    height: 20,
    resizeMode: 'contain',
    justifyContent: 'flex-end',
  },
})

export default ArrowBottomButton
