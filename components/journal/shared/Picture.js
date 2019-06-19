import React, { PureComponent } from 'react'
import { StyleSheet, View } from 'react-native'
import Gallery from 'react-native-photo-gallery'

/**
 * <Picture
 *   content={content}
 *  />
 */

class Picture extends PureComponent {
  render() {
    const { content, goToJournalAlbum } = this.props

    if (!content || content.length === 0) {
      return null
    }

    const totalMissingPictures = content.length

    const imagesNotShowing =
      totalMissingPictures > 5 ? totalMissingPictures - 5 : 0

    const picturesData = content.map(picture => ({
      id: picture.id,
      image: {
        uri: picture.image.url,
      },
    }))

    return (
      <View style={styles.wrapper}>
        {content.length > 0 && (
          <Gallery
            type="shortcut"
            data={picturesData}
            imagesNotShowing={imagesNotShowing}
            useModal={true}
            onRequestClose={() => {}}
            onPressImage={goToJournalAlbum}
            onPressLastShortcutImage={goToJournalAlbum}
            showCloseButton={true} // TODO: remove this later and work with back button
          />
        )}
      </View>
    )
  }
}

const styles = StyleSheet.create({
  wrapper: {
    marginTop: 20,
  },
})

export default Picture
