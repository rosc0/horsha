import React, { PureComponent } from 'react'
import {
  InteractionManager,
  Platform,
  StyleSheet,
  View,
  Alert,
  Linking,
} from 'react-native'
import Permissions from 'react-native-permissions'
import CameraRollPicker from 'react-native-camera-roll-picker'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import { NavigationActions } from 'react-navigation'
import ImagePicker from 'react-native-image-crop-picker'

import HeaderButton from '@components/HeaderButton'
import t from '@config/i18n'
import * as galleryActions from '@actions/gallery'
import Loading from '@components/Loading'
import HeaderTitle from '@components/HeaderTitle'

class Gallery extends PureComponent {
  static navigationOptions = ({ navigation }) => ({
    headerTitle: <HeaderTitle title={'gallery/galleryTitle'} />,
    headerRight: (
      <HeaderButton
        onPress={navigation.state.params && navigation.state.params.savePicture}
        style={styles.doneButton}
      >
        {t('common/done')}
      </HeaderButton>
    ),
  })

  state = {
    grantedPermissions: null,
    isGalleryReady: false,
    images: null,
  }

  static defaultProps = {
    maximum: 5,
  }

  async componentDidMount() {
    await Permissions.check('photo').then(response => {
      if (response !== 'authorized') {
        this.requestStoragePermission()
      } else {
        this.setState({
          grantedPermissions: response === 'authorized' ? true : false,
        })
      }
    })

    this.props.navigation.setParams({
      savePicture: this.savePicture,
    })

    InteractionManager.runAfterInteractions(() => {
      this.setState({ isGalleryReady: true })
    })

    ImagePicker.openPicker({
      multiple: true,
    }).then(images => {
      console.log(images)
      this.getSelectedImage(images)
    })
  }

  requestStoragePermission = () => {
    Permissions.request('photo').then(response => {
      // Returns once the user has chosen to 'allow' or to 'not allow' access
      // Response is one of: 'authorized', 'denied', 'restricted', or 'undetermined'
      if (response !== 'authorized') {
        // show alert
        this.handleRequestAlert(['photo'])
      }
      return this.setState({
        grantedPermissions: response === 'authorized' ? true : false,
      })
    })
  }

  handleRequestAlert = () => {
    const cameraPermissionsTitle = t('gallery/galleryPermissionsTitle')
    const cameraPermissionsMessage = t('gallery/galleryPermissionsMessage')
    const openSettings = t('gallery/openSettings')
    const yesText = t('common/yes')
    const noText = t('common/no')

    Alert.alert(
      cameraPermissionsTitle,
      cameraPermissionsMessage,
      [
        Platform.OS !== 'android'
          ? {
              text: yesText,
              onPress: () => Linking.openURL('app-settings:'),
            }
          : {
              text: openSettings,
              onPress: Permissions.openSettings,
            },
        { text: noText, onPress: () => {}, style: 'cancel' },
      ],
      { cancelable: true }
    )
  }

  goToCropPicture = data => {
    ImagePicker.openCropper({
      path: data,
      width: 600,
      height: 600,
      cropperToolbarColor: '#E8572E',
    }).then(async crop => {
      this.setState({ data: crop.path, cropped: true })
    })
  }

  goBack = () => {
    const key =
      this.props.navigation.state.params &&
      this.props.navigation.state.params.key

    if (key) {
      return this.props.navigation.dispatch(NavigationActions.navigate({ key }))
    }

    return this.props.navigation.goBack(null)
  }

  getSelectedImage = galleryImages => {
    if (galleryImages.length === 0) return

    const shouldCropPicture =
      this.props.navigation.state.params &&
      this.props.navigation.state.params.shouldCropPicture

    const images = galleryImages.map(image => ({
      ...image,
      cropped: !shouldCropPicture,
    }))

    this.setState({ images })
    if (images.length === this.props.maximum && shouldCropPicture) {
      return this.goToCropPicture(images[0].uri, true)
    }

    // return this.goBack()
    this.savePicture()
  }

  savePicture = async () => {
    const { images } = this.state
    if (this.state.images === null) {
      // TODO: improve this, and handle gallery picker
      alert(t('gallery/alert'))
      return
    }

    const callbackAction = this.props.navigation.getParam('callbackAction')
    await this.props.actions.addImages(images)

    if (callbackAction) {
      callbackAction()
    }
    return this.goBack()
  }

  render() {
    const { isGalleryReady, grantedPermissions } = this.state

    if (!isGalleryReady || grantedPermissions === null)
      return <Loading type="spinner" />

    const loadingImages = t('gallery/loadingImages')
    if (!grantedPermissions) {
      return <View />
    }

    return <View />
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5FCFF',
  },
  storageAlertContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  loading: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  doneButton: {
    marginRight: 10,
  },
})

const mapStateToProps = ({ gallery }) => ({ images: gallery.images })

const mapDispatchToProps = dispatch => ({
  actions: bindActionCreators(galleryActions, dispatch),
})

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Gallery)
