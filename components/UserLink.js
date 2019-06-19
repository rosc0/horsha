import React, { PureComponent } from 'react'
import { TouchableOpacity } from 'react-native'

import Text from './Text'

class UserLink extends PureComponent {
  navigateToUserProfile = userId => {
    const { navigation } = this.props

    navigation.navigate('UserProfile', {
      userId: userId,
      fromRoute: navigation.state.params && navigation.state.params.fromRoute,
    })
  }

  render() {
    const {
      userId,
      text,
      type,
      message,
      values,
      weight,
      style,
      children,
    } = this.props

    const showText = text || message

    return (
      <TouchableOpacity
        activeOpacity={0.7}
        onPress={() => this.navigateToUserProfile(userId)}
      >
        {showText && (
          <Text
            type={type}
            text={text}
            message={message}
            values={values}
            weight={weight}
            style={style}
          />
        )}

        {children && this.props.children}
      </TouchableOpacity>
    )
  }
}

export default UserLink
