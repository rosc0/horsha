import React, { PureComponent } from 'react'
import { ScrollView, StyleSheet, View } from 'react-native'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import KeyboardSpacer from '@components/KeyboardSpacer'
import TimerMixin from 'react-timer-mixin'

import t from '@config/i18n'
import { ADD_HORSE_STEPS, HORSE_GENDERS } from '@reducers/horses'
import * as horsesActions from '@actions/horses'
import * as galleryActions from '@actions/gallery'

import AddHorseName from './AddHorseName'
import AddHorseImage from './AddHorseImage'
import AddHorseInfo from './AddHorseInfo'
import AddHorseDescription from './AddHorseDescription'
import AddHorseCare from './AddHorseCare'
import AddHorseStepper from './components/AddHorseStepper'

import HeaderButton from '@components/HeaderButton'
import Loading from '@components/Loading'
import HeaderTitle from '@components/HeaderTitle'
import UploadProgress from '@components/UploadProgress'
import { renderName } from '../../utils'
import { theme } from '@styles/theme'

import {
  convertForSaveHorseHeight,
  convertForSaveHorseWeight,
} from '@application/utils'

import Upload from '@api/upload'

const UploadAPI = new Upload()

const TODAY = new Date()

const initialState = {
  name: '',
  gender: null,
  color: '',
  birthday: TODAY,
  breed: '',
  height: '',
  weight: '',
  description: '',
  horseCare: '',
  isSaving: false,
  progress: 0,
  showUpload: false,
  showValidation: false,
  showInvalid: false,
  pristine: true,
}

// height in meters
const HORSE_HEIGHT_MIN = 0.3
const HORSE_HEIGHT_MAX = 2.5
// weight in grams
const HORSE_WEIGHT_MIN = 10000
const HORSE_WEIGHT_MAX = 2500000

class AddHorse extends PureComponent {
  state = {
    ...initialState,
  }

  static navigationOptions = ({ navigation }) => ({
    headerTitle: <HeaderTitle title={'horses/addHorseTitle'} />,
    headerLeft: (
      <HeaderButton
        onPress={
          navigation.state.params && navigation.state.params.handleCancel
        }
      >
        Cancel
      </HeaderButton>
    ),
    tabBarVisible: false,
  })

  componentDidMount() {
    this.props.navigation.setParams({
      handleCancel: this.handleCancel,
    })
  }

  componentDidUpdate(prevProps) {
    if (this.props.fetching !== prevProps.fetching && !this.props.fetching) {
      // Fix add horse profile picture upload & flickery loading state on finish adding
      return TimerMixin.setTimeout(this.clearAddHorse, 2000)
    }
  }

  clearAddHorse = () =>
    this.setState({
      ...initialState,
    })

  handleCancel = () => {
    this.props.actions.clearAddHorse()
    this.props.actions.clearImages()
    this.props.navigation.goBack(null)
  }

  onChangeName = name => {
    const rgx = !/^[a-zA-Z\s]*$/.test(name)

    if (this.state.name.length >= 2 || this.state.name !== undefined) {
      this.setState({ showValidation: false })
    }
    this.setState({ showInvalid: rgx, name, pristine: false })
  }

  onChangeGender = gender => {
    this.setState(prevState => ({
      gender: prevState.gender === gender ? 'unknown' : gender,
    }))
  }

  handleChangeValue = field => value =>
    this.setState({
      [field]: value,
    })

  handleChangeMetrics = (field, value) =>
    this.setState({
      [field]: value,
    })

  renderStep = () => {
    const { step, image, navigation } = this.props
    const {
      name,
      gender,
      color,
      birthday,
      breed,
      height,
      weight,
      description,
      horseCare,
    } = this.state

    const props = {
      jumpToNextStep: this.handleNextStep,
      onChange: this.handleChangeValue,
      navigation,
    }

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

    if (step === ADD_HORSE_STEPS.NAME) {
      return (
        <AddHorseName
          name={name}
          gender={gender}
          errorMessage={
            this.state.pristine === false ? nameInvalid || nameError : null
          }
          onChangeName={this.onChangeName}
          onChangeGender={this.onChangeGender}
          {...props}
        />
      )
    }

    if (step === ADD_HORSE_STEPS.IMAGE) {
      return (
        <AddHorseImage
          name={name}
          image={image}
          renderName={renderName}
          clearImages={this.props.actions.clearImages}
          {...props}
        />
      )
    }

    if (step === ADD_HORSE_STEPS.INFO) {
      return (
        <AddHorseInfo
          color={color}
          birthday={birthday}
          breed={breed}
          height={height}
          weight={weight}
          minWeight={HORSE_WEIGHT_MIN}
          maxWeight={HORSE_WEIGHT_MAX}
          minHeight={HORSE_HEIGHT_MIN}
          maxHeight={HORSE_HEIGHT_MAX}
          handleChangeMetrics={this.handleChangeMetrics}
          {...props}
        />
      )
    }

    if (step === ADD_HORSE_STEPS.DESCRIPTION) {
      return (
        <AddHorseDescription
          name={name}
          image={image}
          description={description}
          {...props}
        />
      )
    }

    if (step === ADD_HORSE_STEPS.CARE) {
      return (
        <AddHorseCare
          name={name}
          horseCare={horseCare}
          renderName={renderName}
          {...props}
        />
      )
    }
  }

