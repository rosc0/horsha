import React, { PureComponent } from 'react'
import {
  Alert,
  Keyboard,
  Platform,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
  SafeAreaView,
} from 'react-native'
import KeyboardSpacer from '@components/KeyboardSpacer'
import Text from '@components/Text'
import { withNavigation } from 'react-navigation'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import prompt from 'react-native-prompt-android'
import GalleryGrid from '@components/Gallery'
import { Thumbnail } from 'react-native-thumbnail-video'
import { theme } from '@styles/theme'

import { ShareDialog } from 'react-native-fbsdk'

import * as newsActions from '@actions/newsfeed'
import * as horsesActions from '@actions/horses'
import * as galleryActions from '@actions/gallery'
import t from '@config/i18n'
import config from 'react-native-config'
import AnimatedTextInput from '@components/AnimatedTextInput'
import HeaderButton from '@components/HeaderButton'
import HeaderTitle from '@components/HeaderTitle'
import AddJournalHorseName from './components/AddJournalHorseName'
import AddJournalShareOptions from './components/AddJournalShareOptions'
import AddJournalPostRide from './components/AddJournalPostRide'
import AddJournalActions from './components/AddJournalActions'
import { IconImage } from '@components/Icons'

import {
  MAX_VIDEO_COUNT,
  MAX_RIDE_COUNT,
  MAX_PHOTO_COUNT,
} from '@constants/contentLimits'
import { client } from '../../apollo/init'
import { POST_DELETE } from '../../apollo/mutations/PostCollection'

const shareScopeOptions = {
  PRIVATE: 'PRIVATE',
  FRIENDS: 'FRIENDS',
  PUBLIC: 'PUBLIC',
}

const INITIAL_STATE = {
  horseStateId: null,
  shareScope: shareScopeOptions.FRIENDS,
  shareFacebook: false,
  text: '',
  videos: [],
  saving: false,
  postId: '',
  selectedHorse: null,
  selectedImages: [],
}

class AddJournalPost extends PureComponent {
  state = {
    ...INITIAL_STATE,
  }

  static navigationOptions = ({ navigation }) => ({
    headerTitle: <HeaderTitle title={'journal/newPostTitle'} />,
    tabBarVisible: false,
    headerLeft: (
      <HeaderButton
        onPress={() => {
          const vefify = navigation.getParam('vefify', () => {})
          vefify()
        }}
      >
        {t('common/cancel')}
      </HeaderButton>
    ),
  })

  componentDidMount() {
    const postId = this.props.navigation.getParam('postId', '')

    this.setState({ postId })

    this.props.navigation.setParams({
      handleCancel: this.clearAndGoBack,
      vefify: this.verifyToClose,
    })
    if (
      this.props.navigation.state.params &&
      this.props.navigation.state.params.ride
    ) {
      this.props.actions.selectRide(this.props.navigation.state.params.ride)
    }
  }

  clearAndGoBack = journalId => {
    this.setState(INITIAL_STATE)
    this.closeKeyboard()
    // this.props.actions.getUpdates()
    this.props.actions.clearSelectedImages()
    this.props.actions.clearSelectedRides()

    if (this.props.navigation.state.params.goBackRoute) {
      return this.props.navigation.popToTop()
    } else {
      this.props.navigation.goBack(null)
      this.props.navigation.navigate('JournalDetail', {
        journalId,
      })
    }
  }

  closeKeyboard = () => Keyboard.dismiss()

  verifyToClose = () => {
    const { postId } = this.state
    Alert.alert(
      'Are you sure you want to delete this post?',
      "This action can't be undone",
      [
        {
          text: 'Cancel',
          onPress: () => console.log('Cancel Pressed'),
          style: 'cancel',
        },
        {
          text: 'Delete',
          onPress: () => {
            // postId
            client.mutate({
              mutation: POST_DELETE,
              variables: { postId },
            })
            this.setState(INITIAL_STATE)
            this.props.actions.clearSelectedImages()
            this.props.actions.clearSelectedRides()
            this.props.navigation.goBack(null)
          },
        },
      ],
      { cancelable: false }
    )
  }

  handleShareFacebook = () => {
    const { shareScope, shareFacebook } = this.state

    if (!shareFacebook && shareScope === shareScopeOptions.FRIENDS) {
      Alert.alert(
        t('journal/needsPublicShareScopeTitle'),
        t('journal/needsPublicShareScope'),
        [
          {
            text: t('common/ok'),
            onPress: () => {
              this.setState({
                shareFacebook: true,
                shareScope: shareScopeOptions.PUBLIC,
              })
            },
          },
          {
            text: t('common/cancel'),
            onPress: () => {},
          },
        ]
      )
    } else {
      this.setState(({ shareFacebook }) => ({
        shareFacebook: !shareFacebook,
      }))
    }
  }

  handleShareScope = shareScope => {
    const { shareFacebook } = this.state
    if (shareScope === shareScopeOptions.FRIENDS && shareFacebook) {
      this.setState({
        shareFacebook: false,
      })

      Alert.alert(null, t('journal/noFacebookShareForTeam'))
    }

    this.setState({
      shareScope,
    })
  }

