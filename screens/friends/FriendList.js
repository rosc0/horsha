import React, { PureComponent } from 'react'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import { FlatList, StyleSheet, TouchableOpacity, View } from 'react-native'

import t from '@config/i18n'
import ListEmpty from '@components/ListEmpty'
import Text from '@components/Text'
import RowSeparator from '@components/RowSeparator'
import HeaderTitle from '@components/HeaderTitle'
import NotificationsHeader from '@components/NotificationsHeader'
import SearchBox from '@components/SearchBox'
import FriendRow from './components/FriendRow'

import * as friendActions from '@actions/friends'
import Friends from '@api/friends'
import { IconImage } from '@components/Icons'
import { theme } from '../../styles/theme'
import { Query } from 'react-apollo'

const FriendsAPI = new Friends()
const maxItems = 15

class FriendList extends PureComponent {
  static navigationOptions = ({ navigation }) => {
    const title = navigation.getParam('title', 'friends')
    return {
      headerTitle: <HeaderTitle title={`friends/${title}ListTitle`} />,
      headerRight: <NotificationsHeader navigation={navigation} />,
      tabBarVisible: false,
    }
  }

  state = {
    results: [],
    remaining: 0,
    cursor: null,
    showResults: false,
    refreshing: false,
    fetching: false,
  }

  userFilter = text => {
    const { friends: friendsList } = this.props

    const searchTerm = text.toLowerCase()

    this.setState({
      showResults: true,
      searchTerm: searchTerm,
    })

    if (friendsList.friends.length) {
      this.friendListRef.scrollToOffset({ y: 0, animated: false })
    }

    FriendsAPI.searchFriends(searchTerm).then(response => {
      this.setState({
        results: response.collection,
        remaining: response.remaining,
        cursor: response.cursor,
      })
    })
  }

  clearSearch = () => {
    const { friends: friendsList } = this.props

    this.setState(
      {
        results: [],
        remaining: 0,
        cursor: null,
        showResults: false,
      },
      () => {
        if (friendsList.friends.length) {
          this.friendListRef.scrollToIndex({ animated: false, index: 0 })
        }
      }
    )
  }

  navigateToFriendsByKm() {
    this.props.navigation.navigate('FriendsByKm')
  }

  onRefresh = () => {
    this.setState({ refreshing: true })
    this.props.actions.getFriends().then(() => {
      this.setState({ refreshing: false })
    })
  }

  async onListEnd() {
    const { fetching } = this.state
    const { friends: friendsList } = this.props

    if (friendsList.friendsRemaining && !fetching) {
      this.setState({ fetching: true })

      const cursor = friendsList.friendsCursor

      if (cursor) {
        await this.props.actions.getMoreFriends(null, cursor)
        this.setState({ fetching: false })
      }
    }
  }

  async onSearchEnd() {
    const { fetching } = this.state
    const { remaining, cursor } = this.state

    if (remaining && !fetching) {
      const friends = await FriendsAPI.searchFriends(
        this.state.searchTerm,
        cursor
      )

      this.setState(state => ({
        results: state.results.concat(friends.collection),
        remaining: friends.remaining,
        cursor: friends.cursor,
        fetching: false,
      }))
    }
  }

  renderFrindRow = ({ item }) => {
    return <FriendRow navigation={this.props.navigation} userData={item} />
  }

