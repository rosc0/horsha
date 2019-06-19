import React, { Component } from 'react'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import { NavigationActions, StackActions } from 'react-navigation'
import {
  Alert,
  Dimensions,
  Image,
  Modal,
  PermissionsAndroid,
  Platform,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
  SafeAreaView,
  Switch,
} from 'react-native'
import moment from 'moment'
import ActionSheet from 'rn-action-sheet'
import KeyboardSpacer from '@components/KeyboardSpacer'
import { DocumentPicker } from 'react-native-document-picker'

import t from '@config/i18n'
import { theme } from '@styles/theme'
import * as trailActions from '@actions/trails'
import { format } from '@application/utils'

import PickRideModal from './components/PickRideModal'
import TrailEditor from './components/TrailEditor'
import Button from '@components/Button'
import Text from '@components/Text'
import AnimatedTextInput from '@components/AnimatedTextInput'
import Checkbox from '@components/Checkbox'
import Loading from '@components/Loading'
import UploadProgress from '@components/UploadProgress'
import { calculateDistance, rangeToPercent } from '@utils'
import TrailPolyline from '@components/TrailPolyline'
import HeaderTitle from '@components/HeaderTitle'
import { fatArrowLeft, fatArrowRight, IconImage } from '@components/Icons'

import Upload from '@api/upload'
import Rides from '@api/rides'

const UploadAPI = new Upload()
const RidesAPI = new Rides()

const { width } = Dimensions.get('window')
const noop = () => {}
let data

class CreateTrail extends Component {
  static navigationOptions = ({ navigation }) => ({
    headerTitle: <HeaderTitle title={'trails/createTrailTitle'} />,
    tabBarVisible: false,
    headerLeft: (
      <TouchableOpacity onPress={() => navigation.goBack(null)}>
        <Text
          type="title"
          weight="semiBold"
          message="common/cancel"
          style={styles.cancelButton}
        />
      </TouchableOpacity>
    ),
  })

  state = {
    currentPage: 1,
    totalPages: 6,
    source: null,
    fileName: '',
    uri: null,
    rideName: '',
    ride: null,
    trailName: '',
    trailDescription: '',
    rideModal: false,
    carriageSuitable: '',
    fileLoading: false,
    by: null,
    surfaces: [],
    coordsOriginal: [],
    coords: [],
    finalCoords: [],
    progress: 0,
    showUpload: false,
    uploadText: null,
    hasError: null,
    uploadedData: null,
  }

  create = async () => {
    const {
      carriageSuitable: suitable_for_driving,
      trailName: title,
      trailDescription: description,
      surfaces: surface_types,
      finalCoords,
    } = this.state

    const loopThrough = finalCoords.segments
      ? finalCoords.segments
      : finalCoords
    const json = loopThrough.reduce(
      (accumulator, segment) => accumulator.concat(segment.waypoints),
      []
    )

    this.setState({
      showUpload: true,
      uploadText: t('trails/weAreCreatingTrail'),
    })

    const uploadJson = await UploadAPI.uploadJson(json, progress => {
      this.setState({ progress })
    })

    if (uploadJson && uploadJson.key) {
      const info = {
        title,
        description,
        suitable_for_driving,
        surface_types,
        user_id: this.props.user.user.id,
        upload_key: uploadJson.key,
      }

      await this.props.actions.createTrail(info)
    }

    this.setState({ showUpload: false })
  }

  handleTrailLoad = (coords, coordsOriginal) => {
    this.setState({
      coords,
      coordsOriginal,
      finalCoords: coordsOriginal,
    })
  }
  handleTrailChange = (max, min) => {
    const { coords, coordsOriginal } = this.state

    if (!coords) return

    const latitudes = coords.slice(min, max).map(item => item.latitude)
    const finalCoords = coordsOriginal.segments.reduce(
      (accumulator, segment) => {
        const hasSegment = segment.waypoints.some(item =>
          latitudes.includes(item.lat)
        )

        if (hasSegment) {
          segment.waypoints = segment.waypoints.filter(item =>
            latitudes.includes(item.lat)
          )
          accumulator = accumulator.concat(segment)
        }

        return accumulator
      },
      []
    )

    this.setState({ finalCoords })
  }

  nextStep = () => {
    let { currentPage, totalPages } = this.state
    if (currentPage >= totalPages) return

    const nextPage = currentPage + 1

    this.setState({ currentPage: currentPage + 1 })

    if (nextPage === 5) this.create()
  }

