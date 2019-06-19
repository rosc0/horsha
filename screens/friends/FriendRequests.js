import React, { PureComponent } from 'react'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import { FlatList, StyleSheet, TouchableOpacity, View } from 'react-native'

import ListEmpty from '@components/ListEmpty'
import Text from '@components/Text'
import RowSeparator from '@components/RowSeparator'
import HeaderTitle from '@components/HeaderTitle'
import NotificationsHeader from '@components/NotificationsHeader'
import PendingInvite from './components/PendingInvite'

import * as userActions from '@actions/user'
import * as friendActions from '@actions/friends'
import { theme } from '@styles/theme'

const noop = () => {}

class FriendRequests extends PureComponent {
  static navigationOptions = ({ navigation }) => ({
    headerTitle: <HeaderTitle title={'friends/friendRequestTitle'} />,
    headerRight: <NotificationsHeader navigation={navigation} />,
    tabBarVisible: false,
  })

  state = {
    showPending: true,
  }

  togglePendingIgnored() {
    this.setState({
      showPending: !this.state.showPending,
    })
  }

  onEnd = type => {
    const { friendInvitations: invitations } = this.props
    const cursor = invitations.cursor

    if (cursor) {
      const accessToken = this.props.auth.auth.accessToken
      const userId = this.props.user.user.id

      this.props.actions.getMoreInvitations(accessToken, userId, type, cursor)
    }
  }

  componentDidMount() {
    this.props.actions.getInvitations('pending')
    this.props.actions.getInvitations('ignored')
  }

  render() {
    const { friendInvitations: invitations } = this.props
    return (
      <View style={styles.wrapper}>
        <View style={[styles.rowWrapper, styles.rowBorderBottom]}>
          <Text
            style={styles.title}
            message={
              this.state.showPending
                ? 'friends/pendingTitle'
                : 'friends/ignoredTitle'
            }
          />

          <TouchableOpacity
            onPress={this.togglePendingIgnored.bind(this)}
            activeOpacity={0.7}
          >
            <Text
              message={
                this.state.showPending
                  ? 'friends/showIgnored'
                  : 'friends/showPending'
              }
            />
          </TouchableOpacity>
        </View>

        <View style={styles.wrapper}>
          <View style={styles.whiteBg}>
            <FlatList
              initialNumToRender={8}
              data={
                this.state.showPending
                  ? invitations.pendingInvitations
                  : invitations.ignoredInvitations
              }
              keyExtractor={invitation => invitation.id}
              renderItem={invitation => (
                <PendingInvite
                  fromUser={invitation.item}
                  navigation={this.props.navigation}
                />
              )}
              onEndReachedThreshold={0.5}
              onEndReached={() => {
                if (this.state.showPending) {
                  invitations.pendingRemaining ? this.onEnd('pending') : noop
                } else {
                  invitations.ignoredRemaining ? this.onEnd('ignored') : noop
                }
              }}
              ItemSeparatorComponent={() => <RowSeparator />}
              ListEmptyComponent={() => (
                <ListEmpty
                  message={
                    this.state.showPending
                      ? 'friends/noPendingInvites'
                      : 'friends/noIgnoredInvites'
                  }
                />
              )}
            />
          </View>
        </View>
      </View>
    )
  }
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
  },
  whiteBg: {
    backgroundColor: 'white',
  },
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
  title: {
    flex: 1,
    fontSize: 18,
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
)(FriendRequests)
