import React, { PureComponent } from 'react'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import { Image, StyleSheet, TouchableOpacity, View } from 'react-native'

import Text from '@components/Text'
import UserImage from '@components/UserImage'
import Distance from '@components/Distance'
import { IconImage } from '@components/Icons'
import { outputCountry } from '@utils'

import { theme } from '@styles/theme'
import * as friendActions from '@actions/friends'

class FriendList extends PureComponent {
  navigateToUserProfile = userId => {
    const { navigation } = this.props
    navigation.navigate('UserProfile', {
      userId: userId,
    })
  }

  render() {
    const {
      userData,
      distance = false,
      orderedNumber = null,
      cutNumber = null,
    } = this.props
    const user = userData
    const distanceValue = user.riding_totals ? user.riding_totals.distance : 0
    const ordered =
      distanceValue > cutNumber ? orderedNumber : orderedNumber + 1

    return (
      <View key={`friend-${user.id}`}>
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => this.navigateToUserProfile(user.id)}
        >
          <View style={styles.rowWrapper}>
            {orderedNumber && (
              <Text
                weight="bold"
                style={styles.orderedNumber}
                text={ordered + '.'}
              />
            )}

            <UserImage user={user} style={styles.profileImage} newModel />

            <View style={styles.userNameContainer}>
              <Text
                type="title"
                weight="bold"
                style={styles.userName}
                text={user.name}
              />
              {distance && (
                <Distance distance={distanceValue} style={styles.distance} />
              )}
              {!distance && user.countryCode && (
                <Text
                  style={styles.distance}
                  text={outputCountry(user.countryCode)}
                />
              )}
            </View>

            <IconImage style={styles.arrowRight} source="nextIcon" />
          </View>
        </TouchableOpacity>
      </View>
    )
  }
}

const styles = StyleSheet.create({
  rowWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    padding: 15,
  },
  userNameContainer: {
    flex: 1,
  },
  userName: {
    fontSize: theme.font.sizes.default,
    ...theme.font.userName,
  },
  distance: {
    fontSize: theme.font.sizes.small,
    ...theme.font.date,
  },
  arrowRight: {
    width: 10,
    height: 15,
    resizeMode: 'contain',
  },
  profileImage: {
    width: 40,
    height: 40,
    marginRight: 10,
    backgroundColor: 'white',
  },
  orderedNumber: {
    width: 20,
    fontSize: theme.font.sizes.default,
    marginRight: 10,
  },
})

export default connect(
  state => ({
    friends: state.friends,
  }),
  dispatch => ({
    actions: bindActionCreators(
      {
        ...friendActions,
      },
      dispatch
    ),
  })
)(FriendList)