  handleChangeText = text => this.setState({ text })

  handleChangeHorse = selectedHorse => {
    if (selectedHorse === this.state.selectedHorse) {
      return this.setState({ selectedHorse: null })
    }
    return this.setState({ selectedHorse })
  }

  handleChooseHorse = () =>
    this.props.navigation.navigate('ChooseOptionalHorse', {
      chooseAction: this.handleChangeHorse,
      selectedHorse: this.state.selectedHorse,
      userId: this.props.user.id,
    })

  handleAddPhoto = selectedImage => {
    this.setState(state => {
      const selectedImages = [...state.selectedImages, selectedImage]

      return {
        selectedImages,
      }
    })
  }

  getYoutubeIdFromUrl = url => {
    // eslint-disable-next-line no-useless-escape
    const regExp = /.*(?:youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=)([^#\&\?]*).*/
    const match = url.match(regExp)
    return match && match[1].length === 11 ? match[1] : null
  }

  handleAddVideo = () => {
    const whatsTheVideoUrlText = t('journal/whatsTheVideoUrl')
    const cancelText = t('common/cancel')
    const OKText = t('common/ok')
    const videoUrlText = t('journal/videoUrl')

    if (this.state.videos.length >= MAX_VIDEO_COUNT) {
      Alert.alert(
        null,
        t('journal/maxVideoMessage', { count: MAX_VIDEO_COUNT })
      )
      return
    }

    prompt(
      whatsTheVideoUrlText,
      null,
      [
        { text: cancelText, style: 'cancel' },
        {
          text: OKText,
          onPress: async url => {
            let videoDetails = null
            const youtubeId = this.getYoutubeIdFromUrl(url)

            if (youtubeId) {
              let youtubeApiUrl = `https://www.googleapis.com/youtube/v3/videos?part=snippet&id=${youtubeId}&key=${
                config.YOUTUBE_API_KEY
              }`

              const json = await fetch(youtubeApiUrl)
              const youtubeData = await json.json()

              if (youtubeData.items && youtubeData.items[0]) {
                let content = youtubeData.items[0]

                videoDetails = {
                  url: `https://www.youtube.com/watch?v=${content.id}`,
                  preview_url: content.snippet.thumbnails.default.url,
                  title: content.snippet.localized.title
                    ? content.snippet.localized.title
                    : null,
                  description: content.snippet.localized.description
                    ? content.snippet.localized.description
                    : null,
                }
              }
            }

            if (videoDetails) {
              this.setState(({ videos }) => ({
                videos: [...videos, videoDetails],
              }))
            } else {
              Alert.alert(t('journal/youtubeError'), t('journal/checkTheUrl'))
            }
          },
        },
      ],
      {
        cancelable: true,
        placeholder: videoUrlText,
      }
    )
  }

  handleAddRide = () => {
    const { selectedRides } = this.props.horses

    if (selectedRides.length >= MAX_RIDE_COUNT) {
      Alert.alert(null, t('journal/maxRideMessage', { count: MAX_RIDE_COUNT }))
      return
    }

    this.props.navigation.navigate('HorseRides', {
      horseId: this.props.horses.horse.id,
      shouldSelectRide: true,
    })
  }

  handlePressImage = item => {
    this.setState(state => {
      const selectedImages = state.selectedImages.filter(i => i.id !== item.id)

      return {
        selectedImages,
      }
    })
  }

  handleRemove = (type, row) => () => {
    if (type === 'ride') {
      return this.props.actions.unselectRide(row)
    }

    return this.setState(prevState => ({
      videos: prevState.videos.filter((video, key) => key !== row),
    }))
  }

  renderRemoveButton = (type, row) => (
    <TouchableOpacity
      style={styles.removeButton}
      onPress={this.handleRemove(type, row)}
    >
      <IconImage source="closeShadow" style={styles.removeIcon} />
    </TouchableOpacity>
  )

  handleJournalPost = async () => {
    const {
      selectedHorse,
      shareScope,
      postId,
      text,
      selectedImages,
    } = this.state

    if (!this.state.saving) {
      this.setState({
        saving: true,
      })

      const message = {
        postId,
        horseId: selectedHorse ? selectedHorse.id : null,
        shareScope,
        text,
        media: selectedImages.map(image => image.id),
      }

      const journalPost = await this.props.actions.saveHorseJournal(message)

      if (this.state.shareFacebook && journalPost.id) {
        await this.sharePost(journalPost)
      }

      this.props.actions.clearImages()
      this.clearAndGoBack(journalPost.id)
    }
  }

  sharePost = async journalPost => {
    const shareMessage = t('journal/shareMessage', {
      user: journalPost.author.name,
      horse: journalPost.horse.name,
    })

    const shareLinkContent = {
      contentType: 'link',
      contentUrl: `${config.WEBSITE_BASE_URL}#/entry/${journalPost.id}`,
      contentDescription: `${shareMessage}\n\n${journalPost.text}`,
    }

    const canShare = await ShareDialog.canShow(shareLinkContent)

    if (canShare) {
      await ShareDialog.show(shareLinkContent)
    }
  }

  render() {
    const {
      shareScope,
      shareFacebook,
      text,
      videos,
      selectedHorse,
      selectedImages,
    } = this.state

    const { selectedRides } = this.props.horses
    const { name } = this.props.user

    const whatsUpText = name
      ? t('journal/whatsUpWithUser', { name })
      : t('journal/whatsUp')

    const imagesData =
      selectedImages &&
      selectedImages.map(image => ({
        ...image,
        source: {
          uri: image.uri,
        },
      }))

    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.container}>
          <ScrollView containerStyle={styles.contentContainer}>
            <View>
              <AddJournalShareOptions
                shareScope={shareScope}
                shareFacebook={shareFacebook}
                onPressShareFacebook={this.handleShareFacebook}
                onChangeShareScope={this.handleShareScope}
              />
            </View>

            <View>
              {!selectedHorse ? (
                <AddJournalHorseName
                  name={'Select your horse'}
                  image={null}
                  showLabel={true}
                  onPress={() => {
                    this.handleChooseHorse()
                  }}
                />
              ) : (
                <AddJournalHorseName
                  name={selectedHorse.name}
                  showLabel={false}
                  image={selectedHorse.picture && selectedHorse.picture.url}
                  onPress={this.handleChooseHorse}
                />
              )}

              {!!selectedHorse && (
                <TouchableOpacity
                  onPress={() => this.setState({ selectedHorse: null })}
                >
                  <View style={{ padding: 15 }}>
                    <Text
                      type="title"
                      weight="bold"
                      style={styles.name}
                      text={'Clear selected horse'}
                    />
                  </View>
                </TouchableOpacity>
              )}
            </View>
            <View style={styles.inputContainer}>
              <AnimatedTextInput
                placeholder={whatsUpText}
                onChangeText={this.handleChangeText}
                value={text}
                autoFocus
                multiLine
                marginTop={5}
                defaultMultiLineHeight={80}
                inputStyle={styles.input}
                inputContainerStyle={styles.inputBorder}
              />
            </View>

            <View style={{ flex: 1, marginTop: 15 }}>
              {selectedImages.length > 0 && (
                <GalleryGrid
                  type="delete"
                  setIndex={() => {}}
                  shouldSelectPhotos={false}
                  shouldDeletePhotos={true}
                  selectedImages={[]}
                  numColumns={3}
                  data={imagesData}
                  handlePressImage={this.handlePressImage}
                />
              )}

              {selectedRides.length > 0 &&
                selectedRides.map(ride => (
                  <AddJournalPostRide key={`ride-${ride.id}`} ride={ride}>
                    {this.renderRemoveButton('ride', ride)}
                  </AddJournalPostRide>
                ))}

              {videos.length > 0 &&
                videos.map((video, key) => (
                  <Thumbnail
                    key={`video-${key}`}
                    url={video.url}
                    containerStyle={styles.thumbnailContainer}
                  >
                    {this.renderRemoveButton('thumbnail', key)}
                  </Thumbnail>
                ))}
            </View>
          </ScrollView>

          <AddJournalActions
            onPressAddPhoto={this.handleAddPhoto}
            onPressAddVideo={this.handleAddVideo}
            onPressAddRide={this.handleAddRide}
            onPressPost={this.handleJournalPost}
            actionsDisabled={this.state.text === ''}
            images={this.props.gallery.images}
            actions={this.props.actions}
            postId={this.props.navigation.getParam('postId', '')}
          />

          {Platform.OS === 'ios' && <KeyboardSpacer />}
        </View>
      </SafeAreaView>
    )
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.backgroundColor,
  },
  contentContainer: {
    flex: 1,
    flexDirection: 'column',
  },
  inputContainer: {
    flex: 1,
    paddingBottom: 5,
    marginTop: 10,
  },
  inputBorder: {
    borderTopWidth: 0,
    borderBottomWidth: 0,
  },
  input: {
    textAlignVertical: 'top',
    ...theme.font.sectionTitle,
  },
  thumbnailContainer: {
    marginTop: 35,
  },
  removeButton: {
    position: 'absolute',
    top: 0,
    right: 0,
    paddingTop: 5,
    paddingRight: 10,
    paddingBottom: 20,
    paddingLeft: 20,
  },
  removeIcon: {
    width: 20,
    height: 20,
    resizeMode: 'cover',
  },
})

const mapStateToProps = ({ horses, user, gallery }) => ({
  horses,
  user: user.user,
  gallery,
})

const mapDispatchToProps = dispatch => ({
  actions: bindActionCreators(
    {
      ...newsActions,
      ...horsesActions,
      ...galleryActions,
    },
    dispatch
  ),
})

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(withNavigation(AddJournalPost))
