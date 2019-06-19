import React, { PureComponent } from 'react'
import {
  StyleSheet,
  TouchableOpacity,
  View,
  Keyboard,
  TouchableWithoutFeedback,
} from 'react-native'
import TimerMixin from 'react-timer-mixin'
import ActionSheet from 'rn-action-sheet'
import t from '@config/i18n'
import { theme } from '@styles/theme'
import { withNavigation } from 'react-navigation'
import { bindActionCreators } from 'redux'
import * as galleryActions from '@actions/gallery'
import { connect } from 'react-redux'

import Icon from '@components/Icon'
import Text from '@components/Text'

import Upload from '@api/upload'
import Horses from '@api/horses'

import ImagePicker from 'react-native-image-crop-picker'

const UploadAPI = new Upload()
const HorsesAPI = new Horses()
class AddJournalActions extends PureComponent {
  state = {
    buttonTapped: false,
    lastImage: null,
    progress: 0,
    images: [],
  }

  sendImage = async key => {
    const res = await HorsesAPI.addPostImage(this.props.postId, key)
    return res
  }

  upload = async () => {
    return await Promise.all(
      this.props.images.map(async (image, index) => {
        setTimeout(async () => {
          console.log('@@ IMGE', image, this.props.images)
          const result = await UploadAPI.uploadImage(image)

          console.log('@@ result 1', result, image)
          const sendedImage = await this.sendImage(result.key)
          console.log(
            `res #${result.key} called after ${index * 500} milliseconds`
          )
          if (image.uri || image.path) {
            this.props.onPressAddPhoto({
              id: sendedImage.id,
              uri: image.uri || image.path,
            })
          }
        }, index * 500)
      })
    )
    // return ImagePicker.clean().then(() => {
    //   console.log('removed all tmp images from tmp directory');
    // }).catch(e => {
    //   alert(e);
    // });
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
              callbackAction: this.upload,
            })
          }
          case 1: {
            return this.openPicker()
          }
        }
      }
    )
  }

  openPicker = () => {
    ImagePicker.openPicker({
      multiple: true,
      maxFiles: 10,
      forceJpg: true,
      compressImageMaxWidth: 1500,
      compressImageMaxHeight: 1500,
    }).then(async images => {
      // this.getSelectedImage(images)
      await this.props.actions.addImages(images)
      return this.upload()
    })
  }

  // getSelectedImage = galleryImages => {
  //   if (galleryImages.length === 0) return

  //   const shouldCropPicture =
  //     this.props.navigation.state.params &&
  //     this.props.navigation.state.params.shouldCropPicture

  //   const images = galleryImages.map(image => ({
  //     ...image,
  //     cropped: !shouldCropPicture,
  //   }))

  //   this.setState({ images })
  //   if (images.length === this.props.maximum && shouldCropPicture) {
  //     return this.goToCropPicture(images[0].uri, true)
  //   }

  //   // return this.goBack()
  //   this.savePicture()
  // }

  savePicture = async () => {
    const { images } = this.state
    if (this.state.images === null) {
      // TODO: improve this, and handle gallery picker
      alert(t('gallery/alert'))
      return
    }

    await this.props.actions.addImages(images)

    return this.upload()
  }

  handleActionPress = type => {
    const {
      actionsDisabled,
      onPressAddPhoto,
      onPressAddVideo,
      onPressAddRide,
      onPressPost,
    } = this.props

    if (type === 'photo') {
      // return onPressAddPhoto()
      return this.handleAddPicture()
    }

    if (type === 'video') {
      return onPressAddVideo()
    }

    if (type === 'ride') {
      return onPressAddRide()
    }

    if (actionsDisabled) {
      return
    }

    if (type === 'post') {
      return onPressPost()
    }
  }

  handleSave = async () => {
    this.setState({ buttonTapped: true })
    await this.handleActionPress('post')
    await TimerMixin.setTimeout(
      () => this.setState({ buttonTapped: false }),
      500
    )
  }

  render() {
    const { buttonTapped } = this.state
    const { actionsDisabled, editMode = false } = this.props

    const iconStyle = actionsDisabled
      ? [styles.icon, styles.disabledIcon]
      : styles.icon

    return (
      <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
        <View style={styles.container}>
          <View style={styles.actionsContainer}>
            <TouchableOpacity onPress={() => this.handleActionPress('photo')}>
              <Icon name="add_photo" style={iconStyle} />
            </TouchableOpacity>

            <TouchableOpacity onPress={() => this.handleActionPress('video')}>
              <Icon name="add_video_youtube" style={iconStyle} />
            </TouchableOpacity>

            {/* <TouchableOpacity onPress={() => this.handleActionPress('ride')}>
              <Icon name="rides" style={iconStyle} />
            </TouchableOpacity> */}
          </View>

          {buttonTapped ? (
            <View style={[styles.postButton, styles.saving]}>
              <Text
                type="title"
                weight="bold"
                style={[styles.postButtonText, styles.savingText]}
                message="journal/saving"
              />
            </View>
          ) : (
            <TouchableOpacity
              onPress={this.handleSave}
              style={[
                styles.postButton,
                actionsDisabled ? { borderColor: '#CCC' } : {},
              ]}
            >
              <Text
                type="title"
                weight="bold"
                style={[
                  styles.postButtonText,
                  actionsDisabled ? { color: '#CCC' } : {},
                ]}
                message={editMode ? 'journal/editPost' : 'journal/post'}
              />
            </TouchableOpacity>
          )}
        </View>
      </TouchableWithoutFeedback>
    )
  }
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: '#EEE',
    paddingVertical: 5,
    paddingHorizontal: 20,
    alignItems: 'center',
    height: 50,
    backgroundColor: 'white',
  },
  actionsContainer: {
    flexDirection: 'row',
    flex: 1,
  },
  icon: {
    fontSize: 33,
    color: '#97979C',
    marginRight: 20,
  },
  disabledIcon: {
    color: '#CCC',
  },
  postButton: {
    borderWidth: 1,
    borderColor: '#1E8583',
    borderRadius: 5,
    padding: 10,
  },
  saving: {
    flexDirection: 'row',
    borderColor: 'silver',
  },
  savingText: {
    color: 'silver',
    alignItems: 'center',
  },
  postButtonText: {
    fontSize: 12,
    paddingHorizontal: 10,
    color: '#1E8583',
  },
})

const mapStateToProps = ({ gallery }) => ({ images: gallery.images })

const mapDispatchToProps = dispatch => ({
  actions: bindActionCreators(galleryActions, dispatch),
})

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(withNavigation(AddJournalActions))