  prevStep = () => {
    let { currentPage } = this.state
    if (currentPage === 1) return

    this.setState({ currentPage: --currentPage })
  }

  validateFile(fileInfo) {
    const { fileSize, fileName } = fileInfo
    const getExtension = name => name.split('.').pop()
    const extension = getExtension(fileName)

    const fileTooBigTitleText = t('trails/fileTooBigTitle')
    const fileTooBigMessageText = t('trails/fileTooBigMessage')
    const wrongFileExtTitleText = t('trails/wrongFileExtTitle')
    const wrongFileExtMessageText = t('trails/wrongFileExtMessage', {
      extension: extension,
    })

    // 10mb
    if (fileSize > 1e7) {
      Alert.alert(
        fileTooBigTitleText,
        fileTooBigMessageText,
        [
          {
            text: t('common/ok'),
            onPress: () => {},
          },
        ],
        { cancelable: false }
      )

      return false
    }

    if (extension !== 'gpx' && extension !== 'GPX') {
      Alert.alert(
        wrongFileExtTitleText,
        wrongFileExtMessageText,
        [
          {
            text: t('common/ok'),
            onPress: () => {},
          },
        ],
        { cancelable: false }
      )

      return false
    }

    return true
  }

  pickFiles = () => {
    const filetype = [Platform.OS === 'android' ? '*/*' : 'public.xml']

    DocumentPicker.show({ filetype }, async (error, information) => {
      if (this.validateFile(information)) {
        this.setState({
          showUpload: true,
          uploadText: t('upload/uploadingGpx'),
        })

        try {
          const uploadGpx = await UploadAPI.uploadGpx(information, progress => {
            this.setState({ progress })
          })

          if (uploadGpx && uploadGpx.key) {
            const json = await RidesAPI.convertGpxToJson(uploadGpx.key)

            if (json.status && json.status >= 400) {
              throw new Error()
            }

            this.setState({
              rideName: information.fileName,
              by: 'xml',
              fileLoading: false,
              ride: json,
            })
          }

          this.setState({
            progress: 0,
            showUpload: false,
          })
        } catch (error) {
          this.setState({
            showUpload: false,
          })

          Alert.alert(
            t('upload/uploadGpxErrorTitle'),
            t('upload/uploadGpxError'),
            [
              {
                text: t('common/ok'),
                onPress: () => {},
              },
            ],
            { cancelable: true }
          )
        }
      }
    })
  }

  openSelectRideModal = ride => {
    this.props.navigation.navigate('PickRideModal', {
      onSelectPress: this.onSelectRide,
    })
  }

  onSelectRide = ride => {
    const { user } = this.props.user

    const unitSystem = user.account.preferences.unitSystem
    const unit = unitSystem === 'IMPERIAL' ? 'Mi' : 'Km'
    const distance = `${calculateDistance(ride.distance, unitSystem)} ${unit}`

    const dateCreated = moment(ride.date_created).format('MMM DD, dddd')

    const rideName = `${dateCreated}, ${distance}`

    this.setState({ rideModal: false, rideName, ride: ride, by: 'uri' })
  }

  changeSource = () => {
    const existingRideText = t('trails/existingRide')
    const gpxFileText = t('trails/gpxFile')
    const cancelText = t('common/cancel')

    ActionSheet.show(
      {
        title: t('trails/chooseType'),
        options: [existingRideText, gpxFileText, cancelText],
        cancelButtonIndex: 2,
        destructiveButtonIndex: 2,
        tintColor: theme.secondaryColor,
      },
      buttonIndex => {
        if (buttonIndex !== 2) {
          this.setState({
            source: buttonIndex === 0 ? existingRideText : cancelText,
          })
        }
      }
    )
  }

  pickRide() {
    return (
      <PickRideModal
        onCancelPress={this.closeSelectRideModal}
        onSelectPress={this.onSelectRide}
      />
    )
  }

