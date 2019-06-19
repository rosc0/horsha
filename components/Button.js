import React, { PureComponent } from 'react'
import { TouchableOpacity, Image, StyleSheet } from 'react-native'
import { theme } from '@styles/theme'

import Text from './Text'

class Button extends PureComponent {
  static defaultProps = {
    type: 'default',
    color: 'white',
    label: '',
    onPress: () => {},
    children: null,
    style: '',
    textStyle: {},
    disabled: false,
  }

  render() {
    const {
      type,
      color,
      label,
      onPress,
      children,
      style,
      textStyle,
      disabled,
      icon,
      iconStyles = {},
    } = this.props

    return (
      <TouchableOpacity
        disabled={disabled}
        onPress={onPress}
        style={[
          theme.buttons[type],
          style,
          { flexDirection: 'row', justifyContent: 'center' },
          disabled ? { opacity: 0.5 } : {},
        ]}
        activeOpacity={disabled ? 1 : 0.7}
      >
        {icon && <Image style={[styles.icon, iconStyles]} source={icon} />}
        {label ? (
          <Text
            type="title"
            weight="bold"
            message={label}
            style={[
              {
                color,
              },
              textStyle,
            ]}
          />
        ) : (
          children
        )}
      </TouchableOpacity>
    )
  }
}

const styles = StyleSheet.create({
  icon: {
    width: 15,
    height: 15,
    resizeMode: 'contain',
    marginRight: 5,
    tintColor: theme.secondaryColor,
  },
})

export default Button
