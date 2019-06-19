import React, { PureComponent } from 'react'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import { ActivityIndicator, FlatList, StyleSheet, View } from 'react-native'
import idx from 'idx'

import Icon from '@components/Icon'
import UnverifiedUserBar from '@components/UnverifiedUserBar'
import JournalEntry from '@components/journal/JournalEntry'
import NotificationsHeader from '@components/NotificationsHeader'
import HeaderTitle from '@components/HeaderTitle'
import Loading from '@components/Loading'
import { theme } from '@styles/theme'

import Header from './HeaderUCM'
import EmptyComponent from './Empty'
import ErrorComponent from './Error'

import * as newsActions from '@actions/newsfeed'
import * as horsesActions from '@actions/horses'
import { Query } from 'react-apollo'
import { GET_NEWSFEED_COLLECTION } from '../../apollo/queries/NewsFeedCollection'

class Newsfeed extends PureComponent {
  state = {
    horses: [],
    horsesLoaded: false,
    chosenHorseId: null,
    force: false,
    refreshing: false,
    changedId: 0,
    currentHorseId: null,
    currentIndex: 0,
    isLoading: false,
  }

  static navigationOptions = ({ navigation }) => ({
    headerTitle: <HeaderTitle title={'newsfeed/news'} />,
    headerTintColor: 'white',
    tabBarIcon: ({ tintColor: color }) => (
      <Icon name="newsfeed" style={[styles.tabBarIcon, { color }]} />
    ),
    headerRight: (
      <View style={styles.header}>
        <NotificationsHeader navigation={navigation} />
      </View>
    ),
  })

  static getDerivedStateFromProps(props, state) {
    const { horsePictureChanged, horses, fetched } = props.horses
    const { changedId, currentHorseId } = state
    const pictureChanged =
      horsePictureChanged && horsePictureChanged !== changedId

    const horseChanged =
      !!fetched && idx(props.horses, _ => _.horses[0].id !== currentHorseId)

    if (pictureChanged || horseChanged) {
      return {
        changedId: pictureChanged ? horsePictureChanged : changedId,
        currentHorseId: horseChanged ? horses[0].id : currentHorseId,
      }
    }

    return null
  }

  constructor(props) {
    super(props)
    props.navigation.setParams({
      onTabFocus: this.handleTabFocus,
    })
  }

  handleTabFocus = () => {
    const { news } = this.props

    if (idx(news, _ => _.collection) < 1) {
      return
    }

    this.listRef && this.listRef.scrollToIndex({ animated: true, index: 0 })
    if (this.state.currentIndex === 0) {
      this.onRefresh()
    }
  }

  async componentDidMount() {
    // await this.loadUpdates()
    // await this.getHorses()
  }

  // UNSAFE_componentWillReceiveProps(nextProps) {
  //   const { horsePictureChanged, horses, fetched } = nextProps.horses
  //   const { changedId, currentHorseId } = this.state
  //   const pictureChanged =
  //     horsePictureChanged && horsePictureChanged !== changedId

  //   const horseChanged =
  //     !!fetched && idx(nextProps.horses, _ => _.horses[0].id !== currentHorseId)

  //   if (pictureChanged || horseChanged) {
  //     this.setState({
  //       changedId: pictureChanged ? horsePictureChanged : changedId,
  //       currentHorseId: horseChanged ? horses[0].id : currentHorseId,
  //       horsesLoaded: false,
  //     })
  //     this.getHorses()
  //   }
  // }

  onRefresh = async () => {
    try {
      this.setState({ refreshing: true })
      // await this.props.actions.refreshNewsfeed()
      this.setState({ refreshing: false })
    } catch (e) {
      // console.log(e)
    }
  }

  openDetails = (entry, viaComment) => {
    this.props.navigation.navigate('JournalDetail', {
      journalId: entry.subject.post ? entry.subject.post.id : null,
      statusId: entry.subject.status_update
        ? entry.subject.status_update.id
        : null,
      viaComment,
    })
  }

  getHorses = () => {
    const { collection } = this.props.actions.getHorses()

    try {
      if (collection && collection.length) {
        this.setState({
          horses: collection,
          chosenHorseId: idx(collection[0], _ => _.horse.id),
        })
      }

      this.setState({ horsesLoaded: true })
    } catch (error) {
      this.setState({ horsesLoaded: true })
    }
  }

  loadUpdates = () => {
    this.getHorses()
    this.props.actions.getUpdates()
  }

  goToAddPost = async (horse, postId) => {
    await this.props.actions.setHorse({
      ...horse,
    })
    return this.props.navigation.navigate('AddJournalPostModal', {
      postId: postId,
    })
  }

