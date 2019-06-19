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
import KeyboardSpacer from '@components/KeyboardSpacer'
import ActionSheet from 'rn-action-sheet'

import SelectField from '@components/SelectField'
import DateField from '@components/DateField'
import Text from '@components/Text'
import HeaderTitle from '@components/HeaderTitle'
import Icon from '@components/Icon'
import UploadProgress from '@components/UploadProgress'
import AnimatedTextInput from '@components/AnimatedTextInput'

import {
  calculateHorseHeight,
  calculateHorseWeight,
  convertForSaveHorseHeight,
  convertForSaveHorseWeight,
  clean,
  cleanMeasure,
  cleanDate,
} from '@application/utils'

import { HORSE_GENDERS } from '@reducers/horses'
import { galleryActions, horsesActions } from '@actions/index'
import t from '@config/i18n'
import { theme } from '@styles/theme'

import Upload from '@api/upload'

const UploadAPI = new Upload()

// height in meters
const HORSE_HEIGHT_MIN = 0.3
const HORSE_HEIGHT_MAX = 2.5
// weight in grams
const HORSE_WEIGHT_MIN = 10000
const HORSE_WEIGHT_MAX = 2500000

class EditHorse extends PureComponent {
  static navigationOptions = ({ navigation }) => ({
    headerTitle: <HeaderTitle title={'horses/editHorse'} />,
    headerLeft: (
      <TouchableOpacity onPress={() => navigation.goBack(null)}>
        <Text style={styles.saveButton} message="common/cancel" />
      </TouchableOpacity>
    ),
    headerRight: navigation.state.params.handleSave ? (
      <TouchableOpacity onPress={() => navigation.state.params.handleSave()}>
        <Text
          type="title"
          weight="semiBold"
          style={styles.saveButton}
          message="common/done"
        />
      </TouchableOpacity>
    ) : null,
    tabBarVisible: false,
  })

  state = {
    id: null,
    imageUpdated: false,
    name: '',
    breed: '',
    color: '',
    gender: '',
    weight: '',
    height: '',
    birthday: new Date(),
    description: '',
    image: '',
    invalidHeight: false,
    invalidWeight: false,
    progress: 0,
    showUpload: false,
    showValidation: false,
    showInvalid: false,
  }

  componentDidMount() {
    this.props.navigation.setParams({
      handleSave: this.handleSave,
    })

    const { horseId: id, horse } = this.props.navigation.state.params
    const { user } = this.props

    let weight = null
    if (horse.weight) {
      weight = calculateHorseWeight(
        horse.weight,
        user.account.preferences.unitSystem
      )
    }

    let height = null
    if (horse.height) {
      height = calculateHorseHeight(
        horse.height,
        user.account.preferences.heightUnit
      )
    }

    this.setState({
      id,
      name: clean(horse.name),
      breed: clean(horse.breed),
      color: clean(horse.color),
      gender: clean(horse.gender),
      weight: clean(horse.weight / 1000),
      height: clean(horse.height * 100),
      birthday: cleanDate(horse.birth),
      description: clean(horse.description),
      image: clean(horse.image),
    })
  }

  static getDerivedStateFromProps(props, state) {
    const { images } = props.gallery
    const { image } = state

    if (images.length && image !== images[0].uri) {
      return {
        image: images[0].uri,
        imageOriginal: images[0],
        imageUpdated: true,
      }
    }

    return null
  }

  handleSave = async () => {
    if (this.state.name.length < 2 || this.state.name === undefined) {
      return this.setState({ showValidation: true })
    }
    if (this.state.showInvalid === true) {
      return this.setState({ showInvalid: true })
    }

    const { id, imageOriginal, imageUpdated } = this.state
    const { horse } = this.props.navigation.state.params
    let data = {
      ...horse,
      ...this.state,
    }

    data.weight = convertForSaveHorseWeight(
      data.weight,
      this.props.user.account.preferences.unitSystem
    )
    data.height = convertForSaveHorseHeight(
      data.height,
      this.props.user.account.preferences.heightUnit
    )

    if (imageUpdated && imageOriginal) {
      this.setState({ showUpload: true })

      const imageUpload = await UploadAPI.uploadImage(
        imageOriginal,
        progress => {
          this.setState({ progress })
        }
      )

      if (imageUpload && imageUpload.key) {
        await this.props.actions.editHorseImage(id, imageUpload.key)
      }
    }

    await this.props.actions.editHorseProfile(id, data)

    this.setState({ showUpload: false })

    this.props.navigation.goBack(null)
  }

