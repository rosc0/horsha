import React, { PureComponent } from 'react'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import {
  FlatList,
  Image,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
  RefreshControl,
} from 'react-native'
import { AccessToken, LoginManager, MessageDialog } from 'react-native-fbsdk'
import config from 'react-native-config'

import ListEmpty from '@components/ListEmpty'
import Text from '@components/Text'
import RowSeparator from '@components/RowSeparator'
import HeaderTitle from '@components/HeaderTitle'
import UnverifiedUserBar from '@components/UnverifiedUserBar'
import SuggestedFriend from './components/SuggestedFriend'
import PendingInvite from './components/PendingInvite'
import EmptyFriends from './components/EmptyFriends'
import AddFriendHeaderButton from './components/AddFriendHeaderButton'
import { IconImage } from '@components/Icons'
import { theme } from '@styles/theme'

import * as friendActions from '@actions/friends'
import {
  GET_FRIENDS,
  GET_FOLLOWERS,
  GET_FOLLOWING,
  GET_PEOPLE_YOU_MAY_KNOW,
  GET_PENDING_INVITATIONS,
} from '../../apollo/queries/UserCollection'
import { Query } from 'react-apollo'

class Friends extends PureComponent {
  static navigationOptions = ({ navigation }) => {
    return {
      headerTitle: <HeaderTitle title={'friends/friendsScreenTitle'} />,
      headerRight: <AddFriendHeaderButton navigation={navigation} />,
    }
  }

  state = {
    refreshing: false,
  }

  componentDidMount() {
    this.props.actions.getFriends()
    this.props.actions.getSuggestions()
  }

  navigateToFriendsList = (title, query) => {
    this.props.navigation.navigate('FriendList', {
      userId: this.props.user.user.id,
      title,
      query,
    })
  }

  navigateToAllRequests() {
    this.props.navigation.navigate('FriendRequests')
  }

  addFriend = friendId => {
    this.props.actions.addFriend(friendId)
  }

  findFacebookFriends() {
    if (this.props.user.user.verification_state === 'unverified') {
      this.props.navigation.navigate('UnverifiedEmail', {
        context: 'addFriend',
      })
    } else {
      this.props.navigation.navigate('AddFriend', { facebookSearch: true })
    }
  }

  checkFacebookAuth = async () => {
    const data = await AccessToken.getCurrentAccessToken()
    if (data && data.permissions.indexOf('public_profile') > -1) {
      this.facebookMessageHorsha()
    } else {
      const login = await LoginManager.logInWithReadPermissions([
        'public_profile',
      ])
      if (!login.isCancelled) {
        this.facebookMessageHorsha()
      }
    }
  }

  facebookMessageHorsha = () => {
    const shareLinkContent = {
      contentType: 'link',
      contentUrl: config.WEBSITE_BASE_URL,
      contentDescription: 'Horsha',
    }

    MessageDialog.canShow(shareLinkContent).then(function(canShow) {
      if (canShow) {
        return MessageDialog.show(shareLinkContent)
      }
    })
  }

  refreshScreen = async () => {
    this.setState({
      refreshing: true,
    })

    await this.props.actions.getFriends()
    await this.props.actions.getInvitations('pending')
    await this.props.actions.getSuggestions()

    this.setState({
      refreshing: false,
    })
  }