  // loadMore = async () => {
  //   if (this.state.isLoading === true) return
  //   this.setState({ isLoading: true })
  //   const { collection, remaining, fetched, cursor } = this.props.news
  //   const feedLength = collection.length

  //   if (!fetched || feedLength === 0 || remaining === 0) return

  //   await this.props.actions.getMoreUpdates(cursor)
  //   this.setState({ isLoading: false })
  // }

  render() {
    const {
      user: { user },
      horses: { horses },
    } = this.props
    const { isLoading } = this.state
    const maxItems = 10
    const hasHorses = (!!horses && !!horses.length) || false
    const unverified = user.verification_state === 'unverified'
    const { refreshing } = this.state
    if (!user.id) return <Loading fullScreen={true} type="spinner" />

    return (
      <View style={styles.wrapper}>
        <Header goToAddPost={this.goToAddPost} style={styles.addPostLink} />

        <Query
          query={GET_NEWSFEED_COLLECTION}
          variables={{ userId: user.id, maxItems: 10 }}
          addTypename
        >
          {({ data, loading, error, fetchMore, refetch }) => {
            if (loading) return <Loading fullScreen={true} type="spinner" />
            if (error) {
              console.log('@@ error', error)
              return <ErrorComponent tryAgain={() => this.loadUpdates()} />
            }
            if (!data.newsFeed) {
              return <Loading fullScreen={true} type="spinner" />
            }
            const { collection, pageInfo } = data.newsFeed
            console.log('@@ collection', collection)

            return (
              <FlatList
                onScroll={e => {
                  let offset = e.nativeEvent.contentOffset.y
                  if (offset > 0) {
                    return this.setState({ currentIndex: 1 })
                  }
                  return this.setState({ currentIndex: 0 })
                }}
                ref={ref => (this.listRef = ref)}
                contentContainerStyle={{ paddingTop: 15 }}
                initialNumToRender={10}
                data={collection}
                keyExtractor={item => item.id}
                refreshing={refreshing}
                onRefresh={async () => await refetch()}
                removeClippedSubviews={false}
                renderItem={({ item }) => (
                  <JournalEntry
                    navigate={this.props.navigation.navigate}
                    entry={item}
                    userId={user.id}
                    onPress={() => this.openDetails(item)}
                    onCommentPress={() => this.openDetails(item, true)}
                  />
                )}
                ListHeaderComponent={() =>
                  unverified && (
                    <UnverifiedUserBar navigation={this.props.navigation} />
                  )
                }
                ListFooterComponent={() =>
                  isLoading === true && (
                    <View style={styles.footer}>
                      <ActivityIndicator
                        animating={true}
                        style={styles.loading}
                        size="small"
                      />
                    </View>
                  )
                }
                ListEmptyComponent={
                  <EmptyComponent
                    navigation={this.props.navigation}
                    user={user}
                  />
                }
                onEndReachedThreshold={0.5}
                onEndReached={() => {
                  fetchMore({
                    variables: { cursor: pageInfo.next, maxItems },
                    updateQuery: (previousResult, { fetchMoreResult }) => {
                      if (
                        pageInfo.next === fetchMoreResult.newsFeed.pageInfo.next
                      )
                        return previousResult
                      this.setState({ isLoading: true })
                      if (!fetchMoreResult) {
                        this.setState({ isLoading: false })
                        return previousResult
                      }

                      const previousEntry = previousResult.newsFeed.collection
                      const newCollection = fetchMoreResult.newsFeed.collection

                      let hasMoreListings = collection.length % maxItems === 0
                      if (!hasMoreListings) {
                        this.setState({ isLoading: false })

                        return previousResult
                      }
                      if (newCollection.length < maxItems) {
                        hasMoreListings = false
                      }

                      this.setState({ isLoading: false })
                      return {
                        newsFeed: {
                          ...fetchMoreResult.newsFeed,
                          collection: [...previousEntry, ...newCollection],
                          __typename: previousResult.newsFeed.__typename,
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
    )
  }
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    backgroundColor: theme.backgroundColor,
  },
  loadingWrapper: {
    flex: 1,
    backgroundColor: 'white',
  },
  addPostLink: {
    marginBottom: 15,
  },
  loading: {
    flex: 1,
    alignSelf: 'center',
    height: 30,
  },
  footer: {
    paddingTop: 20,
    paddingBottom: 30,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
})

export default connect(
  state => ({
    user: state.user,
    horses: state.horses,
  }),
  dispatch => ({
    actions: bindActionCreators(
      {
        ...newsActions,
        ...horsesActions,
      },
      dispatch
    ),
  })
)(Newsfeed)
