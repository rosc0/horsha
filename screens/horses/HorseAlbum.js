import React, { Component } from 'react'
import {
  Alert,
  Animated,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import TimerMixin from 'react-timer-mixin'

import { Gallery } from 'rn-slider-gallery'
import ActionSheet from 'rn-action-sheet'

import t from '@config/i18n'
import * as horsesActions from '@actions/horses'
import { theme } from '@styles/theme'
import { getIndexById } from '@application/utils'

import Loading from '@components/Loading'
import GalleryGrid from '@components/Gallery'

import NavigationBarButton from '@components/navigationBar/NavigationBarButton'
import HeaderButton from '@components/HeaderButton'
import AddButton from '@components/AddButton'
import BackButton from '@components/BackButton'
import HorseNavigationBarTitle from './components/HorseNavigationBarTitle'
import EmptyHorseAlbum from './components/EmptyHorseAlbum'
import Icon from '@components/Icon'
import Text from '@components/Text'
import UploadProgress from '@components/UploadProgress'
import ArchivedUserBar from './components/ArchivedUserBar'
import { MAX_PHOTO_COUNT } from '@constants/contentLimits'

import Upload from '@api/upload'

const UploadAPI = new Upload()

const renderHeaderRight = navigation => {
  if (navigation.state.params.showAddButton) {
    if (navigation.state.params.handleDeletePictures) {
      return (
        <HeaderButton
          onPress={navigation.state.params.handleDeletePictures}
          style={styles.doneButton}
        >
          {t('horses/horseAlbumDeleteButton')}
        </HeaderButton>
      )
    }

    return (
      <View style={styles.navigationBarContainer}>
        <AddButton
          imageStyle={styles.addButton}
          onPress={navigation.state.params.handleAddPicture}
        />

        {navigation.state.params.handleDonePicturesAction ? (
          <NavigationBarButton
            icon="settings_tick"
            onPress={navigation.state.params.handleDonePicturesAction}
          />
        ) : (
          <NavigationBarButton
            icon="delete"
            onPress={navigation.state.params.handleToggleDelete}
            style={styles.deleteButtonIcon}
          />
        )}
      </View>
    )
  } else {
    return null
  }
}

class HorseAlbum extends Component {
  constructor(props) {
    super(props)

    const { horses } = props
    const scrollAnim = new Animated.Value(0)
    const offsetAnim = new Animated.Value(0)

    const isArchived =
      horses && horses[0] && horses[0].relation_type === 'archived'

    const topBarHeight = isArchived ? 100 : 60

    this.state = {
      isGalleryFullscreen: false,
      isGoingUp: false,
      scrollAnim,
      offsetAnim,
      clampedScroll: Animated.diffClamp(
        Animated.add(
          scrollAnim.interpolate({
            inputRange: [0, 1],
            outputRange: [0, 1],
            extrapolateLeft: 'clamp',
          }),
          offsetAnim
        ),
        0,
        topBarHeight
      ),
      shouldSelectPhotos: false,
      shouldDeletePhotos: false,
      selectedImages: [],
      topBarHeight,
      isArchived,
      showUpload: false,
      progress: 0,
      lastImage: {},
      imageIndex: 0,
      isImageViewVisible: false,
      allPhotosText: t('common/allPhotos'),
      onlyMineText: t('common/onlyMine'),
      optionLabel: t('common/allPhotos'),
    }
  }

  clampedScrollValue = 0
  offsetValue = 0
  scrollValue = 0
  scrollEndTimer = 0

  static navigationOptions = ({ navigation }) => ({
    headerTitle: (
      <HorseNavigationBarTitle
        title={t('horses/album')}
        navigation={navigation}
      />
    ),
    headerLeft: (
      <BackButton onPress={navigation.state.params.handleBackButton} />
    ),
    headerRight: renderHeaderRight(navigation),
    gesturesEnabled: navigation.state.params.shouldAllowBackGesture,
  })

  static getDerivedStateFromProps(props, state) {
    const shouldSelectPhotos = !!props.navigation.state.params.selectPhotos

    if (shouldSelectPhotos !== state.shouldSelectPhotos) {
      return {
        shouldSelectPhotos,
      }
    }

    // Return null to indicate no change to state.
    return null
  }

  componentDidMount() {
    const { actions, horses, user } = this.props

    this.state.scrollAnim.addListener(({ value }) => {
      // This is the same calculations that diffClamp does,
      // remove when https://github.com/facebook/react-native/pull/12620 is merged
      const diff = value - this.scrollValue
      this.scrollValue = value
      this.clampedScrollValue = Math.min(
        Math.max(this.clampedScrollValue + diff, 0),
        this.state.topBarHeight
      )
    })

    this.state.offsetAnim.addListener(({ value }) => (this.offsetValue = value))

    const horseId = this.props.navigation.state.params.horseId

    if (!horses.horseUser) {
      actions.getHorseUser(horseId, user.id)
    }

    this.props.navigation.setParams({
      handleAddPicture: this.handleAddPicture,
      handleBackButton: this.handleBackButton,
      handleDonePicturesAction:
        this.state.shouldSelectPhotos && this.handleDonePicturesAction,
      handleToggleDelete: this.handleToggleDelete,
      shouldAllowBackGesture: true,
    })

    this.props.actions.getHorseAlbum(horseId)
  }

  async componentDidUpdate(prevProps) {
    if (this.props.horseUser !== prevProps.horseUser) {
      const relationType = this.props.horseUser.relation_type
      this.props.navigation.setParams({
        showAddButton: relationType === 'owner' || relationType === 'sharer',
      })
    }

    if (
      this.props.album.upload.isUploading ||
      prevProps.image === this.props.image
    ) {
      return
    }
    if (!this.props.image || !this.props.image.uri) {
      return
    }

    if (this.props.image) {
      const { horseId } = this.props.navigation.state.params
      this.setState({ showUpload: true, lastImage: this.props.image })
      const imageUpload = await UploadAPI.uploadImage(
        this.props.image,
        progress => {
          this.setState({ progress })
        }
      )

      if (imageUpload && imageUpload.key) {
        await this.props.actions.addHorseImage(horseId, imageUpload.key)
        this.setState({ showUpload: false })
      }
    }
  }

  // cancelUpload = () => {
  //   UploadAPI.cancelUpload()
  //
  //   this.setState({
  //     progress: 0,
  //     showUpload: false,
  //   })
  // }

  onScrollEndDrag = () =>
    (this.scrollEndTimer = TimerMixin.setTimeout(this.onMomentumScrollEnd, 250))

  onMomentumScrollBegin = () => clearTimeout(this.scrollEndTimer)

  onMomentumScrollEnd = () => {
    const { topBarHeight } = this.state
    const toValue =
      this.scrollValue > topBarHeight &&
      this.clampedScrollValue > topBarHeight / 2
        ? this.offsetValue + topBarHeight
        : this.offsetValue - topBarHeight

    Animated.timing(this.state.offsetAnim, {
      toValue,
      duration: 350,
      useNativeDriver: true,
    }).start()
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

  handleBackButton = () => {
    if (this.props.navigation.state.params.shouldBeBack) {
      return this.props.navigation.goBack(null)
    }
    return this.props.navigation.popToTop()
  }

  handleOpenOptions = () => {
    const { horseId } = this.props.navigation.state.params
    const { allPhotosText, onlyMineText } = this.state

    const showAlbum = t('common/showAlbum')
    const cancelText = t('common/cancel')

    return ActionSheet.show(
      {
        title: showAlbum,
        options: [allPhotosText, onlyMineText, cancelText],
        cancelButtonIndex: 2,
        tintColor: theme.secondaryColor,
      },
      async index => {
        switch (index) {
          case 0: {
            this.setState({ optionLabel: allPhotosText })
            return this.props.actions.getHorseAlbum(horseId, 'all_photos')
          }
          case 1: {
            this.setState({ optionLabel: onlyMineText })
            return this.props.actions.getHorseAlbum(horseId, 'only_mine')
          }
        }
      }
    )
  }

  handleChangeFullscreenState = isGalleryFullscreen => {
    this.props.navigation.setParams({
      shouldAllowBackGesture: !isGalleryFullscreen,
    })

    Animated.timing(this.state.offsetAnim, {
      toValue: isGalleryFullscreen ? this.state.topBarHeight : 0,
      duration: 350,
      useNativeDriver: true,
    }).start()
  }

  handlePressImage = async item => {
    const { shouldDeletePhotos, shouldSelectPhotos } = this.state
    const notSelected =
      getIndexById(this.props.album.selectedImages, item.id) === -1

    if (
      notSelected &&
      this.props.album.selectedImages.length >= MAX_PHOTO_COUNT
    ) {
      Alert.alert(
        null,
        t('journal/maxPhotoMessage', { count: MAX_PHOTO_COUNT })
      )
      return
    }
    const selectedImage = {
      key: item.id,
      image: {
        uri: item.source.uri,
      },
      ...item,
    }
    if (shouldDeletePhotos || shouldSelectPhotos) {
      return this.props.actions.toggleSelectImage(selectedImage)
    }
  }

  handleToggleDelete = () => {
    this.props.navigation.setParams({
      handleDeletePictures: this.handleDeletePictures,
    })

    this.setState({
      shouldDeletePhotos: true,
    })
  }

  handleDeletePictures = async () => {
    if (this.props.album.selectedImages.length === 0) {
      this.props.navigation.setParams({
        handleDeletePictures: null,
      })

      return this.setState({
        shouldDeletePhotos: false,
      })
    }

    const deleteTitleText =
      this.props.album.selectedImages.length === 1
        ? t('horses/horseAlbumDeleteSingularTitle')
        : t('horses/horseAlbumDeletePluralTitle')
    const deletePictureText =
      this.props.album.selectedImages.length === 1
        ? t('horses/horseAlbumDeletePicture')
        : t('horses/horseAlbumDeletePictures')
    const cancelText = t('common/cancel')

    ActionSheet.show(
      {
        title: deleteTitleText,
        options: [deletePictureText, cancelText],
        cancelButtonIndex: 1,
        destructiveButtonIndex: 0,
        tintColor: theme.secondaryColor,
      },
      async index => {
        switch (index) {
          case 0: {
            await this.props.actions.deleteHorseImages(
              this.props.album.selectedImages.map(({ id }) => id)
            )

            this.props.navigation.setParams({
              handleDeletePictures: null,
            })

            return this.setState({
              shouldDeletePhotos: false,
            })
          }
          case 1: {
            return
          }
        }
      }
    )
  }

  handleDonePicturesAction = () => {
    if (this.state.shouldSelectPhotos) {
      return this.props.navigation.goBack(null)
    }
  }

  setIndex = imageIndex => {
    if (
      imageIndex === this.state.imageIndex &&
      !!this.state.isImageViewVisible
    ) {
      return
    }
    return this.setState({ imageIndex, isImageViewVisible: true })
  }

  componentWillUnmount() {
    this.state.scrollAnim.removeAllListeners()
    this.state.offsetAnim.removeAllListeners()
  }

  render() {
    const {
      shouldDeletePhotos,
      topBarHeight,
      isArchived,
      progress,
      showUpload,
      imageIndex,
      isImageViewVisible,
      shouldSelectPhotos,
    } = this.state

    const { album, horses } = this.props
    if (album.fetching) {
      return <Loading type="spinner" />
    }

    const images = album.pictures.map(image => ({
      id: image.key,
      url: `${image.image}?t=400x400,fill`,
      source: {
        uri: `${image.image}?t=400x400,fill`,
      },
      allowSelect: shouldDeletePhotos ? image.canDeleteImage : true,
      // passing to easy recognition of image sizes on android
      width: image.width > 320 ? image.width : 400,
      height: image.height > 320 ? image.height : 400,
    }))

    return (
      <View style={styles.container}>
        {showUpload && (
          <UploadProgress
            progress={progress}
            text={t('upload/uploadingImage')}
            //onCancel={this.cancelUpload}
          />
        )}
        {!!isArchived && (
          <ArchivedUserBar
            navigation={this.props.navigation}
            horseUser={horses[0]}
          />
        )}
        <View style={styles.container}>
          <Animated.View
            style={[
              styles.topbarContainer,
              {
                transform: [
                  {
                    translateY: this.state.clampedScroll.interpolate({
                      inputRange: [0, topBarHeight],
                      outputRange: [0, -topBarHeight],
                      extrapolate: 'clamp',
                    }),
                  },
                ],
              },
            ]}
          >
            <TouchableOpacity
              onPress={this.handleOpenOptions}
              style={styles.topbarInnerContainer}
            >
              <Text
                type="title"
                weight="bold"
                style={styles.showText}
                message="common/show"
              />

              <View style={styles.showOptionContainer}>
                <Text
                  type="title"
                  weight="bold"
                  style={styles.showOptionText}
                  text={this.state.optionLabel}
                />
                <Icon name="arrow_right" style={styles.arrowRight} />
              </View>
            </TouchableOpacity>
          </Animated.View>

          <GalleryGrid
            contentContainerStyle={{ paddingTop: topBarHeight }}
            data={images}
            setIndex={this.setIndex}
            handlePressImage={this.handlePressImage}
            shouldSelectPhotos={shouldSelectPhotos}
            shouldDeletePhotos={shouldDeletePhotos}
            selectedImages={album.selectedImages.map(image => image.id)}
            ListEmptyComponent={<EmptyHorseAlbum isArchived={isArchived} />}
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
      </View>
    )
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  navigationBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  deleteButtonIcon: {
    fontSize: 30,
  },
  doneButton: {
    marginRight: 10,
  },
  topbarContainer: {
    width: '100%',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1,
  },
  topbarInnerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: 'white',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#D8D8DB',
  },
  showText: {
    fontSize: theme.font.sizes.defaultPlus,
    color: '#828282',
  },
  showOptionContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  showOptionText: {
    fontSize: theme.font.sizes.defaultPlus,
    color: '#979B9E',
  },
  arrowRight: {
    fontSize: 16,
    color: '#CCC',
  },
  addButton: {
    marginRight: 20,
  },
})

const mapStateToProps = ({ horses, gallery, user }) => ({
  user: user.user,
  album: horses.album,
  horseUser: horses.horseUser,
  horses: horses.horses,
  image: gallery.images[0] || {},
})

const mapDispatchToProps = dispatch => ({
  actions: bindActionCreators(horsesActions, dispatch),
})

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(HorseAlbum)
