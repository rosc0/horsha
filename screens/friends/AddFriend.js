import React, { PureComponent } from 'react'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import {
  FlatList,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native'
import {
  AccessToken,
  GraphRequest,
  GraphRequestManager,
  LoginManager,
} from 'react-native-fbsdk'

import Text from '@components/Text'
import UserImage from '@components/UserImage'
import RowSeparator from '@components/RowSeparator'
import HeaderTitle from '@components/HeaderTitle'
import ListEmpty from '@components/ListEmpty'
import NotificationsHeader from '@components/NotificationsHeader'
import SearchBox from '@components/SearchBox'
import SuggestedFriend from './components/SuggestedFriend'
import AddFriendButton from '@components/AddFriendButton'

import t from '@config/i18n'
import { theme } from '@styles/theme'
import * as friendActions from '@actions/friends'
import User from '@api/user'
import { IconImage } from '@components/Icons'
import { outputCountry } from '@utils'
import { GET_PEOPLE_YOU_MAY_KNOW } from '../../apollo/queries/UserCollection'
import { Query } from 'react-apollo'

const UserAPI = new User()

class AddFriend extends PureComponent {
  static navigationOptions = ({ navigation }) => ({
    headerTitle: <HeaderTitle title={'friends/addFriendTitle'} />,
    headerRight: <NotificationsHeader navigation={navigation} />,
    tabBarVisible: false,
  })

  state = {
    results: [],
    remaining: 0,
    cursor: null,
    showResults: false,
    facebookId: null,
    searchTerm: null,
  }

  navigateToProfile = userId => {
    this.props.navigation.navigate('UserProfile', { userId })
  }

  userItem(userData) {
    const user = userData.item
    return (
      <TouchableOpacity
        activeOpacity={0.7}
        style={styles.rowWrapper}
        onPress={() => this.navigateToProfile(user.id)}
      >
        <UserImage user={user} style={styles.profileImage} />

        <View style={styles.userNameContainer}>
          <Text style={styles.userName} weight="bold" text={user.name} />
          {user.country_code && (
            <Text
              style={styles.distance}
              text={outputCountry(user.country_code)}
            />
          )}
        </View>

        {!!user.friends_since ? (
          <Text message={'friends/alreadyFriends'} />
        ) : (
          <AddFriendButton user={user} />
        )}
      </TouchableOpacity>
    )
  }

  cancelSearch = () => {
    this.setState({
      results: [],
      showResults: false,
      facebookId: null,
      searchTerm: null,
    })
  }

  facebookUserSearch = facebookId => {
    this.setState({
      showResults: true,
      facebookId: facebookId,
      searchTerm: null,
    })

    UserAPI.facebookSearch(facebookId).then(response => {
      this.setState({
        results: response.collection,
        remaining: response.remaining,
        cursor: response.cursor,
      })
    })
  }

  userSearch = text => {
    if (text.indexOf('@') === -1) {
      text = text + '*'
    }

    this.setState({
      showResults: true,
      facebookId: null,
      searchTerm: text,
    })

    UserAPI.search(text).then(response => {
      this.setState({
        results: response.collection,
        remaining: response.remaining,
        cursor: response.cursor,
      })
    })
  }

  onEndReached() {
    const { remaining, cursor } = this.state

    if (remaining) {
      if (this.state.facebookId) {
        UserAPI.facebookSearch(this.state.facebookId, cursor).then(response => {
          this.setState({
            results: this.state.results.concat(response.collection),
            remaining: response.remaining,
          })
        })
      } else if (this.state.searchTerm) {
        UserAPI.search(this.state.searchTerm, cursor).then(response => {
          this.setState({
            results: this.state.results.concat(response.collection),
            remaining: response.remaining,
          })
        })
      }
    }
  }

  searchFacebookFriends(fbAccessToken) {
    const params = {
      parameters: {
        access_token: { string: fbAccessToken },
      },
    }

    const getFacebookFriends = new GraphRequest(
      '/me/friends',
      params,
      (err, response) => {
        const facebookIdArray = response.data.map(value => {
          return value.id
        })

        this.facebookUserSearch(facebookIdArray)
      }
    )

    new GraphRequestManager().addRequest(getFacebookFriends).start()
  }

  checkFacebookAuth = async () => {
    const data = await AccessToken.getCurrentAccessToken()
    if (data && data.permissions.indexOf('user_friends') > -1) {
      this.searchFacebookFriends(data.accessToken.toString())
    } else {
      const login = await LoginManager.logInWithReadPermissions([
        'user_friends',
      ])
      if (!login.isCancelled) {
        const data = await AccessToken.getCurrentAccessToken()
        this.searchFacebookFriends(data.accessToken.toString())
      }
    }
  }

  componentDidMount() {
    const navigationParams = this.props.navigation.state.params

    if (navigationParams && navigationParams.facebookSearch) {
      this.checkFacebookAuth()
    }
  }

  render() {
    const searchNameEmailText = t('friends/searchNameEmail')
    return (
      <View style={styles.wrapper}>
        <SearchBox
          ref={ref => (this.searchBar = ref)}
          onSubmit={this.userSearch}
          showCancel={true}
          onCancel={this.cancelSearch}
          placeholderText={searchNameEmailText}
          autoCapitalize="none"
        />

        <TouchableOpacity
          style={[
            styles.section,
            styles.rowWrapper,
            styles.fbContainerNoMargin,
          ]}
          onPress={this.checkFacebookAuth.bind(this)}
          activeOpacity={0.7}
        >
          <View style={styles.fbContent}>
            <IconImage style={styles.fbIcon} source="facebookBlue" />
            <Text
              type="title"
              style={styles.fbText}
              message={'friends/findFacebookFriends'}
            />
          </View>

          <IconImage style={styles.arrowRight} source="nextIcon" />
        </TouchableOpacity>

        <View style={[styles.rowWrapper, styles.friendSearchTitle]}>
          <Text
            type="title"
            style={styles.title}
            message={
              this.state.showResults
                ? 'common/searchResults'
                : 'friends/peopleYouMayKnow'
            }
          />
        </View>

        {this.state.showResults && (
          <View style={styles.wrapper}>
            <View style={styles.whiteBg}>
              <FlatList
                initialNumToRender={8}
                data={this.state.results}
                keyExtractor={user => user.id}
                renderItem={e => this.userItem(e)}
                onEndReachedThreshold={0.5}
                onEndReached={() => this.onEndReached()}
                ItemSeparatorComponent={() => <RowSeparator />}
                ListEmptyComponent={() => (
                  <ListEmpty message="friends/noFriendResults" />
                )}
              />
            </View>
          </View>
        )}

        {!this.state.showResults && (
          <Query
            query={GET_PEOPLE_YOU_MAY_KNOW}
            variables={{ userId: this.props.user.user.id, maxItems: 15 }}
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
        )}
      </View>
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
  whiteBg: {
    backgroundColor: 'white',
  },
  rowWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    padding: 15,
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
  userNameContainer: {
    flex: 1,
  },
  userName: {
    fontSize: theme.font.sizes.default,
  },
  distance: {
    fontSize: theme.font.sizes.small,
  },
  arrowRight: {
    width: 10,
    height: 15,
  },
  profileImage: {
    width: 40,
    height: 40,
    marginRight: 10,
    backgroundColor: 'white',
  },
  fbContainerNoMargin: {
    borderTopWidth: 0,
    marginTop: 0,
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
  },
})

export default connect(
  state => ({
    friendSuggestions: state.friendSuggestions,
    user: state.user,
  }),
  dispatch => ({
    actions: bindActionCreators(
      {
        ...friendActions,
      },
      dispatch
    ),
  })
)(AddFriend)
