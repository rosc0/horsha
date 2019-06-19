import { PureComponent } from 'react'
import { AppState } from 'react-native'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import config from 'react-native-config'
import TimerMixin from 'react-timer-mixin'

import * as userActions from '@actions/user'
import * as horseActions from '@actions/horses'
import * as notificationActions from '@actions/notifications'
import * as friendActions from '@actions/friends'

import Notifications from '@api/notifications'

const NotificationsAPI = new Notifications()

class NotificationsWebSocket extends PureComponent {
  state = {
    ws: null,
    appState: AppState.currentState,
  }

  async handleNotification(notificationId) {
    const userId = this.props.user.user.id

    const notification = await NotificationsAPI.getNotification(notificationId)

    const refreshHorses = [
      'horse_user_has_become_owner',
      'horse_user_has_become_sharer',
      'horse_user_archived',
      'horse_user_unarchived',
    ]

    if (
      notification.target_user &&
      notification.target_user.id === userId &&
      refreshHorses.indexOf(notification.type) >= 0
    ) {
      this.props.actions.getHorses()
    }

    if (notification.type === 'user_friend_added') {
      this.props.actions.getSuggestions()
    }

    this.props.actions.addNotification(notification)
  }

  removeNotification(notificationId) {
    this.props.actions.removeNotification(notificationId)
  }
  // eslint-disable-next-line no-unused-vars
  handleNewsFeedItem(newsFeedItemId) {
    console.log('TODO: add news item', newsFeedItemId)
  }

  updateReadMarker(readMarkerTimestamp) {
    // this.props.actions.updateReadMarker(readMarkerTimestamp)
  }

  handleVerificationStateChange(userId) {
    this.props.actions.verificationStateChange(userId)
  }

  handelUpdateFriendSuggestions() {
    this.props.actions.getSuggestions()
  }

  refreshFriends() {
    this.props.actions.getFriends()
    this.props.actions.getSuggestions()
  }

  refreshFriendPendingRequests() {
    this.props.actions.getInvitations('pending')
  }

  removeFriendFromList(userId) {
    this.props.actions.removeFriendFromList(userId)
  }

  restartWebSocketOnError() {
    this.closeWebSocket()

    TimerMixin.setTimeout(() => {
      this.setState({ ws: null })
      this.openWebSocket()
    }, 10000)
  }

  closeWebSocket() {
    if (this.state.ws) {
      this.state.ws.close()
      this.setState({ ws: null })
    }
  }

  async reOpenWebSocket() {
    await this.props.actions.getUnreadCount()
    await this.props.actions.getNotifications()

    this.openWebSocket()
  }

  openWebSocket() {
    if (this.state.ws) {
      this.state.ws.close()
    }

    const accessToken = this.props.auth.auth.accessToken
    const userId = this.props.user.user.id

    const ws = new WebSocket(
      config.WS_BASE +
        '/callback?user_id=' +
        userId +
        '&access_token=' +
        accessToken
    )

    ws.onopen = () => {
      // console.log('ws open')
    }

    ws.onmessage = e => {
      const notification = JSON.parse(e.data)
      if (notification.type) {
        switch (notification.type) {
          case 'notification_created':
            if (notification.notification_id) {
              this.handleNotification(notification.notification_id)
            }
            break
          case 'notification_deleted':
            if (notification.notification_id) {
              this.removeNotification(notification.notification_id)
            }
            break
          case 'news_feed_item_created':
            if (notification.news_feed_item_id) {
              this.handleNewsFeedItem(notification.news_feed_item_id)
            }
            break
          case 'notification_read_state_updated':
            if (notification.timestamp) {
              this.updateReadMarker(notification.timestamp)
            }
            break
          case 'user.friend_request.added':
            this.refreshFriendPendingRequests()
            break
          case 'user.friend_request.removed':
            this.refreshFriendPendingRequests()
            break
          case 'user.friend.added':
            this.refreshFriends()
            break
          case 'user.friend.removed':
            if (notification.payload.target_user_id) {
              this.removeFriendFromList(notification.payload.target_user_id)
            }
            break
          case 'user_verification_state_changed':
            if (notification.user_id) {
              this.handleVerificationStateChange(notification.user_id)
            }
            break
          case 'user_friend_suggestions_updated':
            if (notification.friendship) {
              this.handelUpdateFriendSuggestions()
            }
            break

          case 'user_friend_request_state_updated':
            if (notification.friendship) {
              this.handelUpdateFriendSuggestions()
            }
            break
          default: {
            if (notification.type !== 'keep_alive') {
              console.log(
                '!!!!!!!!!!!!!!!!!!!!!!notification missing!!!!!!!!!!!!!!!!!!!!!!!!!!!: ',
                notification
              )
            }
          }
        }
      }
    }

    ws.onerror = e => {
      this.restartWebSocketOnError(e)
    }

    this.setState({ ws: ws })
  }

  appStateChange = nextAppState => {
    if (
      this.state.appState.match(/inactive|background/) &&
      nextAppState === 'active'
    ) {
      this.reOpenWebSocket()
    } else {
      this.closeWebSocket()
    }

    this.setState({ appState: nextAppState })
  }

  componentDidMount() {
    this.openWebSocket()
    AppState.addEventListener('change', this.appStateChange)
  }

  componentWillUnmount() {
    this.closeWebSocket()
    AppState.removeEventListener('change', this.appStateChange)
  }

  render() {
    return null
  }
}

export default connect(
  state => ({
    user: state.user,
    auth: state.auth,
  }),
  dispatch => ({
    actions: bindActionCreators(
      {
        ...userActions,
        ...friendActions,
        ...notificationActions,
        ...horseActions,
      },
      dispatch
    ),
  })
)(NotificationsWebSocket)