  progress = () => {
    const {
      currentPage,
      totalPages,
      uri,
      ride,
      trailName,
      carriageSuitable,
    } = this.state

    const { trailCreated } = this.props.trails

    const percentage = rangeToPercent(currentPage, 0, totalPages)
    const is = n => n === currentPage

    let nextDisabled = progressStyles.btnDisabled
    let prevDisabled = progressStyles.btnDisabled
    let nextFunc = noop
    let prevFunc = noop

    if (currentPage > 1) {
      prevDisabled = {}
      prevFunc = this.prevStep
    }

    if (is(1) && (!!uri || !!ride)) {
      nextDisabled = {}
      nextFunc = this.nextStep
    }

    if (is(2)) {
      nextDisabled = {}
      nextFunc = this.nextStep
    }

    if (is(3) && trailName.length >= 3) {
      nextDisabled = {}
      nextFunc = this.nextStep
    }

    if (is(4) && carriageSuitable !== '') {
      nextDisabled = {}
      nextFunc = this.nextStep
    }

    if (is(5)) {
      nextDisabled = {}
      nextFunc = this.nextStep

      if (trailCreated.uploaded) {
        data = {
          chooseLocation: true,
        }
        // in case something goes wrong..
        if (trailCreated.collection) {
          data = {
            trailId: trailCreated.collection.id,
            chooseLocation: true,
            trail: {
              bb: trailCreated.collection.bounding_box,
              url: trailCreated.collection.full_waypoint_list_url,
            },
          }
        }
      }
    }

    if (is(6)) {
      nextDisabled = {}
      nextFunc = () => this.resetNavigationAction()
    }

    return (
      <View style={styles.progressWrapper}>
        <TouchableOpacity
          onPress={prevFunc}
          style={[styles.prevButton]}
          activeOpacity={0.7}
        >
          <FatArrow type="left" state={prevDisabled} />
          <Text
            type="title"
            weight="bold"
            style={[styles.nextButtonText, prevDisabled]}
            message="common/previous"
          />
        </TouchableOpacity>

        <View style={styles.progressBar}>
          <View
            style={[styles.progressBarValue, { width: percentage + '%' }]}
          />

          <View style={styles.progressIndicator} />
        </View>

        <TouchableOpacity
          onPress={nextFunc}
          style={styles.nextButton}
          activeOpacity={0.7}
        >
          <Text
            type="title"
            weight="bold"
            style={[styles.nextButtonText, nextDisabled]}
            message={is(6) ? 'common/done' : 'common/next'}
          />
          <FatArrow type="right" state={nextDisabled} />
        </TouchableOpacity>
      </View>
    )
  }

  source() {
    let source = t('trails/gpxFile')
    const rideText = t('trails/existingRide')
    const stateSource = this.state.source
    const { type } = this.props.navigation.state.params

    if ((type !== 'gpx' && stateSource === null) || stateSource === rideText) {
      source = rideText
    }

    return (
      <TouchableOpacity
        onPress={this.changeSource}
        style={[styles.option, styles.source]}
        activeOpacity={0.7}
      >
        <Text
          type="title"
          weight="bold"
          style={styles.optionText}
          message="trails/createFrom"
        />

        <View style={styles.inline}>
          <Text type="title" style={styles.optionValue} text={source} />
          <ArrowIcon />
        </View>
      </TouchableOpacity>
    )
  }

  byGPX = () => {
    const { rideName } = this.state
    const prettyName = format(rideName)

    return (
      <TouchableOpacity
        onPress={this.pickFiles}
        style={styles.option}
        activeOpacity={0.7}
      >
        <View style={styles.inline}>
          <IconImage source="attachIcon" style={styles.attachIcon} />
          <Text
            type="title"
            weight="bold"
            style={styles.optionText}
            message="trails/uploadGpxFile"
          />
        </View>

        <View style={styles.inline}>
          <Text type="title" style={styles.optionValue} text={prettyName} />
          <ArrowIcon />
        </View>
      </TouchableOpacity>
    )
  }

  byRide = () => {
    return (
      <TouchableOpacity
        onPress={this.openSelectRideModal}
        style={styles.option}
        activeOpacity={0.7}
      >
        <Text
          type="title"
          weight="bold"
          style={styles.optionText}
          message="trails/chooseRide"
        />

        <View style={styles.inline}>
          <Text
            type="title"
            style={styles.optionValue}
            text={this.state.rideName}
          />
          <ArrowIcon />
        </View>
      </TouchableOpacity>
    )
  }

