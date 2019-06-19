import React, { PureComponent } from 'react'
import { View } from 'react-native'

import Header from './shared/Header'
import Text from './shared/Text'
import Ride from './shared/Ride'
import Picture from './shared/Picture'
import Video from './shared/Video'
import Interactions from './shared/Interactions'
import t from '@config/i18n'
import { getCounter } from '../../utils'

/*
 * <JournalUpdate entry={entry} />
 */

class JournalUpdate extends PureComponent {
  static defaultProps = {
    entry: {},
    onLikePress: () => {},
    onCommentPress: () => {},
  }

  goToJournalAlbum = media =>
    this.props.navigate('JournalAlbum', {
      entryId: this.props.entry.post.id,
      media,
    })

  render() {
    const {
      entry,
      navigate,
      navigation,
      isDetails,
      isHorseJournal,
      horseId,
      horse,
      activeHorse,
    } = this.props
    if (!entry.post) return <View />

    const {
      author,
      id: entryId,
      dateCreated,
      shareScope,
      likedSince = false,
      text,
      likes,
      comments,
      taggedHorse,
      media,
    } = entry.post

    const availableLink = !!author.name

    const nr_of_likes = getCounter(likes)
    const nr_of_comments = getCounter(comments)

    const headerData = {
      entryId,
      entry: entry.post,
      firstLink: {
        type: 'person',
        id: author.id,
        name: author.name,
      },
      secondLink: {
        type: 'horse',
        id: horseId,
        name: entry.post.taggedHorse ? entry.post.taggedHorse.name : null,
      },
      middleText: entry.post.taggedHorse
        ? t('newsfeed/entryAddedHorse')
        : t('newsfeed/entryAdded'),
      availableLink,
      avatar: author,
      horseAvatar: entry.post.taggedHorse ? taggedHorse : null,
      dateCreated: dateCreated,
      isPrivate: shareScope === 'team',
      shareScope: entry.post.shareScope,
      isOwner: author.id === this.props.userId,
      navigate: this.props.navigate,
    }

    return (
      <View>
        <Header
          content={headerData}
          navigate={navigate}
          navigation={navigation}
          showArrow={true}
          isDetails={isDetails}
          isHorseJournal={isHorseJournal}
          horseId={horseId}
          renderContent={<Text content={text} />}
        />

        {/* {media} */}
        {media && (
          <Picture
            content={media}
            goToJournalAlbum={() => this.goToJournalAlbum(media)}
          />
        )}

        {/* <Ride content={content} navigate={navigate} /> */}
        {/* <Video content={content} /> */}

        <Interactions
          likes={nr_of_likes}
          comments={nr_of_comments}
          isLiked={!!likedSince}
          onLikePress={this.props.onLikePress}
          onCommentPress={this.props.onCommentPress}
        />
      </View>
    )
  }
}

export default JournalUpdate
