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
 * <HorseUpdate entry={entry} />
 */

class HorseUpdate extends PureComponent {
  redirect = (type, id) => {
    const screen =
      type === 'horse'
        ? { name: 'Profile', params: { horseId: id } }
        : { name: 'UserProfile', params: { userId: id } }

    this.props.navigate(screen.name, screen.params)
  }

  render() {
    const { entry, navigate } = this.props
    console.log('@@ horse update', entry.post.statusUpdate.subject)
    const user = entry.post.author
    const {
      can_contribute,
      nr_of_comments,
      nr_of_likes,
      like_id = false,
      horse,
      relation_type = 'n',
    } = entry.post.statusUpdate.subject

    if (!horse) {
      return null
    }

    const middleText =
      relation_type === 'sharer'
        ? t('newsfeed/horseSharer')
        : t('newsfeed/horseOwner')

    const availableLink = !!user

    const headerData = {
      firstLink: {
        type: 'person',
        ...user,
      },
      secondLink: { type: 'horse', ...horse },
      availableLink,
      middleText,
      isPrivate: false,
      dateCreated: entry.post.dateCreated,
      shareScope: entry.post.shareScope,
    }

    // const firstUser = entry.post.author
    // const {
    //   user: secondUser,
    //   like_id = false,
    //   nr_of_likes,
    //   nr_of_comments,
    //   can_contribute,
    // } = entry.post.statusUpdate.subject

    // const headerData = {
    //   firstLink: {
    //     type: 'person',
    //     ...firstUser,
    //   },
    //   secondLink: {
    //     type: 'horse',
    //     ...secondUser,
    //   },
    //   middleText: t('newsfeed/becameFriend'),
    //   dateCreated: entry.post.dateCreated,
    //   isPrivate: false,
    //   shareScope: entry.post.shareScope,
    // }

    return (
      <View>
        <Header content={headerData} navigate={navigate} />

        <View style={[styles.inline, styles.horseWrapper]}>
          <TouchableOpacity
            style={styles.horseView}
            onPress={() => this.redirect('person', user.id)}
          >
            <Avatar
              newModel
              type="person"
              profile={user}
              style={styles.avatar}
            />

            <View style={styles.nameContainer}>
              <Text
                type="title"
                weight="bold"
                style={[styles.name, styles.wrapText]}
                numberOfLines={2}
                text={user.name}
              />
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.friendView, styles.noMargin]}
            onPress={() => this.redirect('horse', horse.id)}
          >
            <Avatar
              newModel
              profile={horse}
              style={[styles.avatar, { backgroundColor: '#eaeaea' }]}
            />

            <View style={styles.nameContainer}>
              <Text
                type="title"
                weight="bold"
                style={[styles.name, styles.wrapText]}
                numberOfLines={2}
                text={horse.name}
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
  horseWrapper: {
    justifyContent: 'center',
    marginTop: 20,
  },
  horseView: {
    marginRight: 20,
  },
  avatar: {
    width: width / 2 - 25,
    height: width / 2 - 25,
    resizeMode: 'contain',
  },
  nameContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  name: {
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

export default HorseUpdate