  trailDetails() {
    const nameLabel = t('trails/trailName')
    const descriptionLabel = t('trails/description')
    const { trailName } = this.state

    return (
      <View style={styles.inputWrapper}>
        <AnimatedTextInput
          ref="name"
          label={nameLabel}
          value={this.state.trailName}
          inputContainerStyle={{
            borderTopWidth: 0,
          }}
          defaultMultiLineHeight={45}
          errorMessage={
            trailName.length > 0 &&
            trailName.length < 3 &&
            t('trails/titleLengthError')
          }
          onChangeText={trailName => this.setState({ trailName })}
        />
        <AnimatedTextInput
          ref="description"
          label={descriptionLabel}
          value={this.state.trailDescription}
          inputContainerStyle={{
            borderTopWidth: 0,
          }}
          multiLine={true}
          defaultMultiLineHeight={40}
          onChangeText={trailDescription => this.setState({ trailDescription })}
        />
      </View>
    )
  }

  trailInfo() {
    const yesText = t('common/yes')
    const noText = t('common/no')
    const asphaltText = t('trails/asphalt')
    const dirtRoadText = t('trails/dirtRoad')
    const grassText = t('trails/grass')
    const gravelText = t('trails/gravel')
    const sandText = t('trails/sand')

    const carriageSuitableValues = [
      { label: yesText, value: true, checked: true },
      { label: noText, value: false },
    ]

    const surfaceValues = [
      { label: asphaltText, value: 'asphalt' },
      { label: dirtRoadText, value: 'dirt_road' },
      { label: grassText, value: 'grass' },
      { label: gravelText, value: 'gravel' },
      { label: sandText, value: 'sand' },
    ]

    return (
      <ScrollView
        style={[
          styles.container,
          {
            backgroundColor: theme.backgroundColor,
          },
        ]}
      >
        <View style={[styles.questionsWrapper, styles.swithContainer]}>
          <View style={styles.center}>
            <IconImage style={styles.drivingIcon} source="drivingIcon" svg />
          </View>
          <Text
            type="title"
            weight="bold"
            style={styles.swithTitle}
            message="trails/isSuitableForCarriage"
          />

          <Switch
            style={styles.swithButton}
            onValueChange={value => this.setState({ carriageSuitable: value })}
            value={this.state.carriageSuitable}
            trackColor={{ true: theme.secondaryColor }}
          />
        </View>
        <Text
          style={styles.swithSmallTitle}
          message="trails/requireWideTrail"
        />
        <View
          style={[
            styles.questionsWrapper,
            { backgroundColor: theme.backgroundColor },
          ]}
        >
          <Text
            type="title"
            weight="bold"
            style={[styles.questionTitle, styles.questionSpacing]}
            message="trails/surfaces"
          />
          <Checkbox
            values={surfaceValues}
            defaultValue={this.state.surfaces}
            onSelect={val => this.setState({ surfaces: val })}
            labelStyle={{ marginLeft: 5 }}
          />
        </View>
      </ScrollView>
    )
  }

  trailSuccessOrError = () => {
    const { trailCreated } = this.props.trails

    return (
      <View>
        {/* {trailCreated.isUploading && ( */}
        {/* <View style={[styles.feedback, styles.loading]}> */}
        {/* <ActivityIndicator animating={true} size="large" /> */}
        {/* <Text */}
        {/* style={styles.feedbackText} */}
        {/* message="trails/weAreCreatingTrail" */}
        {/* /> */}
        {/* </View> */}
        {/* )} */}

        {trailCreated.uploaded && (
          <View style={[styles.feedback, styles.success]}>
            <IconImage style={styles.successError} source="successIcon" />
            <Text
              type="title"
              style={[styles.feedbackTitle, styles.feedbackSuccess]}
              message="trails/success"
            />
            <Text
              style={styles.feedbackText}
              message="trails/trailSuccessfullyCreated"
            />
          </View>
        )}

        {false && (
          <View style={[styles.feedback, styles.error]}>
            <IconImage style={styles.successError} source="errorIcon" />
            <Text
              type="title"
              style={[styles.feedbackTitle, styles.feedbackError]}
              message="trails/ooops"
            />
            <Text
              style={styles.feedbackText}
              message="trails/problemWithRequest"
            />
          </View>
        )}
      </View>
    )
  }

  editTrail() {
    const { by, ride } = this.state

    let bound = null

    const fileJSON = by === 'uri' ? ride.preview_track_url : false

    if (fileJSON) {
      bound = ride.bounding_box
    }

    return (
      <View style={[styles.container, { marginTop: 10 }]}>
        <TrailEditor
          type={by}
          coordsJSON={fileJSON}
          coordsXML={ride}
          boundBox={bound}
          onChange={this.handleTrailChange}
          onLoad={this.handleTrailLoad}
        />
      </View>
    )
  }

