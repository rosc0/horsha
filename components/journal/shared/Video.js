import React, { PureComponent } from 'react'
import { StyleSheet, View } from 'react-native'
import Thumbnail from 'react-native-thumbnail-video/src/components/thumbnail'
import Text from '@components/Text'
import idx from 'idx'

/**
 * <Video content={content} />
 */

class Video extends PureComponent {
  render() {
    const { content } = this.props
    const { nr_of_video_weblinks = false, video_weblinks } = content

    if (!idx(content, _ => _.video_weblinks[0].url)) return null

    return (
      <View>
        {video_weblinks.map((video, index) => (
          <View key={index} style={styles.video}>
            <Text type="title" style={styles.title} text={video.title} />
            <Thumbnail
              url={idx(content, _ => _.video_weblinks[0].url).toString()}
            />
          </View>
        ))}
      </View>
    )
  }
}

const styles = StyleSheet.create({
  video: {
    marginTop: 15,
    position: 'relative',
  },
  title: {
    fontSize: 12,
    position: 'absolute',
    top: 0,
    right: 0,
    backgroundColor: 'rgba(0, 0, 0, .4)',
    color: 'white',
    padding: 8,
    zIndex: 10,
  },
})

export default Video
