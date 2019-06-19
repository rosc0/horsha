import React, { PureComponent } from 'react'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import { StyleSheet, TouchableOpacity, View } from 'react-native'
import { PropTypes } from 'react-native-globalize'

import UserImage from '@components/UserImage'
import AddFriendButton from '@components/AddFriendButton'
import Text from '@components/Text'
import * as friendActions from '@actions/friends'
import { theme } from '@styles/theme'
import { outputCountry } from '@utils'

class SuggestedFriend extends PureComponent {
  static contextTypes = {
    globalize: PropTypes.globalizeShape,
  }

  navigateToProfile(userId) {
    this.props.navigation.navigate('UserProfile', { userId })
  }

  render() {
    const { suggestedFriend: user } = this.props
    return (
      <TouchableOpacity
        activeOpativy={0.7}
        onPress={() => this.navigateToProfile(user.id)}
        style={[styles.rowWrapper, styles.rowBorderBottom]}
      >
        <UserImage newModel user={user} style={styles.profileImage} />

        <View style={styles.userNameContainer}>
          <Text
            type="title"
            weight="bold"
            style={styles.userName}
            text={user.name}
          />
          {user.country_code && (
            <Text
              style={styles.country}
              text={outputCountry(user.country_code)}
            />
          )}
        </View>
        <AddFriendButton user={user} />
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
  rowBorderBottom: {
    borderBottomWidth: 1,
    borderBottomColor: theme.backgroundColor,
  },
  userNameContainer: {
    flex: 1,
  },
  userName: {
    ...theme.font.userName,
    color: theme.fontColorDark,
  },
  country: {
    fontSize: theme.font.sizes.small,
    ...theme.font.date,
  },
  profileImage: {
    width: 40,
    height: 40,
    marginRight: 10,
    backgroundColor: 'white',
  },
})

export default connect(
  state => ({
    auth: state.auth,
    user: state.user,
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
)(SuggestedFriend)