  componentDidMount = async () => {
    const { params: navigationParams } = this.props.navigation.state

    if (navigationParams.ride) {
      this.nextStep()
      this.onSelectRide(navigationParams.ride)
    }

    if (Platform.OS === 'android') {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
        {
          title: t('permissions/storageTitle'),
          message: t('permissions/storageMessage'),
        }
      )
      if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
        Alert.alert(null, t('permissions/needStorageTrail'), [
          {
            text: t('common/ok'),
            onPress: () => {},
          },
        ])
        this.props.navigation.goBack(null)
      }
    }
  }

  resetNavigationAction = () => {
    const { params } = this.props.navigation.state

    if (params && params.shouldResetRouterOnBack) {
      return this.props.navigation.goBack(null)
    }
    const resetAction = StackActions.reset({
      index: 0, // Reset nav stack
      actions: [
        NavigationActions.navigate({
          routeName: 'LoggedIn', // Call home stack
          action: NavigationActions.navigate({
            routeName: 'Trails', // Navigate to this screen
            action: NavigationActions.navigate({
              routeName: 'Details', // Navigate to this screen
              params: {
                trailId: data.trailId,
              },
            }),
          }),
        }),
      ],
      key: null,
    })

    return this.props.navigation.dispatch(resetAction)
  }

  render() {
    const {
      source,
      currentPage,
      fileLoading,
      showUpload,
      progress,
      uploadText,
      ride,
    } = this.state

    // if (showUpload) {
    //   return <UploadProgress progress={progress} text={uploadText} />
    // }

    const { type } = this.props.navigation.state.params
    const isPage = p => p === currentPage
    const existingRideText = t('trails/existingRide')

    let trailSource = this.byGPX

    if ((type !== 'gpx' && source === null) || source === existingRideText) {
      trailSource = this.byRide
    }

    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
        <View style={styles.wrapper}>
          {showUpload && (
            <UploadProgress progress={progress} text={uploadText} />
          )}
          <Modal
            animationType="slide"
            visible={this.state.rideModal}
            onRequestClose={() => {}}
          >
            {this.pickRide()}
          </Modal>

          {isPage(1) && (
            <View style={styles.container}>
              {this.source()}
              {trailSource()}
              {fileLoading ? <Loading type="spinner" /> : null}
            </View>
          )}

          {isPage(2) && (
            <View style={styles.container}>{this.editTrail()}</View>
          )}

          {isPage(3) && (
            <View style={styles.container}>{this.trailDetails()}</View>
          )}

          {isPage(4) && (
            <View style={styles.container}>{this.trailInfo()}</View>
          )}

          {isPage(5) && (
            <View style={styles.container}>{this.trailSuccessOrError()}</View>
          )}

          {isPage(6) && (
            <View style={styles.container}>
              <TrailPolyline
                coordsFile={
                  this.props.trails.trailCreated.collection
                    .preview_waypoint_list_url
                }
                boundBox={
                  this.props.trails.trailCreated.collection.bounding_box
                }
              />
              <View
                style={{
                  padding: 15,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Text
                  type="title"
                  weight="bold"
                  message={'trails/addPoiAfterCreateTrailText'}
                />

                <Button
                  label="common/addPoint"
                  type="secondary"
                  color={theme.secondaryColor}
                  style={styles.addPoint}
                  textStyle={styles.selectButtonText}
                  onPress={() =>
                    this.props.navigation.navigate({
                      routeName: 'CreatePOI',
                      params: {
                        data: data.trail ? data : ride.preview_track_url,
                        coords: this.state.coords[0], // { latitude: 132112, longitude: 311321321 }
                      },
                    })
                  }
                />
                <TouchableOpacity
                  onPress={() => this.resetNavigationAction()}
                  activeOpacity={0.7}
                >
                  <Text
                    type="title"
                    weight="bold"
                    text={t('common/notNow').toUpperCase()}
                    style={styles.notNow}
                  />
                </TouchableOpacity>
              </View>
            </View>
          )}

          {this.progress()}

          <KeyboardSpacer />
        </View>
      </SafeAreaView>
    )
  }
}

const ArrowIcon = () => (
  <IconImage style={styles.arrowRight} source="nextIcon" />
)

const FatArrow = ({ state, type }) => {
  const arrowStyles = {
    tintColor: state.color ? 'silver' : theme.secondaryColor,
    [type === 'right' ? 'marginLeft' : 'marginRight']: 15,
  }

  const types = {
    left: fatArrowLeft,
    right: fatArrowRight,
  }

  return <Image style={[styles.fatArrow, arrowStyles]} source={types[type]} />
}

