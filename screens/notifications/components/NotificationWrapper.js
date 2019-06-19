import React, { PureComponent } from 'react'
import { StyleSheet, TouchableOpacity, View } from 'react-native'

import Text from '@components/Text'
import UserLink from '@components/UserLink'
import UserImage from '@components/UserImage'

import { fromNowDateUnix } from '@application/utils'

import { theme } from '@styles/theme'

class EmptyNotifications extends PureComponent {
  render() {
    const {
      isRead,
      user,
      navigation,
      timeAgo,
      contextImage,
      onPress,
      messageKey,
      values,
    } = this.props

    return (
      <TouchableOpacity activeOpacity={0.7} onPress={() => onPress()}>
        <View style={styles.rowWrapper}>
          {!isRead && <View style={styles.isRead} />}

          {user && (
            <UserLink userId={user.id} navigation={navigation}>
              <UserImage newModel user={user} style={styles.leftImage} />
            </UserLink>
          )}

          <View style={styles.notificationContent}>
            <Text
              style={{ fontFamily: 'Nunito', color: theme.fontColorDark }}
              message={messageKey}
              values={values}
            />

            <Text style={styles.timeAgo} text={fromNowDateUnix(timeAgo)} />
          </View>

          {contextImage}
        </View>
      </TouchableOpacity>
    )
  }
}

const styles = StyleSheet.create({
  rowWrapper: {
    flexDirection: 'row',
    backgroundColor: 'white',
    padding: 15,
    paddingRight: 20,
  },
  isRead: {
    position: 'absolute',
    zIndex: 10,
    top: 5,
    right: 8,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: theme.secondaryColor,
  },
  leftImage: {
    width: 40,
    height: 40,
    marginRight: 10,
  },
  notificationContent: {
    flex: 1,
  },
  timeAgo: {
    fontSize: 12,
    marginTop: 3,
    color: theme.like,
  },
})

export default EmptyNotifications
