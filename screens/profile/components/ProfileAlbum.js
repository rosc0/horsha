import React, { PureComponent } from 'react'
import Gallery from 'react-native-photo-gallery'

class ProfileAlbum extends PureComponent {
  render() {
    const { pictures, onPressPicture, ...props } = this.props

    return (
      <Gallery
        type="list"
        data={pictures.map(({ image, key }) => ({
          id: key,
          image: {
            uri: image,
          },
        }))}
        useModal={true}
        horizontal={true}
        showFullscreen={false}
        onPressImage={() => onPressPicture()}
        style={{ marginTop: 15 }}
        {...props}
      />
    )
  }
}

export default ProfileAlbum