  onChangeName = name => {
    const rgx = !/^[a-zA-Z\s]*$/.test(name)
    if (this.state.name.length >= 2 || this.state.name !== undefined) {
      this.setState({ showValidation: false })
    }
    this.setState({ showInvalid: rgx })
    this.setState({ name })
  }

  handleUpdatePhoto = () => {
    const optionsTitleText = t('gallery/optionsTitle')
    const takePictureText = t('gallery/takePicture')
    const chooseFromGalleryText = t('gallery/chooseFromGallery')
    const cancelText = t('common/cancel')

    const galleryProps = {
      shouldCropPicture: true,
      callback: true,
    }

    this.props.actions.clearImages()

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

  checkHeight = height => {
    const convertedHeight = convertForSaveHorseHeight(
      height,
      this.props.user.account.preferences.heightUnit
    )

    this.setState({ invalidHeight: false })

    if (
      height &&
      (convertedHeight < HORSE_HEIGHT_MIN || convertedHeight > HORSE_HEIGHT_MAX)
    ) {
      this.setState({ invalidHeight: true })
    }

    this.setState({ height })
  }

  checkWeight = weight => {
    const convertedWeight = convertForSaveHorseWeight(
      weight,
      this.props.user.account.preferences.unitSystem
    )

    this.setState({ invalidWeight: false })

    if (
      weight &&
      (convertedWeight < HORSE_WEIGHT_MIN || convertedWeight > HORSE_WEIGHT_MAX)
    ) {
      this.setState({ invalidWeight: true })
    }

    this.setState({ weight })
  }

  render() {
    const {
      name,
      breed,
      color,
      gender,
      weight,
      height,
      birthday,
      description,
      image: horsePicture,
      invalidHeight,
      invalidWeight,
      showUpload,
      progress,
    } = this.state

    if (showUpload) {
      return (
        <UploadProgress progress={progress} text={t('upload/uploadingImage')} />
      )
    }

    const genders = Object.values(HORSE_GENDERS).map(gender => ({
      label: gender.charAt(0).toUpperCase() + gender.slice(1),
      value: gender,
    }))

    const heightUnitSystem = this.props.user.account.preferences.heightUnit
    const unitSystem = this.props.user.account.preferences.unitSystem

    let heightUnit = 'cm'
    if (heightUnitSystem === 'inches') {
      heightUnit = '"'
    } else if (heightUnitSystem === 'hands') {
      heightUnit = 'hh'
    }

    let weightUnit = 'kg'
    if (unitSystem === 'IMPERIAL') {
      weightUnit = 'lb'
    }

    const image = horsePicture
      ? { uri: horsePicture }
      : require('@images/horse_placeholder.png')

    const nameError =
      this.state.name.length < 2 ||
      this.state.name === undefined ||
      this.state.showValidation === true
        ? t('formErrors/nameShouldBe')
        : null

    const nameInvalid =
      this.state.showInvalid === true
        ? t('formErrors/nameInvalidCharacters')
        : null

    return (
      <View style={styles.wrapper}>
        <ScrollView style={styles.wrapper}>
          <View style={styles.picture}>
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={this.handleUpdatePhoto}
              style={styles.imageWrapper}
            >
              <Image style={styles.avatar} source={image} />
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.7}
              onPress={this.handleUpdatePhoto}
              style={styles.button}
            >
              <Icon name="add_photo_for_album" tintColor="white" />
              <Text
                type="title"
                weight="bold"
                style={styles.buttonText}
                message="horses/editPicture"
              />
            </TouchableOpacity>
          </View>

          <AnimatedTextInput
            label={t('formLabels/name')}
            value={name}
            errorMessage={nameInvalid || nameError}
            onChangeText={name => this.onChangeName(name)}
          />

          <AnimatedTextInput
            label={t('formLabels/breed')}
            value={breed}
            onChangeText={breed => this.setState({ breed })}
          />

          <AnimatedTextInput
            label={t('formLabels/color')}
            value={color}
            onChangeText={color => this.setState({ color })}
          />

          <SelectField
            label={t('formLabels/gender')}
            options={genders}
            value={gender}
            onSelect={gender => {
              this.setState(prevState => ({
                gender: prevState.gender === gender ? 'unknown' : gender,
              }))
            }}
            containerStyle={styles.selectContainer}
          />

          <AnimatedTextInput
            label={t('formLabels/weight', { unit: weightUnit })}
            value={weight.toString()}
            numerical={true}
            onChangeText={weight => this.checkWeight(weight)}
            keyboardType="numeric"
            errorMessage={
              invalidWeight
                ? t('horses/invalidError', {
                    lowLimit: calculateHorseWeight(
                      HORSE_WEIGHT_MIN,
                      unitSystem,
                      true
                    ),
                    highLimit: calculateHorseWeight(
                      HORSE_WEIGHT_MAX,
                      unitSystem,
                      true
                    ),
                  })
                : null
            }
          />

          <AnimatedTextInput
            label={t('formLabels/height', { unit: heightUnit })}
            value={height.toString()}
            numerical={true}
            onChangeText={height => this.checkHeight(height)}
            keyboardType="numeric"
            errorMessage={
              invalidHeight
                ? t('horses/invalidError', {
                    lowLimit: calculateHorseHeight(
                      HORSE_HEIGHT_MIN,
                      heightUnitSystem,
                      true
                    ),
                    highLimit: calculateHorseHeight(
                      HORSE_HEIGHT_MAX,
                      heightUnitSystem,
                      true
                    ),
                  })
                : null
            }
          />

          <DateField
            label={t('formLabels/birthday')}
            value={birthday ? moment(birthday)._d : new Date()}
            onDateChange={date =>
              this.setState({
                birthday: moment(date).format('YYYY-MM-DD'),
              })
            }
            containerStyle={styles.datePickerContainer}
          />

          <AnimatedTextInput
            label={t('horseProfile/about')}
            value={description}
            onChangeText={description => this.setState({ description })}
            multiLine={true}
          />
        </ScrollView>

        <KeyboardSpacer topSpacing={15} />
      </View>
    )
  }
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    backgroundColor: theme.backgroundColor,
  },
  saveButton: {
    fontSize: 16,
    color: 'white',
    marginRight: 10,
    marginLeft: 10,
  },
  imageWrapper: {
    marginVertical: 10,
  },
  picture: {
    flex: 1,
    alignItems: 'center',
    flexDirection: 'column',
  },
  button: {
    backgroundColor: theme.secondaryColor,
    paddingVertical: 7,
    paddingHorizontal: 25,
    marginTop: 10,
    borderRadius: 4,
    flexDirection: 'row',
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: theme.font.sizes.smallVariation,
    marginLeft: 5,
  },
  row: {
    marginTop: 15,
  },
  label: {
    color: '#666',
    fontSize: theme.font.sizes.smallVariation,
    marginLeft: 20,
    marginBottom: 10,
  },
  input: {
    backgroundColor: 'white',
    padding: 15,
    paddingHorizontal: 20,
    fontSize: theme.font.sizes.smallVariation,
    color: 'black',
  },
  inlineInput: {
    position: 'relative',
  },
  labelInput: {
    position: 'absolute',
    margin: 10,
    marginTop: 13,
    left: 10,
    zIndex: 2,
    backgroundColor: 'white',
    color: '#b6b6b7',
    fontSize: theme.font.sizes.smallVariation,
  },
  inputInline: {
    paddingLeft: 70,
    borderColor: '#eff0ef',
    borderBottomWidth: 1,
  },
  finalBorder: {
    borderBottomWidth: 2,
    borderColor: '#e6e5e8',
  },
  datepickerLabel: {
    color: '#666',
    fontSize: theme.font.sizes.default,
  },
  avatar: {
    width: 150,
    height: 150,
    marginTop: 10,
  },
  info: {
    position: 'absolute',
    right: 15,
    top: 13,
    fontSize: theme.font.sizes.smallVariation,
    color: '#ccc',
    zIndex: 2,
    backgroundColor: 'white',
  },
  errorBox: {
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: theme.chartRed,
    borderBottomWidth: 1,
    borderColor: '#e6e5e8',
    paddingVertical: 8,
    paddingLeft: 10,
  },
  error: {
    color: theme.chartRed,
    fontSize: theme.font.sizes.smallVariation,
  },
  selectContainer: {
    marginTop: 10,
  },
  datePickerContainer: {
    marginTop: 25,
  },
})

export default connect(
  state => ({
    user: state.user.user,
    gallery: state.gallery,
  }),
  dispatch => ({
    actions: bindActionCreators(
      {
        ...horsesActions,
        ...galleryActions,
      },
      dispatch
    ),
  })
)(EditHorse)
