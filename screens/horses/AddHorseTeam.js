import React, { PureComponent } from 'react'
import { FlatList, StyleSheet, View } from 'react-native'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'

import t from '@config/i18n'
import * as friendsActions from '@actions/friends'
import * as horsesActions from '@actions/horses'
import * as userActions from '@actions/user'

import SearchBox from '@components/SearchBox'
import HorseTeamSearchRow from './components/HorseTeamSearchRow'
import Loading from '@components/Loading'
import Text from '@components/Text'
import HeaderTitle from '@components/HeaderTitle'
import RowSeparator from '@components/RowSeparator'
import ListEmpty from '@components/ListEmpty'

import Friends from '@api/friends'
import { theme } from '@styles/theme'

const FriendsAPI = new Friends()

class AddHorseTeam extends PureComponent {
  static navigationOptions = () => ({
    headerTitle: <HeaderTitle title={'horses/addToTeamTitle'} />,
    tabBarVisible: false,
  })

  state = {
    results: [],
    remaining: 0,
    cursor: null,
    showResults: false,
    refreshing: false,
    fetching: false,
  }

  componentDidMount() {
    this.props.actions.getFriends()
  }

  userFilter = text => {
    const { friends: friendsList } = this.props
    const searchTerm = text.toLowerCase()

    this.setState({
      showResults: true,
      searchTerm: searchTerm,
      fetching: true,
    })

    if (friendsList.friends.length) {
      this.friendListRef.scrollToOffset({ y: 0, animated: false })
    }

    FriendsAPI.searchFriends(searchTerm).then(response => {
      this.setState({
        results: response.collection,
        remaining: response.remaining,
        cursor: response.cursor,
        fetching: false,
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

  handleAddFriend = userId => async () => {
    await this.props.actions.addFriendToTeam(
      this.props.navigation.state.params.horseId,
      userId
    )
    this.props.navigation.goBack(null)
  }

  render() {
    const {
      horses: { team },
      friends: friendsList,
    } = this.props
    const { fetching } = this.state

    const searchFriendsText = t('friends/searchFriends')

    const friendsCount = friendsList.fetched
      ? friendsList.friends.length + friendsList.friendsRemaining
      : 0

    const friendSearchCount =
      this.state.results && this.state.results.length
        ? this.state.results.length + this.state.remaining
        : 0

    return (
      <View style={styles.wrapper}>
        <SearchBox
          ref={ref => (this.searchBar = ref)}
          onSubmit={this.userFilter}
          showCancel={true}
          onCancel={this.clearSearch}
          placeholderText={searchFriendsText}
        />

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
            message={
              this.state.showResults
                ? 'common/searchResults'
                : 'horses/addFriendsToTeam'
            }
            values={{
              count: this.state.showResults ? friendSearchCount : friendsCount,
            }}
          />
        </View>

        <View style={styles.wrapper}>
          <View style={styles.whiteBg}>
            {fetching && <Loading type="spinner" />}

            {!fetching && (
              <FlatList
                ref={ref => (this.friendListRef = ref)}
                initialNumToRender={8}
                refreshing={this.state.refreshing}
                onRefresh={this.onRefresh.bind(this)}
                data={
                  this.state.showResults
                    ? this.state.results
                    : friendsList.friends
                }
                keyExtractor={user => user.id}
                renderItem={userData => {
                  const user = userData.item
                  const userAdded = team.users.filter(
                    teamMember => teamMember.key === user.id
                  )
                  return (
                    <HorseTeamSearchRow
                      key={user.id}
                      id={user.id}
                      name={user.name}
                      image={
                        user.profile_picture &&
                        `${user.profile_picture.url}?t=300x300,fill`
                      }
                      onAddFriend={this.handleAddFriend}
                      userAdded={userAdded[0] ? userAdded[0] : false}
                    />
                  )
                }}
                onEndReachedThreshold={0.5}
                onEndReached={
                  this.state.showResults
                    ? this.onSearchEnd.bind(this)
                    : this.onListEnd.bind(this)
                }
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
              />
            )}
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
    paddingTop: 35,
  },
  rowBorderBottom: {
    borderBottomWidth: 1,
    borderBottomColor: theme.backgroundColor,
  },
  title: {
    flex: 1,
    fontSize: 18,
    padding: 15,
  },
})

const mapStateToProps = ({ auth, user, horses, friends }) => ({
  auth,
  user,
  horses,
  friends,
})

const mapDispatchToProps = dispatch => ({
  actions: bindActionCreators(
    {
      ...horsesActions,
      ...userActions,
      ...friendsActions,
    },
    dispatch
  ),
})

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(AddHorseTeam)
