import React, { Component } from 'react'
import { Animated, StyleSheet, TouchableOpacity, View } from 'react-native'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import TimerMixin from 'react-timer-mixin'

import { Gallery } from 'rn-slider-gallery'
import ActionSheet from 'rn-action-sheet'

import * as trailsActions from '@actions/trails'
import t from '@config/i18n'

import Loading from '@components/Loading'
import GalleryGrid from '@components/Gallery'
import HeaderTitle from '@components/HeaderTitle'
import NavigationBarButton from '@components/navigationBar/NavigationBarButton'
import AddButton from '@components/AddButton'
import BackButton from '@components/BackButton'
import Icon from '@components/Icon'
import Text from '@components/Text'
import UploadProgress from '@components/UploadProgress'
import { theme } from '@styles/theme'

import Upload from '@api/upload'
import { Query } from 'react-apollo'
import { GET_TRAIL_PICTURES } from '../../apollo/queries/TrailCollection'

const UploadAPI = new Upload()

const TOPBAR_HEIGHT = 60

class TrailAlbum extends Component {
  constructor() {
    super()

    const scrollAnim = new Animated.Value(0)
    const offsetAnim = new Animated.Value(0)

    this.state = {
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
        TOPBAR_HEIGHT
      ),
      shouldSelectPhotos: false,
      shouldDeletePhotos: false,
      selectedImages: [],
      progress: 0,
      showUpload: false,
      imageIndex: 0,
      isImageViewVisible: false,
      onlyMine: false,
    }
  }

  clampedScrollValue = 0
  offsetValue = 0
  scrollValue = 0
  scrollEndTimer = 0

  static navigationOptions = ({ navigation }) => ({
    tabBarVisible: false,
    headerTitle: <HeaderTitle title={'trails/trailAlbum'} />,
    headerLeft: (
      <BackButton onPress={navigation.state.params.handleBackButton} />
    ),
    headerRight: navigation.state.params.handleDonePicturesAction ? (
      <View style={styles.navigationBarContainer}>
        <NavigationBarButton
          icon="settings_tick"
          onPress={navigation.state.params.handleDonePicturesAction}
        />

        <AddButton onPress={navigation.state.params.handleAddPicture} />
      </View>
    ) : (
      <AddButton onPress={navigation.state.params.handleAddPicture} />
    ),
    gesturesEnabled: navigation.state.params.shouldAllowBackGesture,
  })

  UNSAFE_componentWillReceiveProps(nextProps) {
    if (
      this.props.navigation.state.routeName !== 'TrailAlbum' ||
      !nextProps.image ||
      (nextProps.image.uri === this.props.image.uri &&
        nextProps.image.cropped === this.props.image.cropped) ||
      !nextProps.image.cropped ||
      nextProps.trails.pictures.upload.isUploading
    ) {
      return
    }

    const { trailId } = this.props.navigation.state.params

    if (nextProps.image && trailId) {
      this.setState({ showUpload: true })

      UploadAPI.uploadImage(nextProps.image, progress => {
        this.setState({ progress })
      }).then(imageUpload => {
        if (imageUpload && imageUpload.key) {
          this.props.actions.addTrailImage(trailId, nextProps.image)
          this.props.actions.getTrailPictures(trailId, 40, 'album')
        }
        this.setState({ showUpload: false })
      })
    }
  }

  componentDidMount() {
    const shouldSelectPhotos = !!this.props.navigation.state.params.selectPhotos

    this.props.navigation.setParams({
      handleAddPicture: this.handleAddPicture,
      handleBackButton: this.handleBackButton,
      handleDonePicturesAction:
        shouldSelectPhotos && this.handleDonePicturesAction,
      shouldAllowBackGesture: true,
    })

    this.props.actions.getTrailPictures(
      this.props.navigation.state.params.trailId,
      40,
      'album'
    )

    this.setState({
      shouldSelectPhotos,
      allPhotosText: t('common/allPhotos'),
      onlyMineText: t('common/onlyMine'),
      optionLabel: t('common/allPhotos'),
    })

    this.state.scrollAnim.addListener(({ value }) => {
      // This is the same calculations that diffClamp does,
      // remove when https://github.com/facebook/react-native/pull/12620 is merged
      const diff = value - this.scrollValue
      this.scrollValue = value
      this.clampedScrollValue = Math.min(
        Math.max(this.clampedScrollValue + diff, 0),
        TOPBAR_HEIGHT
      )
    })

    this.state.offsetAnim.addListener(({ value }) => (this.offsetValue = value))
  }

  componentWillUnmount() {
    this.state.scrollAnim.removeAllListeners()
    this.state.offsetAnim.removeAllListeners()
  }

  onScrollEndDrag = () =>
    (this.scrollEndTimer = TimerMixin.setTimeout(this.onMomentumScrollEnd, 250))

  onMomentumScrollBegin = () => clearTimeout(this.scrollEndTimer)

  onMomentumScrollEnd = () => {
    const toValue =
      this.scrollValue > TOPBAR_HEIGHT &&
      this.clampedScrollValue > TOPBAR_HEIGHT / 2
        ? this.offsetValue + TOPBAR_HEIGHT
        : this.offsetValue - TOPBAR_HEIGHT

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

  handleBackButton = () => this.props.navigation.goBack(null)

  handleOpenOptions = () => {
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
            return this.setState({
              optionLabel: allPhotosText,
              onlyMine: false,
            })
          }
          case 1: {
            return this.setState({ optionLabel: onlyMineText, onlyMine: true })
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
      toValue: isGalleryFullscreen ? TOPBAR_HEIGHT : 0,
      duration: 350,
      useNativeDriver: true,
    }).start()
  }

  handlePressImage = ({ item }) => {
    const { shouldDeletePhotos, shouldSelectPhotos } = this.state

    if (shouldDeletePhotos) {
      return this.props.actions.deleteTrailPicture(item.id)
    }

    if (shouldSelectPhotos) {
      return this.props.actions.toggleSelectPicture(item)
    }
  }

  handleLongPressImage = () => {
    this.props.navigation.setParams({
      handleDonePicturesAction: this.handleDonePicturesAction,
    })

    this.setState({
      shouldDeletePhotos: true,
    })
  }

  handleDonePicturesAction = () => {
    const { shouldDeletePhotos, shouldSelectPhotos } = this.state

    if (shouldDeletePhotos) {
      this.setState({
        shouldDeletePhotos: false,
      })

      return this.props.navigation.setParams({
        handleDonePicturesAction:
          shouldSelectPhotos && this.handleDonePicturesAction,
      })
    }

    if (shouldSelectPhotos) {
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

  render() {
    const {
      progress,
      showUpload,
      isImageViewVisible,
      imageIndex,
      shouldDeletePhotos,
      shouldSelectPhotos,
      onlyMine,
    } = this.state

    const trailId = this.props.navigation.getParam('trailId', 'x')
    return (
      <View style={styles.container}>
        {showUpload && (
          <UploadProgress
            progress={progress}
            text={t('upload/uploadingImage')}
          />
        )}
        <Animated.View
          style={[
            styles.topbarContainer,
            {
              transform: [
                {
                  translateY: this.state.clampedScroll.interpolate({
                    inputRange: [0, TOPBAR_HEIGHT],
                    outputRange: [0, -TOPBAR_HEIGHT],
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

        <Query query={GET_TRAIL_PICTURES} variables={{ trailId }}>
          {({ loading, error, data }) => {
            if (loading) {
              return <Loading fullScreen type="spinner" />
            }
            if (error) {
              console.log('errror', error)
              return null
            }

            const customFilter = img =>
              img.author.id === this.props.user.user.id

            const images = data.trailPictures.collection
              .filter(onlyMine ? customFilter : img => img)
              .map(picture => ({
                id: picture.id,
                url: `${picture.image.url}`,
                source: {
                  uri: `${picture.image.url}`,
                },
                allowDelete: picture.canRemove,
                // passing to easy recognition of image sizes on android
                width: picture.image.width > 320 ? picture.image.width : 400,
                height: picture.image.height > 320 ? picture.image.height : 400,
              }))

            return (
              <>
                <GalleryGrid
                  contentContainerStyle={{ paddingTop: 60 }}
                  data={images}
                  setIndex={this.setIndex}
                  handlePressImage={this.handlePressImage}
                  shouldSelectPhotos={shouldSelectPhotos}
                  shouldDeletePhotos={shouldDeletePhotos}
                  selectedImages={data.trailPictures.collection.map(
                    image => image.id
                  )}
                  ListEmptyComponent={
                    <View style={styles.centeredContainer}>
                      <Text
                        type="title"
                        style={styles.noPicturesText}
                        message="trails/noPictures"
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
                        message="common/close"
                        style={styles.textWithShadow}
                      />
                    }
                  />
                )}
              </>
            )
          }}
        </Query>
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
  centeredContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  noPicturesText: {
    fontSize: 18,
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
  textWithShadow: {
    color: 'white',
    textShadowColor: 'rgba(0, 0, 0, 0.9)',
    textShadowOffset: { width: -1, height: 1 },
    textShadowRadius: 10,
    paddingHorizontal: 10,
  },
})

const mapStateToProps = ({ trails, gallery, user }) => ({
  trails,
  user,
  image: gallery.images[0] || {},
})

const mapDispatchToProps = dispatch => ({
  actions: bindActionCreators(
    {
      ...trailsActions,
    },
    dispatch
  ),
})

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(TrailAlbum)
