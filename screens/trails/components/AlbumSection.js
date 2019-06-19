import React, { PureComponent } from 'react'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import { Dimensions, View } from 'react-native'

import Gallery from 'react-native-photo-gallery'
import ActionSheet from 'rn-action-sheet'
import idx from 'idx'

import Button from '@components/Button'

import t from '@config/i18n'
import * as trailActions from '@actions/trails'
import * as recordActions from '@actions/record'
import * as poiActions from '@actions/poi'
import * as galleryActions from '@actions/gallery'

import Upload from '@api/upload'
import Text from '@components/Text'
import { theme } from '@styles/theme'
import UploadProgress from '@components/UploadProgress'
import { CameraIcon } from './TrailsIcons'

import { addCameraIcon } from '@components/Icons'
import { styles } from '@styles/screens/trails/trailDetails'

const dimensions = Dimensions.get('window')
const size = { width: dimensions.width, height: dimensions.height }
const UploadAPI = new Upload()

class AlbumSection extends PureComponent {
  state = {
    loading: false,
    picturesData: [],
    picturesCount: 0,
    pois: [],
    boundPois: [],
    selectedPoi: {},
    progress: 0,
    showUpload: false,
    lastImage: {},
    trailId: null,
    isLiked: false,
  }

  static getDerivedStateFromProps(props, state) {
    const picturesCount =
      idx(props.pictures, _ => _.collection.length) +
      idx(props.pictures, _ => _.pageInfo.remaining)

    if (picturesCount !== state.picturesCount) {
      return {
        picturesCount,
      }
    }

    // if (
    //   idx(props.pictures, _ => _.collection) !==
    //   state.picturesData
    // ) {
    //   console.log('==> idx(props.pictures, _ => _.collection)', idx(props.pictures, _ => _.collection))
    //   return {
    //     picturesData: idx(props.pictures, _ => _.collection)
    //     // .filter(picture => picture.id)
    //     // .map(picture => ({
    //     //   ...picture,
    //     //   image: {
    //     //     uri: `${picture.image.url}?transformation="300x300,fill"`,
    //     //     // uri: `${picture.image.url}?transformation="300x300,fill"`,
    //     //   },
    //     // })),
    //   }
    // }
    // Return null to indicate no change to state.
    return null
  }

  componentDidUpdate(prevProps) {
    if (
      this.props.trails.pictures.upload.isUploading ||
      prevProps.image === this.props.image
    ) {
      return
    }
    if (!this.props.image || !this.props.image.uri) {
      return
    }

    this.handleUploadImage(this.props.image)
  }

  handleUploadImage = image => {
    const { trailId } = this.state
    // TODO: if another function not work we can put debounce
    if (image && trailId) {
      this.setState({ showUpload: true, lastImage: image })

      UploadAPI.uploadImage(image, progress => {
        this.setState({ progress })
      }).then(imageUpload => {
        if (imageUpload && imageUpload.key) {
          this.props.actions.addTrailImage(trailId, imageUpload.key)
          this.props.actions.clearImages()
          this.props.actions.getTrailPictures(trailId)
        }
        this.setState({ showUpload: false })
      })
    }
  }

  handleAddPicture = () => {
    const optionsTitleText = t('gallery/optionsTitle')
    const takePictureText = t('gallery/takePicture')
    const chooseFromGalleryText = t('gallery/chooseFromGallery')
    const cancelText = t('common/cancel')

    ActionSheet.show(
      {
        title: optionsTitleText,
        options: [takePictureText, chooseFromGalleryText, cancelText],
        cancelButtonIndex: 2,
        tintColor: theme.secondaryColor,
      },
      async index => {
        switch (index) {
          case 0: {
            return this.props.navigation.navigate('TakePicture', {
              callback: true,
            })
          }
          case 1: {
            return this.props.navigation.navigate('Gallery', {
              callback: true,
            })
          }
        }
      }
    )
  }

  goToTrailAlbum = () => {
    this.props.navigation.navigate('TrailAlbum', {
      trailId: this.props.trailId,
      selectPhotos: false,
    })
  }

  render() {
    const { pictures } = this.props
    const { showUpload, picturesData } = this.state

    const hasPictures = pictures.collection && pictures.collection.length > 0
    // GET_PREVIEW_TRAIL_PICTURES
    return (
      <View ref={ref => (this.albumView = ref)} style={styles.section}>
        <View style={styles.noMarginBottom}>
          <View style={styles.inline}>
            <CameraIcon style={styles.titleIcon} />

            <Text
              type="title"
              weight="bold"
              style={styles.title}
              message="trails/albumCountTitle"
              values={{
                count: (
                  <Text
                    weight="semiBold"
                    style={styles.itemLength}
                    text={hasPictures ? this.state.picturesCount : 0}
                  />
                ),
              }}
            />
          </View>
        </View>

        {showUpload ? (
          <UploadProgress
            progress={progress}
            text={t('upload/uploadingImage')}
          />
        ) : (
          <View>
            {hasPictures ? (
              <Gallery
                type="list"
                data={idx(this.props.pictures, _ => _.collection)}
                imagesPerRow={trailActions.MAX_TRAIL_IMAGES / 2}
                useModal={true}
                horizontal={true}
                showFullscreen={false}
                onPressImage={() => this.goToTrailAlbum()}
              />
            ) : (
              <View>
                <Text
                  style={styles.noContent}
                  message="trails/firstToAddPhotos"
                />
              </View>
            )}

            <View style={[styles.actions, { paddingTop: 15 }]}>
              <Button
                label="common/addPhoto"
                style={styles.button}
                textStyle={styles.buttonText}
                onPress={this.handleAddPicture}
                icon={addCameraIcon}
              />

              {hasPictures && pictures.pageInfo.remaining > 0 && (
                <Button
                  label="common/seeMore"
                  style={styles.button}
                  textStyle={styles.buttonText}
                  onPress={this.goToTrailAlbum}
                />
              )}
            </View>
          </View>
        )}
      </View>
    )
  }
}

export default connect(
  state => ({
    user: state.user,
    auth: state.auth,
    trails: state.trails,
    poi: state.poi,
    image: state.gallery.images[0] || {},
  }),
  dispatch => ({
    actions: bindActionCreators(
      {
        ...trailActions,
        ...recordActions,
        ...poiActions,
        ...galleryActions,
      },
      dispatch
    ),
  })
)(AlbumSection)
