import React, { PureComponent } from 'react'
import { connect } from 'react-redux'
import { StyleSheet, TouchableOpacity, View } from 'react-native'

import { bindActionCreators } from 'redux'
import * as userActions from '@actions/user'
import * as friendActions from '@actions/friends'

import Text from './Text'
import { theme } from '@styles/theme'
import { IconImage } from './Icons'

class AddFriendButton extends PureComponent {
  static defaultProps = {
    showIcon: true,
    buttonContainerStyle: null,
    buttonTextStyle: null,
    requestedContainerStyle: null,
    requestedTextStyle: null,
  }

  state = {
    requested: false,
  }

  addFriend = async userId => {
    if (!this.state.requested) {
      this.setState({
        requested: true,
      })
      await this.props.actions.addFriend(userId)
    }
  }

  render() {
    const {
      user,
      showIcon,
      buttonContainerStyle,
      buttonTextStyle,
      requestedContainerStyle,
      requestedTextStyle,
    } = this.props

    if (!!user.friends_since) return null

    return !user.friendship_requested ? (
      <TouchableOpacity
        activeOpacity={0.7}
        onPress={() => this.addFriend(user.id)}
      >
        {!this.state.requested ? (
          <View style={[styles.buttonContainer, buttonContainerStyle]}>
            {showIcon && (
              <IconImage source="plusIcon" style={styles.buttonPlus} />
            )}
            <Text
              type="title"
              weight="bold"
              message={'userProfile/addFriend'}
              style={[styles.buttonText, buttonTextStyle]}
            />
          </View>
        ) : (
          <View style={requestedContainerStyle}>
            <Text
              type="title"
              weight="bold"
              message={'userProfile/friendRequestSent'}
              style={[styles.requestedText, requestedTextStyle]}
            />
          </View>
        )}
      </TouchableOpacity>
    ) : (
      <View style={requestedContainerStyle}>
        <Text
          type="title"
          weight="bold"
          message={'userProfile/friendRequestSent'}
          style={[styles.requestedText, requestedTextStyle]}
        />
      </View>
    )
  }
}

const styles = StyleSheet.create({
  buttonText: {
    color: theme.secondaryColor,
    fontSize: theme.font.sizes.smallest,
    padding: 6,
  },
  requestedText: {
    color: theme.fontColor,
    paddingHorizontal: 0,
  },
  buttonContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: 'transparent',
    borderRadius: 3,
    borderColor: theme.secondaryColor,
    borderWidth: 1,
  },
  buttonPlus: {
    height: 13,
    width: 13,
    marginLeft: 8,
    marginRight: 4,
    tintColor: theme.secondaryColor,
  },
})

export default connect(
  // eslint-disable-next-line
  state => ({}),
  dispatch => ({
    actions: bindActionCreators(
      {
        ...userActions,
        ...friendActions,
      },
      dispatch
    ),
  })
)(AddFriendButton)
