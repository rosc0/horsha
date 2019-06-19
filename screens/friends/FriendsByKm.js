import React, { PureComponent } from 'react'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import { FlatList, StyleSheet, View } from 'react-native'

import t from '@config/i18n'
import UserLink from '@components/UserLink'
import Text from '@components/Text'
import UserImage from '@components/UserImage'
import Distance from '@components/Distance'
import RowSeparator from '@components/RowSeparator'
import HeaderTitle from '@components/HeaderTitle'
import NotificationsHeader from '@components/NotificationsHeader'
import FriendRow from './components/FriendRow'

import * as userActions from '@actions/user'
import * as friendActions from '@actions/friends'
import { IconImage } from '@components/Icons'
import { theme } from '@styles/theme'

class FriendsByKm extends PureComponent {
  static navigationOptions = ({ navigation }) => ({
    headerTitle: <HeaderTitle title={'friends/friendsByKmTitle'} />,
    headerRight: <NotificationsHeader navigation={navigation} />,
    tabBarVisible: false,
  })

  state = {
    fetching: false,
    refreshing: false,
  }

  componentDidMount() {
    this.props.actions.getFriendsByKm()
  }

  onRefresh = () => {
    this.setState({ refreshing: true })
    this.props.actions.getFriendsByKm().then(() => {
      this.setState({ refreshing: false })
    })
  }

  async onEndReached() {
    const { fetching } = this.state
    const { friends: friendsList } = this.props

    if (friendsList.friendsByKmRemaining && !fetching) {
      this.setState({ fetching: true })

      const cursor = friendsList.friendsByKmCursor

      if (cursor) {
        await this.props.actions.getMoreFriendsByKm(null, cursor)
        this.setState({ fetching: false })
      }
    }
  }

  render() {
    const { friends: friendsList, user: currentUser } = this.props

    const friendsCount = friendsList.fetched
      ? friendsList.friends.length + friendsList.friendsRemaining
      : 0
    const mappedValues = friendsList.friendsByKm.map(
      user => user.riding_totals.distance
    )
    const userIndex = mappedValues.findIndex(
      v => v < currentUser.user.riding_totals.distance
    )

    return (
      <View style={styles.wrapper}>
        <View style={styles.rowWrapper}>
          <Text type="title" style={styles.title} message={'friends/you'} />
        </View>

        <UserLink
          userId={currentUser.user.id}
          navigation={this.props.navigation}
        >
          <View
            style={[
              styles.rowWrapper,
              styles.rowBorderTop,
              styles.rowBorderBottom,
            ]}
          >
            <Text
              weight="bold"
              style={styles.orderedNumber}
              text={`${userIndex + 1}.`}
            />

            <UserImage user={currentUser.user} style={styles.profileImage} />

            <View style={styles.userNameContainer}>
              <Text
                weight="bold"
                style={styles.userName}
                text={currentUser.user.name}
              />
              <Distance
                distance={currentUser.user.riding_totals.distance}
                style={styles.distance}
              />
            </View>
            <IconImage style={styles.arrowRight} source="nextIcon" />
          </View>
        </UserLink>

        <View
          style={[
            styles.rowWrapper,
            styles.rowBorderBottom,
            styles.friendsTitle,
          ]}
        >
          <Text
            type="title"
            style={styles.title}
            message={'friends/friendsTitle'}
            values={{ count: friendsCount }}
          />
        </View>

        <View style={styles.wrapper}>
          <View style={styles.whiteBg}>
            <FlatList
              initialNumToRender={8}
              refreshing={this.state.refreshing}
              onRefresh={this.onRefresh.bind(this)}
              data={friendsList.friendsByKm}
              keyExtractor={user => user.id}
              renderItem={userData => (
                <FriendRow
                  navigation={this.props.navigation}
                  userData={userData.item}
                  distance={true}
                  cutNumber={currentUser.user.riding_totals.distance}
                  orderedNumber={userData.index + 1}
                />
              )}
              onEndReachedThreshold={0.5}
              onEndReached={this.onEndReached.bind(this)}
              ItemSeparatorComponent={() => <RowSeparator />}
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
  rowBorderTop: {
    borderTopWidth: 1,
    borderTopColor: theme.backgroundColor,
  },
  rowBorderBottom: {
    borderBottomWidth: 1,
    borderBottomColor: theme.backgroundColor,
  },
  title: {
    flex: 1,
    fontSize: 18,
  },
  userNameContainer: {
    flex: 1,
  },
  userName: {
    fontSize: theme.font.sizes.default,
    ...theme.font.userName,
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
  friendsTitle: {
    paddingTop: 30,
  },
  orderedNumber: {
    width: 20,
    fontSize: theme.font.sizes.default,
    marginRight: 10,
  },
})

export default connect(
  state => ({
    user: state.user,
    friends: state.friends,
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
)(FriendsByKm)
