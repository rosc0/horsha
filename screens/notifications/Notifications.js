import React, { PureComponent } from 'react'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import {
  FlatList,
  Image,
  StyleSheet,
  TouchableOpacity,
  View,
  RefreshControl,
} from 'react-native'

import UserImage from '@components/UserImage'
import HorseImage from '@components/HorseImage'
import RowSeparator from '@components/RowSeparator'
import HeaderTitle from '@components/HeaderTitle'
import Text from '@components/Text'
import Icon from '@components/Icon'
import BackButton from '@components/BackButton'
import UnverifiedUserBar from '@components/UnverifiedUserBar'
import NotificationWrapper from './components/NotificationWrapper'
import EmptyNotifications from './components/EmptyNotifications'
import * as notificationActions from '@actions/notifications'
import { theme } from '@styles/theme'
import { GET_NOTIFICATIONS_COLLECTION } from '../../apollo/queries/NotificationsCollection'
import { Query } from 'react-apollo'

class Notifications extends PureComponent {
  static navigationOptions = ({ navigation }) => ({
    headerTitle: <HeaderTitle title={'notifications/notificationsTitle'} />,
    headerLeft: (
      <BackButton
        onPress={
          navigation.state.params && navigation.state.params.handleBackButton
        }
      />
    ),
  })

  state = {
    fetching: false,
    refreshing: false,
  }

  static getDerivedStateFromProps(props, state) {
    if (props.notifications.fetching !== state.fetching) {
      return {
        fetching: props.notifications.fetching,
      }
    }
    // Return null to indicate no change to state.
    return null
  }

  componentDidMount() {
    this.props.navigation.setParams({
      handleBackButton: this.handleBackButton,
    })

    this.props.actions.getNotifications()
    // this.mergeNewNotifications()
    // this.props.actions.updateReadMarker()
  }

  navigateToMyProfile = () => {
    const { navigation } = this.props

    navigation.navigate('ProfileAndSettings', {
      fromRoute: navigation.state.params && navigation.state.params.fromRoute,
    })
  }

  navigateToJournalDetail = (journalId, commentId) => {
    this.props.navigation.navigate('JournalDetail', { journalId, commentId })
  }

  navigateToStatusDetail = (statusId, commentId) => {
    this.props.navigation.navigate('JournalDetail', { statusId, commentId })
  }

  navigateToHorseTeam = horseId => {
    this.props.navigation.navigate('HorseTeam', { horseId })
  }

  navigateToFriends = userId => {
    this.props.navigation.navigate('UserProfile', { userId })
  }

  navigateToTrail = trail => {
    this.props.navigation.navigate('TrailDetails', { trailId: trail.id })
  }

  handleBackButton = () => {
    this.props.actions.markNotificationsRead()
    this.props.navigation.goBack(null)
  }

  onEndReached = async () => {
    const { fetching } = this.state
    const { notifications: notificationsList } = this.props
    if (fetching === true) return // avoid double request

    if (notificationsList.notificationsRemaining && !fetching) {
      this.setState({ fetching: true })

      const { cursor } = notificationsList

      // if (cursor) {
      //   this.props.actions.getMoreNotifications(cursor).then(() => {
      //     this.setState({ fetching: false })
      //   })
      // }
    }
  }

  mergeNewNotifications() {
    this.props.actions.mergeNewNotifications()
  }

  onRefresh = async () => {
    this.setState({ refreshing: true })
    const a = await this.props.actions.getNotifications()
    console.log('@@ notifications', a)
    this.setState({ refreshing: false })
  }

