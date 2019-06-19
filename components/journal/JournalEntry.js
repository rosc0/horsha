import React, { PureComponent } from 'react'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import { StyleSheet, TouchableOpacity, View } from 'react-native'

import { toggleLike } from '@actions/newsfeed'
import JournalUpdate from './JournalUpdate'
import NewFriendUpdate from './NewFriendUpdate'
import HorseUpdate from './HorseUpdate'
import TrailCreatedUpdate from './TrailCreatedUpdate'

class JournalEntry extends PureComponent {
  static defaultProps = {
    userId: null,
    entry: {},
    onPress: () => {},
    onCommentPress: () => {},
  }

  toggleLike = async () => {
    const { post } = this.props.entry.subject
    const contentId = post.id
    const isLiked = !!post.likedSince

    await this.props.actions.toggleLike(isLiked, contentId)
  }

  render() {
    const {
      userId,
      isDetails = false,
      isHorseJournal = false,
      horseId = false,
    } = this.props

    let Update = null
    const { subject: entry } = this.props.entry
    const { statusUpdate } = entry.post

    if (statusUpdate) {
      if (statusUpdate.subject.user) {
        Update = NewFriendUpdate
      }
      if (statusUpdate.subject.horse) {
        Update = HorseUpdate
      }
      if (statusUpdate.subject.trail) {
        Update = TrailCreatedUpdate
      }
      // Update = JournalUpdate
    } else {
      Update = JournalUpdate
    }

    // if (type === 'post_published') {
    //   const { post } = entry

    //   if (!post) {
    //     return null
    //   }

    //   if (!types[type]) {
    //     return null
    //   }

    //   Update = types[type]
    // } else if (entry.type === 'status_update_created') {

    //   const type = statusUpdate ? statusUpdate.status_type : entry.type

    //   if (!type) {
    //     return null
    //   }

    //   if (!types[type]) {
    //     return null
    //   }

    //   if (
    //     type === 'user_friend_added' &&
    //     (!statusUpdate.subject.user || !statusUpdate.user)
    //   ) {
    //     return null
    //   }

    //   if (
    //     type === 'horse_user_created' &&
    //     (!statusUpdate.subject.horse_user.horse || !statusUpdate.user)
    //   ) {
    //     return null
    //   }

    //   Update = types[type]
    // }

    if (!Update) {
      return null
    }

    return (
      <View style={[styles.wrapper, this.props.wrapperStyle]}>
        <TouchableOpacity activeOpacity={1} onPress={this.props.onPress}>
          <Update
            entry={entry}
            userId={userId}
            onLikePress={this.toggleLike}
            onCommentPress={this.props.onCommentPress}
            navigate={this.props.navigate}
            navigation={this.props.navigation}
            isDetails={isDetails}
            isHorseJournal={isHorseJournal}
            horseId={horseId}
          />
        </TouchableOpacity>
      </View>
    )
  }
}

const styles = StyleSheet.create({
  wrapper: {
    paddingVertical: 10,
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderColor: '#d6d6da',
  },
})

export default connect(
  state => ({
    settings: state.settings,
    horses: state.horses,
  }),
  dispatch => ({
    actions: bindActionCreators({ toggleLike }, dispatch),
  })
)(JournalEntry)
