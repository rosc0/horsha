import React, { Component } from 'react'
import {
  Alert,
  Dimensions,
  InteractionManager,
  Platform,
  StyleSheet,
  TouchableOpacity,
  View,
  ImageBackground,
  Linking,
} from 'react-native'
import Permissions from 'react-native-permissions'
import { RNCamera } from 'react-native-camera'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import { NavigationActions } from 'react-navigation'
import ImagePicker from 'react-native-image-crop-picker'

import HeaderButton from '@components/HeaderButton'
import t from '@config/i18n'
import * as galleryActions from '@actions/gallery'
import Loading from '@components/Loading'
import HeaderTitle from '@components/HeaderTitle'
import { IconImage } from '@components/Icons'

const { width } = Dimensions.get('window')

class TakePicture extends Component {
  static navigationOptions = ({ navigation }) => ({
    headerTitle: <HeaderTitle title={'gallery/takePictureTitle'} />,
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
    isCameraReady: false,
    type: 'back',
    showingAlert: false,
    grantedPermissions: null,
    data: null,
    disable: false,
  }

  async componentDidMount() {
    await Permissions.check('camera').then(response => {
      if (response !== 'authorized') {
        this.checkGrantedPermissions()
      } else {
        this.setState({
          grantedPermissions: response === 'authorized' ? true : false,
        })
      }
    })

    this.props.navigation.setParams({
      savePicture: this.savePicture,
    })

    InteractionManager.runAfterInteractions(() =>
      this.setState({ isCameraReady: true })
    )
  }

  checkGrantedPermissions = () => {
    Permissions.request('camera').then(response => {
      // Returns once the user has chosen to 'allow' or to 'not allow' access
      // Response is one of: 'authorized', 'denied', 'restricted', or 'undetermined'
      if (response !== 'authorized') {
        // show alert
        this.handleRequestAlert(['camera'])
      }
      return this.setState({
        grantedPermissions: response === 'authorized' ? true : false,
      })
    })
  }

  handleRequestAlert = () => {
    const cameraPermissionsTitle = t('gallery/cameraPermissionsTitle')
    const cameraPermissionsMessage = t('gallery/cameraPermissionsMessage')
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

  toggleFacing = () => {
    this.setState({
      type: this.state.type === 'back' ? 'front' : 'back',
    })
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
    const callback =
      this.props.navigation.state.params &&
      this.props.navigation.state.params.callback

    if (!callback) {
      ImagePicker.clean()
        .then(() => {
          console.log('removed all tmp images from tmp directory')
        })
        .catch(e => {
          alert(e)
        })
    }

    if (key) {
      return this.props.navigation.dispatch(NavigationActions.navigate({ key }))
    }

    return this.props.navigation.goBack(null)
  }

  handleTakePicture = async () => {
    this.setState({ disable: true })
    try {
      const configs = {
        fixOrientation: true,
        forceUpOrientation: true,
        exif: true,
        quality: 0.5,
        skipProcessing: true,
      }
      const data = await this.camera.takePictureAsync(configs)

      const shouldCropPicture =
        this.props.navigation.state.params &&
        this.props.navigation.state.params.shouldCropPicture

      if (shouldCropPicture) {
        return this.goToCropPicture(data.uri, shouldCropPicture)
      }

      return this.setState({ data: data.uri, disable: false })
    } catch (err) {
      const errorText = t('common/error')
      const takePictureError = t('gallery/takePictureError')
      this.setState({ disable: false })
      Alert.alert(errorText, takePictureError)
    }
  }

  savePicture = async () => {
    const { data } = this.state
    if (this.state.data === null) {
      // TODO: improve this
      alert(t('gallery/alert'))
      return
    }

    const callbackAction = this.props.navigation.getParam('callbackAction')
    await this.props.actions.addImages([{ uri: data, cropped: false }])

    if (callbackAction) {
      callbackAction()
    }

    return this.goBack()
  }

  render() {
    const {
      isCameraReady,
      grantedPermissions,
      showingAlert,
      type,
      data,
    } = this.state
    if (!isCameraReady || grantedPermissions === null || showingAlert) {
      return <Loading type="spinner" />
    }

    if (!grantedPermissions) {
      return (
        <View style={styles.storageAlertContainer}>
          {/* <Text message="permissions/storageMessage" />
          {Platform.OS !== 'android' && <Button
            onPress={() => Linking.openURL('app-settings:')}
            title="Grant access"
            color="#841584"
            accessibilityLabel="Learn more about this purple button"
          />} */}
        </View>
      )
    }

    if (data !== null) {
      return (
        <ImageBackground
          source={{ uri: data }}
          style={styles.container}
          resizeMode="cover"
        >
          <View style={styles.captureButtonContainer}>
            <View style={styles.actionsContainer}>
              <TouchableOpacity
                onPress={() => this.goToCropPicture(data, true)}
                style={styles.selfieButton}
              >
                <IconImage source="cropRotateIcon" style={styles.icon} svg />
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => this.setState({ data: null })}
                style={styles.trashButton}
              >
                <IconImage
                  source="delete"
                  fill="#FFF"
                  style={styles.icon}
                  svg
                />
              </TouchableOpacity>
            </View>
          </View>
        </ImageBackground>
      )
    }

    return (
      <View style={styles.container}>
        <RNCamera
          ref={ref => (this.camera = ref)}
          style={styles.preview}
          type={type}
          captureAudio={false}
        >
          <View style={styles.captureButtonContainer}>
            <View style={styles.captureButtonOutside}>
              <TouchableOpacity
                disable={this.state.disable}
                onPress={this.handleTakePicture}
                style={styles.captureButton}
              />
            </View>
            <View style={styles.selfieContainer}>
              <TouchableOpacity
                onPress={this.toggleFacing}
                style={styles.selfieButton}
              >
                <IconImage source="selfieCamera" style={styles.icon} />
              </TouchableOpacity>
            </View>
          </View>
        </RNCamera>
      </View>
    )
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column',
    backgroundColor: 'black',
  },
  preview: {
    flex: 1,
  },
  captureButtonContainer: {
    width,
    bottom: 20,
    zIndex: 2,
    position: 'absolute',
    alignItems: 'center',
    ...Platform.select({
      android: {
        bottom: 40,
      },
    }),
  },
  selfieContainer: {
    width: width / 3,
    right: 20,
    bottom: 10,
    position: 'absolute',
    zIndex: 3,
    alignItems: 'flex-end',
  },
  actionsContainer: {
    flex: 0,
    height: 65,
    padding: 0,
    width: width,
    height: 65,
    zIndex: 3,
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  selfieButton: {
    flex: 0,
    padding: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 50,
    alignItems: 'center',
  },
  trashButton: {
    flex: 0,
    padding: 10,
    backgroundColor: '#C22E31',
    borderRadius: 50,
    alignItems: 'center',
  },
  icon: {
    width: 30,
    height: 30,
    marginRight: 2,
  },
  captureButton: {
    flex: 0,
    width: 55,
    height: 55,
    backgroundColor: '#57bdac',
    borderRadius: 50,
    borderWidth: 3,
    borderColor: 'white',
    alignItems: 'center',
  },
  captureButtonOutside: {
    flex: 0,
    width: 65,
    height: 65,
    padding: 0,
    backgroundColor: '#57bdac',
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
  },
  doneButton: {
    marginRight: 10,
  },
})

const mapDispatchToProps = dispatch => ({
  actions: bindActionCreators(galleryActions, dispatch),
})

export default connect(
  null,
  mapDispatchToProps
)(TakePicture)
