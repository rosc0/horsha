import React, { PureComponent } from 'react'
import {
  Image,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native'

import ActionSheet from 'rn-action-sheet'

import t from '@config/i18n'
import Button from '@components/Button'
import Text from '@components/Text'
import { theme } from '@styles/theme'
import { IconImage } from '../../components/Icons'

const HORSE_IMAGE_PLACEHOLDER_SIZE = 80
const HORSE_IMAGE_SIZE = 374

class AddHorseImage extends PureComponent {
  handleNotNow = () => this.props.jumpToNextStep()

  handleAddPhoto = () => {
    const optionsTitleText = t('gallery/optionsTitle')
    const takePictureText = t('gallery/takePicture')
    const chooseFromGalleryText = t('gallery/chooseFromGallery')
    const cancelText = t('common/cancel')

    const galleryProps = {
      shouldCropPicture: true,
      callback: true,
    }

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
            return this.props.navigation.navigate('TakePicture', galleryProps)
          }
          case 1: {
            return this.props.navigation.navigate('Gallery', galleryProps)
          }
        }
      }
    )
  }

  handleChooseAnotherPhoto = () => {
    const optionsTitleText = t('gallery/optionsTitle')
    const takePictureText = t('gallery/takePicture')
    const chooseFromGalleryText = t('gallery/chooseFromGallery')
    const cancelText = t('common/cancel')

    const galleryProps = {
      shouldCropPicture: true,
      callback: true,
    }

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
            return this.props.navigation.navigate('TakePicture', galleryProps)
          }
          case 1: {
            this.props.clearImages()

            return this.props.navigation.navigate('Gallery', galleryProps)
          }
        }
      }
    )
  }

  render() {
    const { name, image, renderName } = this.props
    return (
      <ScrollView>
        {image ? (
          <View>
            <View style={styles.horseImageContainer}>
              <Image source={{ uri: image.uri }} style={styles.horseImage} />
            </View>

            <TouchableOpacity
              style={styles.chooseAnotherPhotoButton}
              onPress={this.handleChooseAnotherPhoto}
            >
              <Text
                type="title"
                weight="semiBold"
                style={styles.chooseAnotherPhoto}
                message="horses/chooseAnotherPhoto"
              />
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.innerContainer}>
            <Text
              type="title"
              style={styles.text}
              message="horses/choosePhotoText"
              values={{ horseName: renderName(name) }}
            />

            <View style={styles.horsePlaceholderImageContainer}>
              <IconImage
                source="horsePlaceholder"
                style={styles.horseFaceImage}
              />
            </View>

            <View style={styles.buttonsContainer}>
              <Button style={{ width: '100%' }} onPress={this.handleAddPhoto}>
                <Text
                  style={styles.addPhotoButtonText}
                  message="common/addPhoto"
                />
              </Button>

              <TouchableOpacity onPress={this.handleNotNow}>
                <Text
                  type="title"
                  weight="semiBold"
                  style={styles.notNow}
                  message="common/notNow"
                />
              </TouchableOpacity>
            </View>
          </View>
        )}
      </ScrollView>
    )
  }
}

const styles = StyleSheet.create({
  innerContainer: {
    flex: 1,
    padding: 20,
    backgroundColor: 'white',
  },
  text: {
    textAlign: 'center',
    color: '#7E7E7E',
  },
  horsePlaceholderImageContainer: {
    marginTop: 15,
    alignItems: 'center',
  },
  horseFaceImage: {
    width: HORSE_IMAGE_PLACEHOLDER_SIZE,
    height: HORSE_IMAGE_PLACEHOLDER_SIZE,
    resizeMode: 'contain',
  },
  buttonsContainer: {
    marginTop: 15,
  },
  addPhotoButtonText: {
    color: 'white',
  },
  notNow: {
    fontSize: 16,
    textAlign: 'center',
    color: '#7E7E7E',
    marginTop: 10,
  },
  horseImageContainer: {
    backgroundColor: 'white',
    flex: 1,
  },
  horseImage: {
    marginTop: 10,
    width: HORSE_IMAGE_SIZE,
    height: HORSE_IMAGE_SIZE,
    resizeMode: 'contain',
  },
  chooseAnotherPhotoButton: {
    backgroundColor: 'white',
    padding: 15,
    borderTopWidth: 1,
    borderTopColor: '#CCC',
    borderBottomWidth: 1,
    borderBottomColor: '#CCC',
    marginTop: 15,
    marginBottom: 20,
  },
  chooseAnotherPhoto: {
    fontSize: theme.font.sizes.defaultPlus,
    textAlign: 'center',
    color: '#7E7E7E',
  },
})

export default AddHorseImage
