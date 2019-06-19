import React, { PureComponent } from 'react'
import { Image, Platform, StyleSheet, TouchableOpacity } from 'react-native'
import { withNavigation } from 'react-navigation'

import Text from './Text'

class BackButton extends PureComponent {
  render() {
    const { goBack } = this.props.navigation
    const {
      onPress = () => goBack(null),
      buttonStyle,
      style,
      title = 'common/back',
    } = this.props

    return (
      <TouchableOpacity onPress={onPress} style={[styles.button, buttonStyle]}>
        <Image
          source={require('../images/icons/back-icon.png')}
          style={[styles.icon, style]}
        />
        {Platform.OS === 'ios' && (
          <Text
            message={title}
            type="title"
            weight="bold"
            style={{ color: 'white', fontSize: 16, fontFamily: 'Nunito-Bold' }}
          />
        )}
      </TouchableOpacity>
    )
  }
}

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  icon: {
    tintColor: 'white',
    resizeMode: 'contain',
    ...Platform.select({
      ios: {
        height: 21,
        width: 13,
        marginLeft: 9,
        marginRight: 6,
      },
      android: {
        height: 24,
        width: 24,
        margin: 16,
      },
    }),
  },
})

export default withNavigation(BackButton)
