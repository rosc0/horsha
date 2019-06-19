import React, { PureComponent } from 'react'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import { StyleSheet, View } from 'react-native'

import Text from '@components/Text'
import Icon from '@components/Icon'
import { theme } from '@styles/theme'
import * as userActions from '@actions/user'
import * as friendActions from '@actions/friends'

class FriendsTabMenu extends PureComponent {
  componentDidMount() {
    this.props.actions.getInvitations('pending')
  }

  getInvitationCount() {
    const {
      fetched,
      pendingInvitations,
      pendingRemaining,
    } = this.props.friendInvitations

    if (!fetched) {
      return 0
    }

    if (pendingInvitations) {
      return pendingInvitations.length + pendingRemaining
    }
  }

  render() {
    const invitationCount = this.getInvitationCount()

    return (
      <View>
        <Icon
          name={'friends'}
          style={[styles.icon, { color: this.props.tintColor }]}
        />

        {invitationCount > 0 && (
          <View style={styles.invitationCountContainer}>
            <Text
              weight="bold"
              style={styles.invitationCount}
              text={invitationCount}
            />
          </View>
        )}
      </View>
    )
  }
}

const styles = StyleSheet.create({
  invitationCountContainer: {
    backgroundColor: theme.mainColor,
    width: 16,
    height: 16,
    borderRadius: 8,
    position: 'absolute',
    right: -11,
    top: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  invitationCount: {
    color: 'white',
    backgroundColor: 'transparent',
    fontSize: theme.font.sizes.smallest,
  },
  icon: {
    fontSize: 23,
    paddingTop: 7,
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
        ...userActions,
        ...friendActions,
      },
      dispatch
    ),
  })
)(FriendsTabMenu)
