import React, { PureComponent } from 'react'
import { Image, StyleSheet } from 'react-native'
// import { horseIcon, userIcon } from '@components/Icons'

export const horseIcon = require('@images/icons/horses.png')
export const userIcon = require('@images/default_user.png')

class Avatar extends PureComponent {
  static defaultProps = {
    type: 'horse',
    profile: {},
    style: {},
    origin: null,
  }

  state = {
    picture: null,
  }

  getPicture = () => {
    const { profile, type, newModel = false } = this.props

    if (newModel) {
      const uri =
        profile && profile.picture && profile.picture.url && profile.picture.url

      return {
        uri,
      }
    }

    if (!newModel || profile.profile_picture) {
      const uri =
        profile.profile_picture &&
        profile.profile_picture.url &&
        `${profile.profile_picture.url}?t=300x300,fill`

      return {
        uri,
      }
    }

    if (type === 'horse') {
      this.setState({
        horsePlaceholder: false,
      })
      return horseIcon
    }

    return userIcon
  }

  setPlaceholderAvatar = () =>
    this.setState({
      picture: this.props.type === 'horse' ? horseIcon : userIcon,
    })

  render() {
    const { style } = this.props
    const pic = this.getPicture()
    return (
      <Image
        source={userIcon}
        style={[
          styles.avatar,
          style,
          pic === horseIcon &&
            style.width > 100 &&
            this.props.type === 'horse' && {
              borderRadius: 0,
              backgroundColor: 'transparent',
            },
        ]}
        onError={this.setPlaceholderAvatar}
        resizeMode="cover"
      />
    )
  }
}

const styles = StyleSheet.create({
  avatar: {
    width: 30,
    height: 30,
    resizeMode: 'cover',
    backgroundColor: '#eaeaea',
  },
})

export default Avatar