  render() {
    const { friends: friendsList } = this.props
    const searchFriendsText = t('friends/searchFriends')

    const friendsCount = friendsList.fetched
      ? friendsList.friends.length + friendsList.friendsRemaining
      : 0

    const friendSearchCount =
      this.state.results && this.state.results.length
        ? this.state.results.length + this.state.remaining
        : 0

    // userId
    // title
    // query
    const userId = this.props.navigation.getParam('userId', '')
    const title = this.props.navigation.getParam('title', '')
    const query = this.props.navigation.getParam('query', '')

    return (
      <View style={styles.wrapper}>
        <SearchBox
          ref={ref => (this.searchBar = ref)}
          onSubmit={this.userFilter}
          showCancel={true}
          onCancel={() => this.clearSearch()}
          placeholderText={searchFriendsText}
        />

        <View style={styles.wrapper}>
          <View style={styles.whiteBg}>
            <Query query={query} variables={{ userId, maxItems }}>
              {({ data, loading, error, fetchMore }) => {
                if (loading) {
                  console.log('frinds loading', loading)
                  return null
                }
                if (error) {
                  console.log('frinds error', error)
                  return null
                }
                console.log('@@ frinds data', data)
                const { collection, pageInfo } = data.userList
                const count = collection.length + pageInfo.remaining
                return (
                  <FlatList
                    ref={ref => (this.friendListRef = ref)}
                    initialNumToRender={8}
                    refreshing={this.state.refreshing}
                    onRefresh={this.onRefresh.bind(this)}
                    data={
                      this.state.showResults ? this.state.results : collection
                    }
                    keyExtractor={user => user.id}
                    renderItem={this.renderFrindRow}
                    onEndReachedThreshold={0.5}
                    // onEndReached={
                    //   this.state.showResults
                    //     ? this.onSearchEnd.bind(this)
                    //     : this.onListEnd.bind(this)
                    // }
                    ItemSeparatorComponent={() => <RowSeparator />}
                    ListEmptyComponent={() => (
                      <ListEmpty
                        message={
                          this.state.showResults
                            ? 'friends/noFriendResults'
                            : 'friends/noFriends'
                        }
                      />
                    )}
                    ListHeaderComponent={() => {
                      return (
                        <View>
                          {!this.state.showResults && (
                            <View
                              style={[
                                styles.rowWrapper,
                                styles.rowTopPadding,
                                styles.rowBorderBottom,
                              ]}
                            >
                              <Text
                                type="title"
                                style={styles.title}
                                message={`friends/${title}Title`}
                                values={count !== 0 && { count: count }}
                              />

                              {title === 'friends' && (
                                <TouchableOpacity
                                  onPress={this.navigateToFriendsByKm.bind(
                                    this
                                  )}
                                  activeOpacity={0.6}
                                  style={styles.friendKMTouch}
                                >
                                  <IconImage
                                    source="statusIcon"
                                    style={styles.friendsByKmIcon}
                                  />
                                </TouchableOpacity>
                              )}
                            </View>
                          )}

                          {this.state.showResults && (
                            <View
                              style={[
                                styles.rowWrapper,
                                styles.rowTopPadding,
                                styles.rowBorderBottom,
                              ]}
                            >
                              <Text
                                type="title"
                                style={styles.title}
                                message={`friends/${title}Title`}
                                values={{ count: count }}
                              />
                            </View>
                          )}
                        </View>
                      )
                    }}
                    onEndReached={() => {
                      fetchMore({
                        variables: { cursor: pageInfo.next, maxItems },
                        updateQuery: (previousResult, { fetchMoreResult }) => {
                          if (
                            pageInfo.next ===
                            fetchMoreResult.userList.pageInfo.next
                          )
                            return previousResult
                          this.setState({ isLoading: true })
                          if (!fetchMoreResult) {
                            this.setState({ isLoading: false })
                            return previousResult
                          }

                          const previousEntry =
                            previousResult.userList.collection
                          const newCollection =
                            fetchMoreResult.userList.collection

                          let hasMoreListings =
                            collection.length % maxItems === 0
                          if (!hasMoreListings) {
                            this.setState({ isLoading: false })

                            return previousResult
                          }
                          if (newCollection.length < maxItems) {
                            hasMoreListings = false
                          }

                          this.setState({ isLoading: false })
                          return {
                            userList: {
                              ...fetchMoreResult.userList,
                              collection: [...previousEntry, ...newCollection],
                              __typename: previousResult.userList.__typename,
                            },
                          }
                        },
                      })
                    }}
                  />
                )
              }}
            </Query>
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
  },
  rowTopPadding: {
    paddingTop: 15,
  },
  rowBorderBottom: {
    borderBottomWidth: 1,
    borderBottomColor: theme.backgroundColor,
  },
  title: {
    flex: 1,
    ...theme.font.rideStatusNumber,
    fontSize: 18,
    padding: 15,
  },
  friendKMTouch: {
    padding: 10,
  },
  friendsByKmIcon: {
    width: 25,
    height: 25,
    resizeMode: 'contain',
    tintColor: theme.fontColorDark,
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
