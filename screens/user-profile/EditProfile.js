import React, { PureComponent } from 'react'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import {
  Image,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native'
import moment from 'moment'
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'
import ActionSheet from 'rn-action-sheet'

import CountryPicker from 'react-native-country-picker-modal'

import t from '@config/i18n'
import Text from '@components/Text'
import UserImage from '@components/UserImage'
import DateField from '@components/DateField'
import Icon from '@components/Icon'
import Loading from '@components/Loading'
import UploadProgress from '@components/UploadProgress'
import HeaderTitle from '@components/HeaderTitle'
import AnimatedTextInput from '@components/AnimatedTextInput'
import { IconImage } from '@components/Icons'

import { theme } from '@styles/theme'

import * as userActions from '@actions/user'
import * as galleryActions from '@actions/gallery'
import { outputCountry } from '@application/utils'

import Upload from '@api/upload'

const UploadAPI = new Upload()

class EditProfile extends PureComponent {
  static navigationOptions = ({ navigation }) => ({
    headerTitle: <HeaderTitle title={'editProfile/editProfileTitle'} />,
    tabBarVisible: false,
    headerRight: (
      <TouchableOpacity
        activeOpacity={0.7}
        onPress={() => navigation.state.params.handleSaveUser()}
      >
        <Text message="common/done" type="title" style={styles.doneText} />
      </TouchableOpacity>
    ),
  })

  constructor(props) {
    super(props)
    this.state = {
      countryVisible: false,
      user: {
        name: '',
      },
      saving: false,
      progress: 0,
      showUpload: false,
      cca2: props.user.user.country_code,
      showValidation: false,
      showInvalid: false,
    }
  }

  updateProfileImage = () => {
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
              shouldCropPicture: true,
              callback: true,
            })
          }
          case 1: {
            return this.props.navigation.navigate('Gallery', {
              shouldCropPicture: true,
              callback: true,
            })
          }
        }
      }
    )
  }

  clearProfileImage() {
    this.props.actions.clearImages()
  }

  saveUser = async () => {
    if (this.state.user.name.length < 2 || this.state.user.name === undefined) {
      return this.setState({ showValidation: true })
    }

    if (this.state.showInvalid === true) {
      return this.setState({ showInvalid: true })
    }

    this.setState({ saving: true })

    const image = this.props.gallery.images[0]
      ? this.props.gallery.images[0]
      : null
    const user = this.state.user

    if (image) {
      this.setState({ showUpload: true })

      const imageUpload = await UploadAPI.uploadImage(image, progress => {
        this.setState({ progress })
      })

      if (imageUpload && imageUpload.key) {
        await this.props.actions.updateUserProfile(imageUpload.key)
      }

      this.setState({ showUpload: false })
    }

    await this.props.actions.updateUser(user)

    if (image) {
      this.clearProfileImage()
    }

    this.setState({ saving: false })

    this.props.navigation.goBack(null)
  }

  toggleCountry = () => this.picker && this.picker.openModal()

  onChangeCountry = country =>
    this.setState({
      cca2: country.cca2,
      user: {
        ...this.state.user,
        country_code: country.cca2,
      },
    })

  onChange(field, value) {
    this.setState({
      user: {
        ...this.state.user,
        [field]: value,
      },
    })
  }

  onChangeName = name => {
    const rgx = !/^[a-zA-Z\s]*$/.test(name)

    if (
      this.state.user.name.length >= 2 ||
      this.state.user.name !== undefined
    ) {
      this.setState({ showValidation: false })
    }
    this.setState({ showInvalid: rgx })
    this.onChange('name', name)
  }

  onBirthdayChange(value) {
    this.setState({
      user: {
        ...this.state.user,
        birthday: moment(value).format('YYYY-MM-DD'),
      },
    })
  }

  componentDidMount() {
    this.props.navigation.setParams({
      handleSaveUser: this.saveUser,
    })

    this.setState({
      user: this.props.user.user,
      birthday: moment(this.props.user.user.birthday)._d,
    })
  }

  render() {
    const { user: userData } = this.props
    const { saving, progress, showUpload } = this.state

    if (showUpload) {
      return (
        <UploadProgress progress={progress} text={t('upload/uploadingImage')} />
      )
    }

    const uploadedImage = this.props.gallery.images
      ? this.props.gallery.images[0]
      : null

    if (saving) {
      return (
        <View style={styles.wrapper}>
          <Loading type="spinner" />
        </View>
      )
    }

    const nameError =
      this.state.user.name.length < 2 ||
      this.state.user.name === undefined ||
      this.state.showValidation === true
        ? t('formErrors/nameShouldBe')
        : null

    const nameInvalid =
      this.state.showInvalid === true
        ? t('formErrors/nameInvalidCharacters')
        : null

    return (
      <KeyboardAwareScrollView>
        <ScrollView style={styles.wrapper}>
          <View style={styles.profilePicSection}>
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => {
                this.updateProfileImage()
              }}
            >
              {uploadedImage ? (
                <Image source={uploadedImage} style={styles.userImage} />
              ) : (
                <UserImage user={userData.user} style={styles.userImage} />
              )}
              <View style={styles.greenButton}>
                <Icon name="add_photo" style={styles.greenButtonIcon} />
                <Text
                  type="title"
                  weight="bold"
                  message="editProfile/uploadImage"
                  style={styles.greenButtonText}
                />
              </View>
            </TouchableOpacity>

            {uploadedImage && (
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={this.clearProfileImage.bind(this)}
              >
                <Text
                  type="title"
                  message="editProfile/clearUpload"
                  style={styles.clearImageText}
                />
              </TouchableOpacity>
            )}
          </View>

          <AnimatedTextInput
            label={t('formLabels/name')}
            value={this.state.user.name}
            errorMessage={nameInvalid || nameError}
            onChangeText={name => this.onChangeName(name)}
            autoCorrect={false}
          />

          <CountryPicker
            ref={ref => (this.picker = ref)}
            closeable
            filterable
            onChange={this.onChangeCountry}
            cca2={this.state.cca2}
            translation="eng"
            filterPlaceholderTextColor="#444"
            styles={{
              header: {
                backgroundColor: '#bbb',
                marginTop: 0,
                paddingTop: 20,
              },
              letter: {
                padding: 2,
                marginBottom: 10,
                marginRight: 0,
                width: 30,
                alignItems: 'flex-start',
              },
              letterText: {
                fontSize: 18,
                color: theme.mainColor,
                fontFamily: 'Nunito',
              },
              itemCountry: {
                alignItems: 'center',
              },
              itemCountryName: {
                borderBottomWidth: 0,
              },
              countryName: {
                fontFamily: 'Nunito-Bold',
                fontSize: 16,
                color: 'gray',
              },
            }}
          >
            <TouchableOpacity onPress={this.toggleCountry} activeOpacity={0.7}>
              <View style={styles.optionContainer}>
                <Text
                  type="title"
                  weight="bold"
                  message="editProfile/livingIn"
                  style={styles.optionsLabel}
                />
                <Text
                  weight="bold"
                  type="title"
                  text={outputCountry(this.state.user.country_code)}
                  style={styles.selectedOption}
                />
                <IconImage source="nextIcon" style={styles.rightArrow} />
              </View>
            </TouchableOpacity>
          </CountryPicker>

          <DateField
            label={t('formLabels/birthday')}
            value={
              this.state.user.birthday
                ? moment(this.state.user.birthday)._d
                : new Date()
            }
            onDateChange={birthday => this.onBirthdayChange(birthday)}
            containerStyle={styles.dateField}
          />

          <AnimatedTextInput
            label={t('formLabels/aboutMe')}
            value={this.state.user.profile_text}
            onChangeText={profile_text =>
              this.onChange('profile_text', profile_text)
            }
            multiLine={true}
            autoCorrect={false}
          />
        </ScrollView>
      </KeyboardAwareScrollView>
    )
  }
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    backgroundColor: theme.backgroundColor,
    paddingBottom: 30,
  },
  rowFlex: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    flex: 1,
    height: 45,
    paddingHorizontal: 20,
    backgroundColor: 'white',
  },
  profilePicSection: {
    padding: 15,
    alignItems: 'center',
  },
  userImage: {
    width: 150,
    height: 150,
  },
  clearImageText: {
    color: theme.fontColor,
    marginTop: 5,
  },
  greenButton: {
    backgroundColor: theme.secondaryColor,
    paddingVertical: 7,
    paddingHorizontal: 25,
    marginTop: 10,
    borderRadius: 4,
    flexDirection: 'row',
    alignItems: 'center',
  },
  greenButtonIcon: {
    color: 'white',
    fontSize: 18,
    paddingRight: 4,
  },
  greenButtonText: {
    color: '#ffffff',
    fontSize: theme.font.sizes.small,
  },
  doneText: {
    color: 'white',
    marginRight: 10,
    fontSize: 17,
  },
  optionsLabel: {
    flex: 1,
    fontSize: theme.font.sizes.defaultPlus,
  },
  optionContainer: {
    backgroundColor: 'white',
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 12,
    paddingLeft: 15,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: theme.border,
    borderTopWidth: 1,
    borderTopColor: theme.border,
    marginTop: 30,
  },
  selectedOption: {
    flex: 1,
    textAlign: 'right',
    marginRight: 10,
    color: '#ceced4',
  },
  rightArrow: {
    width: 13,
    height: 13,
    marginRight: 10,
    marginLeft: 15,
    resizeMode: 'contain',
    alignSelf: 'center',
  },
  dateField: {
    marginTop: 30,
  },
})

export default connect(
  state => ({
    auth: state.auth,
    user: state.user,
    gallery: state.gallery,
  }),
  dispatch => ({
    actions: bindActionCreators(
      {
        ...userActions,
        ...galleryActions,
      },
      dispatch
    ),
  })
)(EditProfile)
