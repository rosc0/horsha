import React, { PureComponent } from 'react'
import { StyleSheet, View } from 'react-native'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import { Gallery } from 'rn-slider-gallery'
import { PropTypes } from 'react-native-globalize'
import GalleryGrid from '@components/Gallery'

import * as newsfeedActions from '@actions/newsfeed'

import Loading from '@components/Loading'
import HeaderTitle from '@components/HeaderTitle'
import BackButton from '@components/BackButton'
import Text from '@components/Text'

class JournalAlbum extends PureComponent {
  static contextTypes = {
    globalize: PropTypes.globalizeShape,
  }

  static navigationOptions = ({ navigation }) => ({
    tabBarVisible: false,
    headerTitle: <HeaderTitle title={'journal/horseJournalAlbum'} />,

    headerLeft: (
      <BackButton
        onPress={
          navigation.state.params && navigation.state.params.handleBackButton
        }
      />
    ),
  })

  state = {
    imageIndex: 0,
    isImageViewVisible: false,
  }

  componentDidMount() {
    this.props.navigation.setParams({
      handleBackButton: this.handleBackButton,
    })

    // this.props.actions.getUpdate(this.props.navigation.state.params.entryId)
  }

  handleBackButton = () => this.props.navigation.goBack(null)

  setIndex = imageIndex => {
    if (
      imageIndex === this.state.imageIndex &&
      !!this.state.isImageViewVisible
    ) {
      return
    }
    return this.setState({ imageIndex, isImageViewVisible: true })
  }

  render() {
    const { imageIndex, isImageViewVisible } = this.state

    // const { album } = this.props.news
    const medias = this.props.navigation.getParam('media', [])
    console.log('medias', medias)
    // if (album.fetching) {
    //   return <Loading type="spinner" />
    // }

    // const images = album.pictures.map(image => ({
    //   id: image.id,
    //   url: `${image.uri}?t=400x400,fill`,
    //   source: {
    //     uri: `${image.uri}?t=400x400,fill`,
    //   },
    //   allowSelect: false,
    //   // passing to easy recognition of image sizes on android
    //   width: image.width > 320 ? image.width : 400,
    //   height: image.height > 320 ? image.height : 400,
    // }))

    const images = medias.map(media => ({
      id: media.id,
      url: media.image.url,
      source: {
        uri: media.image.url,
      },
      allowSelect: false,
      // passing to easy recognition of image sizes on android
      width: media.image.width > 320 ? media.image.width : 400,
      height: media.image.height > 320 ? media.image.height : 400,
    }))

    return (
      <View style={styles.container}>
        <GalleryGrid
          data={images}
          setIndex={this.setIndex}
          handlePressImage={this.handlePressImage}
          shouldSelectPhotos={false}
          shouldDeletePhotos={false}
          selectedImages={[]}
          ListEmptyComponent={
            <View style={styles.centeredContainer}>
              <Text
                type="title"
                style={styles.noPicturesText}
                message="newsfeed/noPictures"
              />
            </View>
          }
        />
        {isImageViewVisible === true && (
          <Gallery
            images={images}
            imageIndex={imageIndex}
            isImageViewVisible={isImageViewVisible}
            setIndex={this.setIndex}
            onClose={() => this.setState({ isImageViewVisible: false })}
            closeComponent={
              <Text
                type="title"
                weight="bold"
                style={{
                  color: 'white',
                  textShadowColor: 'rgba(0, 0, 0, 0.9)',
                  textShadowOffset: { width: -1, height: 1 },
                  textShadowRadius: 10,
                  paddingHorizontal: 10,
                }}
                message="common/close"
              />
            }
          />
        )}
      </View>
    )
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centeredContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  noPicturesText: {
    fontSize: 18,
  },
})

const mapStateToProps = ({ news, gallery }) => ({
  news,
  image: gallery.images[0] || {},
})

const mapDispatchToProps = dispatch => ({
  actions: bindActionCreators(newsfeedActions, dispatch),
})

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(JournalAlbum)
