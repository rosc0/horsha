import React, { PureComponent } from 'react'
import { FlatList, StyleSheet, View } from 'react-native'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'

import * as horsesActions from '@actions/horses'
import HorseChooseRow from './components/HorseChooseRow'
import Loading from '@components/Loading'
import HeaderTitle from '@components/HeaderTitle'
import Icon from '@components/Icon'
import Text from '@components/Text'

import { Query } from 'react-apollo'
import { GET_USER_HORSES } from '../../apollo/queries/HorsesCollection'

class HorseChooseOptional extends PureComponent {
  static navigationOptions = {
    headerTitle: <HeaderTitle title={'horses/chooseHorseTitle'} />,
    tabBarVisible: false,
    tabBarIcon: ({ tintColor }) => <Icon name="horse" tintColor={tintColor} />,
  }

  state = {
    horses: [],
    horse: null,
    cursor: null,
    selectedHorseId: null,
  }

  handleChooseHorse = async horse => {
    const nextRoute =
      this.props.navigation.state.params &&
      this.props.navigation.state.params.nextRoute
    const chooseAction =
      this.props.navigation.state.params &&
      this.props.navigation.state.params.chooseAction

    if (chooseAction) {
      this.props.navigation.state.params.chooseAction(horse)
    }

    if (horse !== this.state.horse) {
      this.setState({ horse: horse.id }, () =>
        console.log('choosed horse', this.state.horse)
      )
      this.props.actions.setHorse(horse)
      // this.props.actions.setLastAccessedHorse(horseUser.id)
    }

    if (!nextRoute) {
      return this.props.navigation.goBack(null)
    }

    return this.props.navigation.navigate(nextRoute)
  }

  renderHeader = count => (
    <Text
      type="title"
      weight="semiBold"
      style={styles.title}
      message="horses/horsesTitleCount"
      values={{ count }}
    />
  )

  renderItem = ({ item }) => {
    const selectedHorse = this.props.navigation.getParam('selectedHorse', '')

    return (
      <HorseChooseRow
        {...item}
        selectedHorse={selectedHorse}
        // relationType={item.relation_type}
        onPress={() => this.handleChooseHorse(item)}
      />
    )
  }

  getMoreHorses = async () => {
    // const { cursor, remaining } = this.state
    // if (remaining !== 0) {
    //   const { user } = this.props.user
    //   this.setState({ fetching: true })
    //   const horses = await HorseAPI.getHorsesByUser(
    //     user.id,
    //     ['owner', 'sharer'],
    //     cursor
    //   )
    //   this.setState({
    //     horses: this.state.horses.concat(horses.collection),
    //     cursor: horses.cursor,
    //     remaining: horses.remaining,
    //     fetching: false,
    //   })
    // }
  }

  render() {
    const userId = this.props.navigation.getParam('userId', '')
    return (
      <Query query={GET_USER_HORSES} variables={{ userId, maxItems: 32 }}>
        {({ data, loading, error, fetchMore }) => {
          if (loading) return <Loading type="spinner" />
          if (error) {
            return null
          }

          const { collection, pageInfo } = data.horses
          return (
            <FlatList
              data={collection}
              ListHeaderComponent={() =>
                this.renderHeader(collection.length + pageInfo.remaining)
              }
              ListFooterComponent={() => <View style={styles.empty} />}
              renderItem={this.renderItem}
              onEndReachedThreshold={2}
              onEndReached={this.getMoreHorses}
              onEndReached={() => {
                if (pageInfo.remaining > 0) {
                  fetchMore({
                    variables: {
                      cursor: pageInfo.next,
                    },
                    updateQuery: (prev, { fetchMoreResult }) => {
                      const previousEntry = prev.horses
                      const newCursor = fetchMoreResult.horses.pageInfo.next
                      const newRemaining =
                        fetchMoreResult.horses.pageInfo.remaining

                      console.log(
                        '@@pagination',
                        'fetchMoreResult',
                        fetchMoreResult,
                        'prev',
                        prev,
                        'newRemaining',
                        newRemaining
                      )
                      // if (!fetchMoreResult) return prev;
                      // return Object.assign({}, prev, {
                      //   data: [...prev.data, ...fetchMoreResult.data]
                      // });
                      // return {
                      //   // By returning `cursor` here, we update the `fetchMore` function
                      //   // to the new cursor.
                      //   cursor: newCursor,
                      //   entry: {
                      //     // Put the new comments in the front of the list
                      //     comments: [...newComments, ...previousEntry.comments]
                      //   },
                      //   __typename: previousEntry.__typename
                      // };
                      return prev
                    },
                  })
                }
              }}
              extraData={this.state}
              removeClippedSubviews={false}
              keyExtractor={item => item.id}
              style={styles.container}
            />
          )
        }}
      </Query>
    )
  }
}

const styles = StyleSheet.create({
  container: {
    paddingTop: 15,
    backgroundColor: 'white',
    flex: 1,
  },
  title: {
    fontSize: 20,
    paddingHorizontal: 10,
  },
  empty: {
    height: 30,
    width: '100%',
  },
})

const mapStateToProps = ({ horses, user }) => ({
  horses,
  user,
})

const mapDispatchToProps = dispatch => ({
  actions: bindActionCreators(horsesActions, dispatch),
})

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(HorseChooseOptional)
