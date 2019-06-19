import React, { PureComponent } from 'react'
import { Image, ScrollView, StyleSheet } from 'react-native'

import Text from '@components/Text'
import { IconImage } from '@components/Icons'

class EmptyFriends extends PureComponent {
  render() {
    return (
      <ScrollView contentContainerStyle={styles.container}>
        <IconImage source="friendsIcon" style={styles.image} />

        <Text
          message="friends/noFriendsTitle"
          style={[styles.text, styles.noFriendsText]}
        />

        <Text message="friends/noFriendsInfo" style={styles.text} />
      </ScrollView>
    )
  }
}

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 20,
    paddingHorizontal: 50,
  },
  image: {
    tintColor: '#BCBCBC',
    marginBottom: 20,
    width: 120,
    height: 120,
    resizeMode: 'contain',
  },
  text: {
    textAlign: 'center',
  },
  noFriendsText: {
    fontSize: 17,
    color: 'black',
    marginBottom: 5,
  },
})

export default EmptyFriends