  notificationsItem = notificationsData => {
    const notification = notificationsData.item
    const timeAgo = notification.dateUpdated

    switch (notification.type) {
      case 'journal_entry_created': {
        if (!notification.payload.journal_entry) return

        return (
          <NotificationWrapper
            isRead={true}
            user={notification.payload.journal_entry.user}
            navigation={this.props.navigation}
            contextImage={
              <HorseImage
                horse={notification.payload.journal_entry.horse}
                style={styles.rightImage}
              />
            }
            messageKey={'notifications/journalEntry'}
            values={{
              user: (
                <Text
                  weight="bold"
                  style={styles.name}
                  text={notification.payload.journal_entry.user.name}
                />
              ),
              horse: (
                <Text
                  weight="bold"
                  style={styles.name}
                  text={notification.payload.journal_entry.horse.name}
                />
              ),
            }}
            timeAgo={timeAgo}
            onPress={() =>
              this.navigateToJournalDetail(
                notification.payload.journal_entry.id
              )
            }
          />
        )
      }

      case 'user_friend_added': {
        const { user } = notification.payload
        if (!user) return

        return (
          <NotificationWrapper
            isRead={true}
            user={user}
            navigation={this.props.navigation}
            contextImage={<UserImage user={user} style={styles.rightImage} />}
            messageKey="notifications/newFriends"
            values={{
              name: <Text weight="bold" style={styles.name} text={user.name} />,
            }}
            timeAgo={timeAgo}
            onPress={() => this.navigateToFriends(user.id)}
          />
        )
      }

      case 'like_created': {
        const { like } = notification.payload

        if (!like.journal_entry && !like.status_update) {
          return null
        }

        let messageKey
        let contextImage
        let values = {
          user: (
            <Text
              weight="bold"
              style={styles.name}
              text={notification.payload.like.user.name}
            />
          ),
        }

        if (like.journal_entry) {
          messageKey = 'journalLikeCreated'
          values.horse = (
            <Text
              weight="bold"
              style={styles.name}
              text={like.journal_entry.horse.name}
            />
          )
          contextImage = (
            <HorseImage
              style={styles.rightImage}
              horse={like.journal_entry.horse}
            />
          )
        } else {
          switch (like.status_update.status_type) {
            case 'horse_user_created':
              {
                messageKey = 'horseUserLikeCreated'
                values.horse = (
                  <Text
                    weight="bold"
                    style={styles.name}
                    text={like.status_update.horse_user.horse.name}
                  />
                )
                contextImage = (
                  <UserImage
                    style={styles.rightImage}
                    user={like.status_update.horse_user.user}
                  />
                )
              }
              break
            case 'trail_created':
              {
                messageKey = 'trailLikeCreated'
                values.trail = (
                  <Text
                    weight="bold"
                    style={styles.name}
                    text={like.status_update.subject.trail.title}
                  />
                )
                contextImage = <Icon name="trails" style={styles.icon} />
              }
              break
            case 'user_friend_added':
              {
                messageKey = 'friendshipLikeCreated'
                values.friend = (
                  <Text
                    weight="bold"
                    style={styles.name}
                    text={like.status_update.subject.user.name}
                  />
                )
                contextImage = <Icon name="friends" style={styles.icon} />
              }
              break
          }
        }

        return (
          <NotificationWrapper
            isRead={true}
            user={notification.payload.like.user}
            navigation={this.props.navigation}
            messageKey={`notifications/${messageKey}`}
            contextImage={contextImage}
            values={values}
            timeAgo={timeAgo}
            onPress={() =>
              like.journal_entry
                ? this.navigateToJournalDetail(like.journal_entry.id)
                : this.navigateToStatusDetail(like.status_update.id)
            }
          />
        )
      }

      case 'comment_created': {
        const { comment } = notification.payload

        if (!comment.journal_entry && !comment.status_update) {
          return null
        }

        let messageKey
        let contextImage
        let values = {
          user: (
            <Text weight="bold" style={styles.name} text={comment.user.name} />
          ),
        }

        if (comment.journal_entry) {
          messageKey = 'journalCommentCreated'
          values.horse = (
            <Text
              weight="bold"
              style={styles.name}
              text={comment.journal_entry.horse.name}
            />
          )
          contextImage = (
            <HorseImage
              style={styles.rightImage}
              horse={comment.journal_entry.horse}
            />
          )
        } else {
          switch (comment.status_update.status_type) {
            case 'horse_user_created':
              {
                messageKey = 'horseUserCommentCreated'
                values.horse = (
                  <Text
                    weight="bold"
                    style={styles.name}
                    text={comment.status_update.horse_user.horse.name}
                  />
                )
                contextImage = (
                  <UserImage
                    style={styles.rightImage}
                    user={comment.status_update.horse_user.user}
                  />
                )
              }
              break
            case 'trail_created':
              {
                messageKey = 'trailCommentCreated'
                values.trail = (
                  <Text
                    weight="bold"
                    style={styles.name}
                    text={comment.status_update.subject.trail.title}
                  />
                )
                contextImage = <Icon name="trails" style={styles.icon} />
              }
              break
            case 'user_friend_added':
              {
                messageKey = 'friendshipCommentCreated'
                values.friend = (
                  <Text
                    weight="bold"
                    style={styles.name}
                    text={comment.status_update.subject.user.name}
                  />
                )
                contextImage = <Icon name="friends" style={styles.icon} />
              }
              break
          }
        }

        return (
          <NotificationWrapper
            isRead={true}
            user={notification.payload.comment.user}
            navigation={this.props.navigation}
            messageKey={`notifications/${messageKey}`}
            contextImage={contextImage}
            values={values}
            timeAgo={timeAgo}
            onPress={() =>
              comment.journal_entry
                ? this.navigateToJournalDetail(
                    comment.journal_entry.id,
                    comment.id
                  )
                : this.navigateToStatusDetail(
                    comment.status_update.id,
                    comment.id
                  )
            }
          />
        )
      }

      case 'horse_user_created': {
        let messageKey =
          notification.payload.horse_user.relation_type === 'owner'
            ? 'notifications/friendHorseOwnerCreated'
            : 'notifications/friendHorseSharerCreated'

        if (
          this.props.user.user.id === notification.payload.horse_user.user.id
        ) {
          messageKey =
            notification.payload.horse_user.relation_type === 'owner'
              ? 'notifications/youHorseOwnerCreated'
              : 'notifications/youHorseSharerCreated'
        }

        return (
          <NotificationWrapper
            isRead={true}
            user={notification.payload.horse_user.user}
            navigation={this.props.navigation}
            contextImage={
              <HorseImage
                horse={notification.payload.horse_user.horse}
                style={styles.rightImage}
              />
            }
            messageKey={messageKey}
            values={{
              user: (
                <Text
                  weight="bold"
                  style={styles.name}
                  text={notification.payload.horse_user.user.name}
                />
              ),
              horse: (
                <Text
                  weight="bold"
                  style={styles.name}
                  text={notification.payload.horse_user.horse.name}
                />
              ),
            }}
            timeAgo={timeAgo}
            onPress={() =>
              this.navigateToHorseTeam(notification.payload.horse_user.horse.id)
            }
          />
        )
      }

      case 'horse_user_has_become_owner': {
        const messageKey =
          this.props.user.user.id === notification.payload.horse_user.user.id
            ? 'notifications/youHorseOwnerChanged'
            : 'notifications/friendHorseOwnerChanged'

        return (
          <NotificationWrapper
            isRead={true}
            user={notification.payload.horse_user.user}
            navigation={this.props.navigation}
            contextImage={
              <HorseImage
                horse={notification.payload.horse_user.horse}
                style={styles.rightImage}
              />
            }
            messageKey={messageKey}
            values={{
              user: (
                <Text
                  weight="bold"
                  style={styles.name}
                  text={notification.payload.horse_user.user.name}
                />
              ),
              horse: (
                <Text
                  weight="bold"
                  style={styles.name}
                  text={notification.payload.horse_user.horse.name}
                />
              ),
            }}
            timeAgo={timeAgo}
            onPress={() =>
              this.navigateToHorseTeam(notification.payload.horse_user.horse.id)
            }
          />
        )
      }

      case 'horse_user_has_become_sharer': {
        const messageKey =
          this.props.user.user.id === notification.payload.horse_user.user.id
            ? 'notifications/youHorseSharerChanged'
            : 'notifications/friendHorseSharerChanged'

        return (
          <NotificationWrapper
            isRead={true}
            user={notification.payload.horse_user.user}
            navigation={this.props.navigation}
            contextImage={
              <HorseImage
                horse={notification.payload.horse_user.horse}
                style={styles.rightImage}
              />
            }
            messageKey={messageKey}
            values={{
              user: (
                <Text
                  weight="bold"
                  style={styles.name}
                  text={notification.payload.horse_user.user.name}
                />
              ),
              horse: (
                <Text
                  weight="bold"
                  style={styles.name}
                  text={notification.payload.horse_user.horse.name}
                />
              ),
            }}
            timeAgo={timeAgo}
            onPress={() =>
              this.navigateToHorseTeam(notification.payload.horse_user.horse.id)
            }
          />
        )
      }

      case 'horse_user_archived': {
        const messageKey =
          this.props.user.user.id === notification.payload.horse_user.user.id
            ? 'notifications/youHorseUserArchived'
            : 'notifications/friendHorseUserArchived'

        return (
          <NotificationWrapper
            isRead={true}
            user={notification.payload.horse_user.user}
            navigation={this.props.navigation}
            contextImage={
              <HorseImage
                horse={notification.payload.horse_user.horse}
                style={styles.rightImage}
              />
            }
            messageKey={messageKey}
            values={{
              user: (
                <Text
                  weight="bold"
                  style={styles.name}
                  text={notification.payload.horse_user.user.name}
                />
              ),
              horse: (
                <Text
                  weight="bold"
                  style={styles.name}
                  text={notification.payload.horse_user.horse.name}
                />
              ),
            }}
            timeAgo={timeAgo}
            onPress={() =>
              this.navigateToHorseTeam(notification.payload.horse_user.horse.id)
            }
          />
        )
      }

      case 'horse_user_unarchived': {
        const messageKey =
          this.props.user.user.id === notification.payload.horse_user.user.id
            ? 'notifications/youHorseUserUnArchived'
            : 'notifications/friendHorseUserUnArchived'

        return (
          <NotificationWrapper
            isRead={true}
            user={notification.payload.horse_user.user}
            navigation={this.props.navigation}
            contextImage={
              <HorseImage
                horse={notification.payload.horse_user.horse}
                style={styles.rightImage}
              />
            }
            messageKey={messageKey}
            values={{
              user: (
                <Text
                  weight="bold"
                  style={styles.name}
                  text={notification.payload.horse_user.user.name}
                />
              ),
              horse: (
                <Text
                  weight="bold"
                  style={styles.name}
                  text={notification.payload.horse_user.horse.name}
                />
              ),
            }}
            timeAgo={timeAgo}
            onPress={() =>
              this.navigateToHorseTeam(notification.payload.horse_user.horse.id)
            }
          />
        )
      }

      // case 'trail_review_content_updated': {
      //   return (
      //     <NotificationWrapper
      //       isRead={true}
      //       user={notification.payload.trail_review.user}
      //       navigation={this.props.navigation}
      //       messageKey={'notifications/trailReviewUpdated'}
      //       contextImage={<Icon name="trails" style={styles.icon} />}
      //       values={{
      //         user: (
      //           <Text
      //             weight="bold"
      //             style={styles.name}
      //             text={notification.payload.trail_review.user.name}
      //           />
      //         ),
      //         trail: (
      //           <Text
      //             weight="bold"
      //             style={styles.name}
      //             text={notification.payload.trail_review.trail.title}
      //           />
      //         ),
      //       }}
      //       timeAgo={timeAgo}
      //       onPress={() =>
      //         this.navigateToTrail(notification.payload.trail_review.trail)
      //       }
      //     />
      //   )
      // }

      // TODO: these 2 are broken see HYB-1201
      // # Someone is added to the horse team
      // HORSE_TEAM_MEMBER_ADDED
      // # A team members' role has been changed
      // HORSE_TEAM_MEMBER_ROLE_UPDATED
      // # Someone has commented on your post
      // POST_COMMENT_ADDED
      // # Someone has liked your post
      // POST_LIKED
      // # A Post is published
      // POST_PUBLISHED
      // # A review is added to the trail
      // TRAIL_REVIEW_ADDED
      // # A friend is added to your friendlist
      // USER_FRIEND_ADDED
      // # A user is not following you
      // USER_FOLLOWER_ADDED
      case 'TRAIL_REVIEW_ADDED': {
        return (
          <NotificationWrapper
            isRead={notification.dateRead}
            user={notification.subject.trail.creator}
            navigation={this.props.navigation}
            messageKey={'notifications/trailReviewCreated'}
            contextImage={<Icon name="trails" style={styles.icon} />}
            values={{
              user: (
                <Text
                  weight="bold"
                  style={styles.name}
                  text={notification.subject.trail.creator.name}
                />
              ),
              trail: (
                <Text
                  weight="bold"
                  style={styles.name}
                  text={notification.subject.trail.title}
                />
              ),
            }}
            timeAgo={timeAgo}
            onPress={() => this.navigateToTrail(notification.subject.trail)}
          />
        )
      }
      case 'POST_LIKED': {
        console.log(
          'notification.type POST_LIKED',
          notification,
          notification.subject.post
        )
        if (notification.subject.post === null) {
          return null
        }
        return (
          <NotificationWrapper
            isRead={notification.dateRead}
            user={notification.actors.collection[0].user}
            navigation={this.props.navigation}
            messageKey={'notifications/journalLikeCreatedWithoutHorse'}
            contextImage={
              <UserImage
                newModel
                style={styles.rightImage}
                user={notification.actors.collection[0].user}
              />
            }
            values={{
              user: (
                <Text
                  weight="bold"
                  style={styles.name}
                  text={notification.actors.collection[0].user.name}
                />
              ),
              // trail: (
              //   <Text
              //     weight="bold"
              //     style={styles.name}
              //     text={notification.subject.post.title}
              //   />
              // ),
            }}
            timeAgo={timeAgo}
            onPress={
              // () => this.navigateToTrail(notification.subject.user)
              () => this.navigateToJournalDetail(notification.subject.post.id)
            }
          />
        )
      }
      case 'POST_PUBLISHED': {
        console.log(
          'notification.type POST_PUBLISHED',
          notification,
          notification.subject.post
        )

        return (
          <NotificationWrapper
            isRead={notification.dateRead}
            user={notification.subject.post.author}
            navigation={this.props.navigation}
            messageKey={'notifications/journalEntryWithputHorse'}
            contextImage={
              <UserImage
                newModel
                style={styles.rightImage}
                user={notification.subject.post.author}
              />
            }
            values={{
              user: (
                <Text
                  weight="bold"
                  style={styles.name}
                  text={notification.subject.post.author.name}
                />
              ),
            }}
            timeAgo={timeAgo}
            onPress={() =>
              this.navigateToJournalDetail(notification.subject.post.id)
            }
          />
        )
      }
      case 'POST_COMMENT_ADDED': {
        console.log(
          'notification.type POST_COMMENT_ADDED',
          notification,
          notification.subject.post
        )

        // const { comment } = notification.payload

        // if (!comment.journal_entry && !comment.status_update) {
        //   return null
        // }

        // let messageKey
        // let contextImage
        // let values = {
        //   user: (
        //     <Text weight="bold" style={styles.name} text={comment.user.name} />
        //   ),
        // }

        return (
          <NotificationWrapper
            isRead={notification.dateRead}
            user={notification.subject.post.author}
            navigation={this.props.navigation}
            messageKey={'notifications/journalCommentCreatedWithoutHorse'}
            // contextImage={
            //   <UserImage
            //     newModel
            //     style={styles.rightImage}
            //     user={notification.subject.post.author}
            //   />
            // }
            values={{
              user: (
                <Text
                  weight="bold"
                  style={styles.name}
                  text={notification.subject.post.author.name}
                />
              ),
            }}
            timeAgo={timeAgo}
            onPress={() =>
              this.navigateToJournalDetail(notification.subject.post.id)
            }
          />
        )
      }
      case 'USER_FOLLOWER_ADDED': {
        return (
          <NotificationWrapper
            isRead={notification.dateRead}
            user={notification.actors.collection[0].user}
            navigation={this.props.navigation}
            messageKey={'notifications/journalFollowCreated'}
            values={{
              user: (
                <Text
                  weight="bold"
                  style={styles.name}
                  text={notification.actors.collection[0].user.name}
                />
              ),
              numberOfFollowers: (
                <Text
                  weight="bold"
                  style={styles.name}
                  text={notification.actors.collection.lenght}
                />
              ),
            }}
            timeAgo={timeAgo}
            onPress={() =>
              this.navigateToFriends(notification.actors.collection[0].user.id)
            }
          />
        )
      }
      default:
        console.log('please add me ', notification.type)
    }
  }