  render() {
    const OPTIONS = [
      { name: 'friends', query: GET_FRIENDS },
      { name: 'followers', query: GET_FOLLOWERS },
      { name: 'following', query: GET_FOLLOWING },
    ]

    const { friends: friendsList, user } = this.props

    const unverified = user.user.verification_state === 'unverified'

    const shortListInvitations =
      this.props.friendInvitations &&
      this.props.friendInvitations.pendingInvitations
        ? this.props.friendInvitations.pendingInvitations.slice(0, 5)
        : []

    const friendsCount =
      friendsList.fetched && !!friendsList.friends
        ? friendsList.friends.length + friendsList.friendsRemaining
        : 0

    return (
      <ScrollView
        refreshControl={
          <RefreshControl
            onRefresh={() => this.refreshScreen()}
            refreshing={this.state.refreshing}
          />
        }
        style={styles.wrapper}
      >
        {unverified && <UnverifiedUserBar navigation={this.props.navigation} />}
        <View style={styles.section}>
          {!friendsList.fetching && friendsCount === 0 ? (
            <EmptyFriends />
          ) : (
            OPTIONS.map(({ name, query }) => (
              <TouchableOpacity
                key={name}
                activeOpacity={0.7}
                onPress={() => this.navigateToFriendsList(name, query)}
              >
                <View style={[styles.rowWrapper, styles.rowBorderBottom]}>
                  <Text
                    key="title"
                    type="title"
                    weight="bold"
                    style={styles.friendsButtonText}
                    // message={`friends/${name}Title`}
                    message={`friends/${name}ListTitle`}
                    // values={{ count: 0 }}
                  />
                  <IconImage
                    key="arrow-image"
                    style={styles.arrowRight}
                    source="nextIcon"
                  />
                </View>
              </TouchableOpacity>
            ))
          )}
        </View>

        <View style={styles.section}>
          <View style={[styles.rowWrapper, styles.rowBorderBottom]}>
            <Text
              type="title"
              style={styles.title}
              message={'friends/invitesTitle'}
            />

            <TouchableOpacity
              style={styles.seeAllButton}
              onPress={this.navigateToAllRequests.bind(this)}
            >
              <Text
                type="title"
                style={styles.textRight}
                message="common/seeAll"
              />
              <IconImage style={styles.arrowRightSmall} source="nextIcon" />
            </TouchableOpacity>
          </View>

          <FlatList
            initialNumToRender={2}
            data={shortListInvitations}
            keyExtractor={invitation => invitation.id}
            renderItem={invitation => (
              <PendingInvite
                fromUser={invitation.item}
                navigation={this.props.navigation}
              />
            )}
            ItemSeparatorComponent={() => <RowSeparator />}
            ListEmptyComponent={() => (
              <ListEmpty message="friends/noPendingInvites" />
            )}
          />
        </View>

        <TouchableOpacity
          style={[styles.section, styles.rowWrapper, styles.fbContainer]}
          onPress={this.findFacebookFriends.bind(this)}
          activeOpacity={0.7}
        >
          <View style={styles.fbContent}>
            <IconImage style={styles.fbIcon} source="facebookBlue" />
            <Text
              type="title"
              weight="bold"
              style={styles.fbText}
              message={'friends/findFacebookFriends'}
            />
          </View>

          <IconImage style={styles.arrowRight} source="nextIcon" />
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.section, styles.rowWrapper, styles.fbContainerBottom]}
          onPress={() => this.checkFacebookAuth()}
          activeOpacity={0.7}
        >
          <View style={styles.fbContent}>
            <IconImage style={styles.fbIcon} source="facebookBlue" />
            <Text
              type="title"
              weight="bold"
              style={styles.fbText}
              message={'friends/tellSomeone'}
            />
          </View>

          <IconImage style={styles.arrowRight} source="nextIcon" />
        </TouchableOpacity>

        <View>
          <View style={[styles.rowWrapper, styles.friendSearchTitle]}>
            <Text
              type="title"
              style={styles.title}
              message={'friends/peopleYouMayKnow'}
            />
          </View>
        </View>
        <Query
          query={GET_PEOPLE_YOU_MAY_KNOW}
          variables={{ userId: this.props.user.user.id, maxItems: 5 }}
        >
          {({ data, loading, error, fetchMore }) => {
            if (loading) {
              console.log('frinds loading', loading)
              return null
            }
            if (error) {
              console.log('frinds error', error)
              return null
            }
            return (
              <FlatList
                // initialNumToRender={2}
                data={data.userFriendSuggestions.collection}
                keyExtractor={invitation => invitation.user.id}
                renderItem={({ item }) => {
                  return (
                    <SuggestedFriend
                      key={`suggestion-${item.user.id}`}
                      navigation={this.props.navigation}
                      suggestedFriend={item.user}
                    />
                  )
                }}
                ItemSeparatorComponent={() => <RowSeparator />}
                ListEmptyComponent={() => (
                  <ListEmpty message="friends/noPendingInvites" />
                )}
              />
            )
          }}
        </Query>
      </ScrollView>
    )
  }
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    backgroundColor: theme.backgroundColor,
  },
  section: {
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#d2d1d6',
    marginTop: 20,
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
    ...theme.font.rideStatusNumber,
    fontSize: 15,
  },
  friendSearchTitle: {
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderTopColor: '#d2d1d6',
    borderBottomColor: theme.backgroundColor,
    marginTop: 20,
  },
  friendsButtonText: {
    flex: 1,
    fontSize: theme.font.sizes.defaultPlus,
    color: theme.fontColorDark,
  },
  arrowRight: {
    width: 10,
    height: 15,
  },
  arrowRightSmall: {
    width: 7,
    height: 12,
    marginLeft: 5,
  },
  textRight: {
    flex: 1,
    textAlign: 'right',
  },
  fbContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    marginTop: 20,
  },
  fbContainerBottom: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    marginTop: 0,
    borderTopWidth: 0,
  },
  fbContent: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'flex-start',
  },
  fbIcon: {
    width: 20,
    height: 20,
    resizeMode: 'contain',
  },
  fbText: {
    marginLeft: 10,
    flex: 2,
    color: theme.fontColor,
  },
  seeAllButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
})

export default connect(
  state => ({
    user: state.user,
    friends: state.friends,
    friendInvitations: state.friendInvitations,
    friendSuggestions: state.friendSuggestions,
  }),
  dispatch => ({
    actions: bindActionCreators(
      {
        ...friendActions,
      },
      dispatch
    ),
  })
)(Friends)
