import React, { PureComponent } from 'react'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import { StyleSheet, TouchableOpacity, View } from 'react-native'
import idx from 'idx'

import * as notificationActions from '@actions/notifications'
import Text from './Text'
import UserImage from './UserImage'

import { theme } from '@styles/theme'

class NotificationsHeader extends PureComponent {
  static defaultProps = {
    fromRoute: null,
  }

  state = { unreadCount: 0 }

  static getDerivedStateFromProps(props, state) {
    if (idx(props, _ => _.notifications.unreadCount) !== state.unreadCount) {
      return {
        unreadCount: props.notifications.unreadCount,
      }
    }

    return null
  }

  navigateToNotifications = () => {
    const { fromRoute } = this.props

    this.props.navigation.navigate('Notifications', { fromRoute })
  }

  componentDidMount() {
    this.props.actions.getUnreadCount()
  }

  render() {
    const { unreadCount } = this.state
    return (
      <View>
        <TouchableOpacity
          style={styles.button}
          onPress={this.navigateToNotifications}
          activeOpacity={0.7}
        >
          <UserImage user={this.props.user.user} style={styles.profileImage} />

          {unreadCount > 0 && (
            <View style={styles.unreadCountContainer}>
              <Text
                weight="bold"
                text={unreadCount}
                style={styles.unreadCount}
              />
            </View>
          )}
        </TouchableOpacity>
      </View>
    )
  }
}

const styles = StyleSheet.create({
  button: {
    paddingRight: 10,
    paddingLeft: 10,
    paddingTop: 8,
    paddingBottom: 8,
    marginTop: 0,
  },
  profileImage: {
    width: 30,
    height: 30,
    borderRadius: 15,
  },
  unreadCountContainer: {
    backgroundColor: 'white',
    width: 14,
    height: 14,
    borderRadius: 8,
    position: 'absolute',
    right: 10,
    top: 4,
  },
  unreadCount: {
    color: theme.mainColor,
    backgroundColor: 'transparent',
    textAlign: 'center',
    fontSize: theme.font.sizes.smallest,
  },
})

export default connect(
  state => ({
    user: state.user,
    notifications: state.notifications,
  }),
  dispatch => ({
    actions: bindActionCreators(notificationActions, dispatch),
  })
)(NotificationsHeader)