  listHeaderComponent = () => {
    const { user } = this.props.user
    const unverified = user.verification_state === 'unverified'

    return (
      <View>
        {unverified && <UnverifiedUserBar navigation={this.props.navigation} />}

        <TouchableOpacity
          activeOpacity={0.7}
          onPress={this.navigateToMyProfile.bind(this)}
        >
          <View
            style={[
              styles.rowWrapper,
              styles.centerContent,
              styles.profileContainer,
            ]}
          >
            <UserImage newModel style={styles.leftImage} user={user} />
            <Text
              style={styles.myProfileText}
              type="title"
              message={'notifications/profileAndSettings'}
            />
            <Image
              style={styles.arrowRight}
              source={require('../../images/arrow-right-thin.png')}
            />
          </View>
        </TouchableOpacity>

        {/* { showNewMessageButton && (
          <TouchableOpacity activeOpacity={0.7} onPress={this.mergeNewNotifications.bind(this)}>
            <View style={styles.newItemsButton}>
              <Text
                type='title'
                style={styles.newItemsButtonText}
                message='notifications/newItemsMessage'
                values={{count: newMessageCount}} />
            </View>
          </TouchableOpacity>
        )} */}

        <RowSeparator />
      </View>
    )
  }

  render() {
    const { user } = this.props
    const { fetching, refreshing } = this.state
    // const { notifications: notificationsList } = notifications
    // const newMessageCount = this.props.notifications.newNotifications.length
    // const showNewMessageButton = newMessageCount > 0

    const maxItems = 15

    return (
      <View style={styles.wrapper}>
        {this.listHeaderComponent()}
        <Query
          query={GET_NOTIFICATIONS_COLLECTION}
          variables={{ userId: user.id, maxItems }}
        >
          {({ data, loading, error, fetchMore, refetch }) => {
            if (loading) return null
            if (error) return null
            const { collection, pageInfo } = data.notifications
            console.log('@@ collection notifications', collection)
            return (
              <FlatList
                initialNumToRender={20}
                refreshing={refreshing}
                onRefresh={() => refetch()}
                data={collection}
                keyExtractor={notification => notification.id}
                renderItem={this.notificationsItem}
                onEndReachedThreshold={1}
                ItemSeparatorComponent={() => <RowSeparator />}
                ListEmptyComponent={
                  <View style={styles.whiteBg}>
                    <EmptyNotifications
                      fetching={fetching}
                      navigation={this.props.navigation}
                    />
                  </View>
                }
                refreshControl={
                  <RefreshControl
                    refreshing={refreshing}
                    onRefresh={() => refetch()}
                    tintColor="#fff"
                    titleColor="#fff"
                  />
                }
                // onEndReached={() => {
                //   fetchMore({
                //     variables: { cursor: pageInfo.next, maxItems },
                //     updateQuery: (previousResult, { fetchMoreResult }) => {
                //       if (!fetchMoreResult) {
                //         return previousResult
                //       }

                //       const previousEntry =
                //         previousResult.notifications.collection
                //       const newCollection =
                //         fetchMoreResult.notifications.collection

                //       let hasMoreListings = collection.length % maxItems === 0
                //       if (!hasMoreListings) {
                //         return previousResult
                //       }
                //       if (newCollection.length < maxItems) {
                //         hasMoreListings = false
                //       }

                //       return {
                //         notifications: {
                //           ...fetchMoreResult.notifications,
                //           collection: [...previousEntry, ...newCollection],
                //           __typename: previousResult.notifications.__typename,
                //         },
                //       }
                //     },
                //   })
                // }}
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
  whiteBg: {
    backgroundColor: 'white',
    flex: 1,
  },
  rowWrapper: {
    flexDirection: 'row',
    backgroundColor: 'white',
    padding: 15,
    paddingRight: 20,
  },
  centerContent: {
    alignItems: 'center',
  },
  myProfileText: {
    flex: 1,
    fontSize: 16,
    ...theme.font.userName,
    color: theme.fontColorDark,
  },
  leftImage: {
    width: 40,
    height: 40,
    marginRight: 10,
  },
  rightImage: {
    width: 35,
    height: 35,
    marginLeft: 10,
  },
  icon: {
    fontSize: 35,
    lineHeight: 35,
    marginLeft: 10,
    color: '#d0d0d0',
  },
  arrowRight: {
    width: 10,
    height: 15,
  },
  profileContainer: {
    marginVertical: 20,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: theme.borderDark,
  },
  name: {
    ...theme.font.userName,
    color: theme.fontColorDark,
  },
})

export default connect(
  state => ({
    user: state.user,
    notifications: state.notifications,
  }),
  dispatch => ({
    actions: bindActionCreators(
      {
        ...notificationActions,
      },
      dispatch
    ),
  })
)(Notifications)