  handlePreviousStep = () => this.props.actions.setPreviousStep()

  isNextStepValid = () => {
    const { step, image, user } = this.props
    const {
      name,
      gender,
      color,
      birthday,
      breed,
      height,
      weight,
      description,
      horseCare,
      showInvalid,
    } = this.state

    if (step === ADD_HORSE_STEPS.NAME) {
      return !!(name && !showInvalid)
    }

    if (step === ADD_HORSE_STEPS.IMAGE) {
      return !!image
    }

    if (step === ADD_HORSE_STEPS.DESCRIPTION) {
      return !!description
    }

    if (step === ADD_HORSE_STEPS.INFO) {
      const convertedHeight = convertForSaveHorseHeight(
        height,
        user.account.preferences.heightUnit
      )
      const convertedWeight = convertForSaveHorseWeight(
        weight,
        user.account.preferences.unitSystem
      )

      if (!convertedHeight && !convertedWeight) {
        return !!(color || birthday || breed)
      }

      const isHeightValid =
        convertedHeight >= HORSE_HEIGHT_MIN &&
        convertedHeight <= HORSE_HEIGHT_MAX
      const isWeightValid =
        convertedWeight >= HORSE_WEIGHT_MIN &&
        convertedWeight <= HORSE_WEIGHT_MAX

      return (
        !!(color || birthday || breed) &&
        ((isHeightValid || !convertedHeight) &&
          (isWeightValid || !convertedWeight))
      )
    }

    if (step === ADD_HORSE_STEPS.CARE) {
      return !!horseCare
    }

    return false
  }

  handleNextStep = (isNotNow = false) => {
    if (isNotNow) {
      if (this.props.step === ADD_HORSE_STEPS.INFO) {
        this.setState({
          weight: null,
          height: null,
        })
      }
    }

    if (this.props.step === ADD_HORSE_STEPS.CARE) {
      return this.handleCreateHorse()
    }

    return this.props.actions.setNextStep()
  }

  handleCreateHorse = () => {
    const { user } = this.props

    this.setState(
      {
        height: convertForSaveHorseHeight(
          this.state.height,
          user.account.preferences.heightUnit
        ),
        weight: convertForSaveHorseWeight(
          this.state.weight,
          user.account.preferences.unitSystem
        ),
      },
      async () => {
        const {
          name,
          gender,
          color,
          birthday,
          breed,
          height,
          weight,
          description,
          horseCare,
        } = this.state

        const image = this.props.image ? this.props.image : null
        let uploadKey = null

        if (image) {
          this.setState({ showUpload: true })

          const imageUpload = await UploadAPI.uploadImage(image, progress => {
            this.setState({ progress })
          })

          this.setState({
            showUpload: false,
            isSaving: true,
          })

          if (imageUpload && imageUpload.key) {
            uploadKey = imageUpload.key
          }
        }

        const horse = await this.props.actions.addHorse({
          name,
          gender,
          color,
          birthday,
          breed,
          height,
          weight,
          description,
          horseCare,
        })

        if (horse.value.id && uploadKey) {
          await this.props.actions.editHorseImage(horse.value.id, uploadKey)
        }

        this.props.actions.clearImages()

        this.props.actions.getHorses()

        return this.props.navigation.navigate('Profile', {
          horseId: horse.value.id,
          shouldResetRouterOnBack: true,
        })
      }
    )
  }

  render() {
    if (this.state.isSaving) {
      return <Loading type="spinner" />
    }

    const { progress, showUpload } = this.state
    const steps = Object.values(ADD_HORSE_STEPS)

    return (
      <View style={styles.container}>
        {showUpload ? (
          <UploadProgress
            progress={progress}
            text={t('upload/uploadingImage')}
          />
        ) : (
          <ScrollView ref={ref => (this.container = ref)}>
            {this.renderStep()}
          </ScrollView>
        )}

        <AddHorseStepper
          stepsCount={steps.length}
          currentStep={steps.findIndex(step => step === this.props.step)}
          onPressPrevStep={this.handlePreviousStep}
          onPressNextStep={this.handleNextStep}
          isNextStepValid={this.isNextStepValid()}
          handleCreateHorse={this.handleCreateHorse}
        />

        <KeyboardSpacer />
      </View>
    )
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.backgroundColor,
  },
})

const mapStateToProps = ({ user, horses, gallery }) => ({
  user: user.user,
  ...horses.addHorse,
  image: gallery.images[0],
})

const mapDispatchToProps = dispatch => ({
  actions: bindActionCreators(
    {
      ...horsesActions,
      ...galleryActions,
    },
    dispatch
  ),
})

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(AddHorse)
