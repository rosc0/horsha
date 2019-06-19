import React, { PureComponent } from 'react'
import {
  FlatList,
  Image,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native'
import { theme } from '@styles/theme'

class ProfileHorseTeam extends PureComponent {
  handleGoToUser = userId =>
    this.props.navigate('UserProfile', { userId: userId })

  renderItem = ({ item }) => {
    const image = item.image
      ? { uri: `${item.image}?t=300x300,fill` }
      : require('@images/default_user.png')

    return (
      <TouchableOpacity
        style={styles.user}
        onPress={() => this.handleGoToUser(item.key)}
        key={item.key}
      >
        <Image source={image} style={styles.userPicture} />

        {item.relationType === 'owner' && (
          <View style={styles.ownerIndicator} />
        )}
      </TouchableOpacity>
    )
  }

  render() {
    const { users } = this.props

    return (
      <FlatList
        data={users}
        renderItem={this.renderItem}
        horizontal={true}
        style={styles.container}
      />
    )
  }
}

const styles = StyleSheet.create({
  container: {
    marginTop: 15,
  },
  user: {
    marginRight: 1,
    position: 'relative',
    backgroundColor: '#eaeaea',
  },
  userPicture: {
    width: 89,
    height: 89,
    resizeMode: 'contain',
  },
  ownerIndicator: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    width: '100%',
    height: 6,
    backgroundColor: theme.secondaryColor,
  },
})

export default ProfileHorseTeam