const progressStyles = {
  btnDisabled: {
    color: 'silver',
  },
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  wrapper: {
    flex: 1,
    backgroundColor: 'white',
  },
  progressWrapper: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingBottom: 1,
    borderTopWidth: 1,
    borderColor: theme.border,
    backgroundColor: 'white',
  },
  progressBar: {
    width: width * 0.28,
    height: 8,
    backgroundColor: '#eee',
    top: 28,
    borderRadius: 5,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  progressBarValue: {
    height: 8,
    backgroundColor: theme.secondaryColor,
    borderRadius: 5,
  },
  progressIndicator: {
    right: -25,
    top: -5,
    backgroundColor: 'transparent',
  },
  nextButton: {
    alignSelf: 'flex-end',
    paddingHorizontal: theme.paddingHorizontal,
    paddingVertical: 20,
    flexDirection: 'row',
  },
  prevButton: {
    alignSelf: 'flex-start',
    paddingHorizontal: theme.paddingHorizontal,
    paddingVertical: 20,
    flexDirection: 'row',
  },
  nextButtonText: {
    color: theme.secondaryColor,
    fontSize: 17,
  },
  option: {
    width: '100%',
    padding: 15,
    borderBottomWidth: 1,
    borderColor: theme.border,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  source: {
    borderTopWidth: 1,
  },
  optionText: {
    fontSize: 16,
    color: '#818181',
  },
  optionValue: {
    fontSize: theme.font.sizes.default,
    color: '#818181',
    alignSelf: 'center',
    justifyContent: 'flex-end',
  },
  arrowRight: {
    width: 10,
    height: 17,
    alignSelf: 'center',
    marginLeft: 15,
  },
  inline: {
    flexDirection: 'row',
  },
  attachIcon: {
    width: 20,
    height: 20,
    tintColor: '#818181',
    marginRight: 5,
  },
  questionsWrapper: {
    marginTop: 10,
    marginBottom: 20,
    backgroundColor: 'white',
  },
  questionSpacing: {
    paddingHorizontal: theme.paddingHorizontal,
  },
  questionTitle: {
    fontSize: theme.font.sizes.small,
    color: '#7c7c7c',
  },
  swithTitle: {
    flex: 1,
    color: '#7c7c7c',
    fontSize: 16.5,
    textAlign: 'left',
  },
  swithSmallTitle: {
    color: '#b7b7b8',
    fontSize: 11.5,
    textAlign: 'left',
    marginLeft: 15,
    marginTop: -15,
    marginBottom: 20,
  },
  swithContainer: {
    height: 45,
    marginTop: 30,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: theme.paddingHorizontal,
  },
  swithButton: {},
  questionDescription: {
    fontSize: theme.font.sizes.default,
    color: '#b7b7b8',
  },
  feedback: {
    paddingTop: 50,
    alignItems: 'center',
  },
  feedbackText: {
    marginTop: 5,
    color: '#777',
  },
  feedbackTitle: {
    fontSize: 22,
    marginTop: 20,
  },
  feedbackSuccess: {
    color: '#31af91',
  },
  feedbackError: {
    marginLeft: 10,
    color: '#c93636',
  },
  successError: {
    width: 100,
    height: 100,
  },
  fatArrow: {
    width: 12,
    height: 18,
    resizeMode: 'contain',
    top: 1,
    tintColor: theme.secondaryColor,
  },
  inputWrapper: {
    flexDirection: 'column',
    backgroundColor: theme.backgroundColor,
    flex: 1,
  },
  notNow: {
    marginTop: 20,
    color: theme.secondaryColor,
  },
  addPoint: {
    color: theme.secondaryColor,
    marginTop: 20,
    backgroundColor: 'transparent',
  },
  addPoint: {
    borderWidth: 1,
    borderColor: theme.secondaryColor,
    marginTop: 20,
  },
  selectButtonText: {
    fontSize: theme.font.sizes.smallVariation,
  },
  drivingIcon: {
    marginRight: 10,
    width: 25,
    height: 25,
  },
  center: {
    // width,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButton: {
    fontSize: 16,
    color: 'white',
    marginLeft: 10,
  },
})

export default connect(
  state => ({ user: state.user, trails: state.trails }),
  dispatch => ({ actions: bindActionCreators({ ...trailActions }, dispatch) })
)(CreateTrail)
