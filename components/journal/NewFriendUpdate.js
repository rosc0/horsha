import React, { PureComponent } from 'react'
import { StyleSheet, TouchableOpacity, View, Dimensions } from 'react-native'

import { theme } from '@styles/theme'
import Header from './shared/Header'
import Text from '@components/Text'
import Avatar from '@components/Avatar'
import t from '@config/i18n'
import Interactions from './shared/Interactions'
const { width } = Dimensions.get('window')

/*
 * <NewFriendUpdate entry={entry} />
 */

class NewFriendUpdate extends PureComponent {
  navigateToProfile = userId => {
    this.props.navigate('UserProfile', { userId })
  }

  render() {
    const { entry, navigate } = this.props
    const firstUser = entry.post.author
    const {
      user: secondUser,
      like_id = false,
      nr_of_likes,
      nr_of_comments,
      can_contribute,
    } = entry.post.statusUpdate.subject

    const headerData = {
      firstLink: {
        type: 'person',
        ...firstUser,
      },
      secondLink: {
        type: 'person',
        ...secondUser,
      },
      middleText: t('newsfeed/becameFriend'),
      dateCreated: entry.post.dateCreated,
      isPrivate: false,
      shareScope: entry.post.shareScope,
    }

    return (
      <View>
        <Header content={headerData} navigate={navigate} />

        <View style={[styles.inline, styles.friendsWrapper]}>
          <TouchableOpacity
            style={styles.friendView}
            onPress={() => this.navigateToProfile(firstUser.id)}
          >
            <Avatar
              type="person"
              newModel
              profile={firstUser}
              style={styles.friendshipAvatar}
            />

            <View style={styles.nameContainer}>
              <Text
                type="title"
                weight="bold"
                text={firstUser.name}
                style={[styles.friendshipName, styles.wrapText]}
                numberOfLines={2}
              />
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.friendView, styles.noMargin]}
            onPress={() => this.navigateToProfile(secondUser.id)}
          >
            <Avatar
              type="person"
              newModel
              profile={secondUser}
              style={styles.friendshipAvatar}
            />

            <View style={styles.nameContainer}>
              <Text
                type="title"
                weight="bold"
                text={secondUser.name}
                style={[styles.friendshipName, styles.wrapText]}
                numberOfLines={2}
              />
            </View>
          </TouchableOpacity>
        </View>

        {can_contribute && (
          <Interactions
            likes={nr_of_likes}
            comments={nr_of_comments}
            isLiked={!!like_id}
            onLikePress={this.props.onLikePress}
            onCommentPress={this.props.onCommentPress}
          />
        )}
      </View>
    )
  }
}

const styles = StyleSheet.create({
  inline: {
    flexDirection: 'row',
  },
  friendsWrapper: {
    justifyContent: 'center',
    marginTop: 20,
  },
  friendView: {
    marginRight: 20,
  },
  friendshipAvatar: {
    width: width / 2 - 25,
    height: width / 2 - 25,
    resizeMode: 'cover',
  },
  nameContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  friendshipName: {
    alignSelf: 'center',
    marginTop: 10,
    ...theme.font.userName,
  },
  wrapText: {
    flex: 1,
    flexWrap: 'wrap',
    textAlign: 'left',
  },
  noMargin: {
    marginRight: 0,
  },
})

export default NewFriendUpdate
