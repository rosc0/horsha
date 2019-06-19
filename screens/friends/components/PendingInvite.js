import React, { PureComponent } from 'react'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import { Image, StyleSheet, TouchableOpacity, View } from 'react-native'

import { outputCountry } from '@utils'

import Text from '@components/Text'
import Icon from '@components/Icon'
import * as friendActions from '@actions/friends'
import { theme } from '@styles/theme'
import { userIcon } from '@components/Icons'

class PendingInvite extends PureComponent {
  acceptRequest(fromUserId) {
    this.props.actions.acceptRequest(fromUserId)
  }

  ignoreRequest(fromUserId) {
    this.props.actions.ignoreRequest(fromUserId)
  }

  deleteRequest(fromUserId) {
    this.props.actions.deleteRequest(fromUserId)
  }

  navigateToProfile(userId) {
    this.props.navigation.navigate('UserProfile', { userId })
  }

  render() {
    const { fromUser } = this.props

    const image = fromUser.picture ? { uri: fromUser.picture.url } : userIcon

    return (
      <TouchableOpacity
        activeOpacity={0.7}
        onPress={() => this.navigateToProfile(fromUser.id)}
        style={styles.rowWrapper}
      >
        <Image style={styles.profileImage} source={image} />

        <View style={styles.userNameContainer}>
          <Text
            type="title"
            weight="bold"
            style={styles.userName}
            text={fromUser.name}
          />
          {fromUser.country_code && (
            <Text
              style={styles.country}
              text={outputCountry(fromUser.country_code)}
            />
          )}
          {fromUser.countryCode && (
            <Text
              style={styles.country}
              text={outputCountry(fromUser.countryCode)}
            />
          )}
        </View>

        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => {
            this.acceptRequest(fromUser.id)
          }}
        >
          <View style={styles.greenButton}>
            <Icon name="settings_tick" style={styles.buttonTick} />
            <Text
              type="title"
              weight="bold"
              style={styles.greenButtonText}
              message={'friends/acceptButton'}
            />
          </View>
        </TouchableOpacity>
        {fromUser.inboundFriendRequestState === 'PENDING' ? (
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => {
              this.ignoreRequest(fromUser.id)
            }}
          >
            <View style={styles.whiteButton}>
              <Text
                type="title"
                weight="bold"
                style={styles.whiteButtonText}
                message={'friends/ignoreButton'}
              />
            </View>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => {
              this.deleteRequest(fromUser.id)
            }}
          >
            <View style={styles.whiteButton}>
              <Text
                type="title"
                weight="bold"
                style={styles.whiteButtonText}
                message={'friends/deleteButton'}
              />
            </View>
          </TouchableOpacity>
        )}
      </TouchableOpacity>
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
  },
  country: {
    fontSize: theme.font.sizes.small,
  },
  profileImage: {
    width: 40,
    height: 40,
    marginRight: 10,
    backgroundColor: 'white',
  },
  whiteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'transparent',
    borderRadius: 3,
    borderColor: theme.secondaryColor,
    borderWidth: 1,
  },
  whiteButtonText: {
    color: theme.secondaryColor,
    fontSize: theme.font.sizes.smallest,
    padding: 8,
  },
  greenButton: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 3,
    borderColor: theme.secondaryColor,
    backgroundColor: theme.secondaryColor,
    borderWidth: 1,
    marginRight: 10,
  },
  buttonTick: {
    color: 'white',
    fontSize: 18,
    paddingLeft: 8,
    paddingRight: 4,
  },
  greenButtonText: {
    color: 'white',
    fontSize: theme.font.sizes.smallest,
    paddingVertical: 8,
    paddingRight: 8,
  },
})

export default connect(
  state => ({
    auth: state.auth,
    user: state.user,
    friendInvitations: state.friendInvitations,
  }),
  dispatch => ({
    actions: bindActionCreators(
      {
        ...friendActions,
      },
      dispatch
    ),
  })
)(PendingInvite)
