import React, { Component } from 'react'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import {
  Animated,
  Dimensions,
  Image,
  Platform,
  ScrollView,
  TouchableOpacity,
  View,
  SafeAreaView,
  Keyboard,
  StyleSheet,
  TouchableWithoutFeedback,
} from 'react-native'
import AnimatedTextInput from '@components/AnimatedTextInput'

import Text from '@components/Text'
import { icons, poiLabels } from '@components/PoiIcons'
import Map, { Marker, Polyline } from '@components/map/Map'
import Search from '@screens/trails/components/Search'
import HeaderButton from '@components/HeaderButton'
import KeyboardSpacer from '@components/KeyboardSpacer'
import HeaderTitle from '@components/HeaderTitle'

import { theme } from '@styles/theme'
import t from '@config/i18n'
import filterStyles from '@styles/screens/trails/filter-modal'
import * as poiActions from '@actions/poi'
import MapCluster from '../../components/map/MapCluster'
import { getBBox } from '@utils'
import {
  IconImage,
  locationRed,
  locationGreen,
  locationYellow,
} from '@components/Icons'

const { width: deviceWidth, height: deviceHeight } = Dimensions.get('window')
const ASPECT_RATIO = deviceWidth / deviceHeight
const LATITUDE_DELTA = 0.00912
const LONGITUDE_DELTA = LATITUDE_DELTA * ASPECT_RATIO

class CreatePOI extends Component {
  static navigationOptions = ({ navigation }) => ({
    headerTitle: <HeaderTitle title={'poi/poiTitle'} />,
    tabBarVisible: false,
    tabBarIcon: ({ tintColor }) => (
      <IconImage source="trailsIcon" style={[theme.icon, { tintColor }]} />
    ),
    headerLeft: (
      <HeaderButton onPress={() => navigation.goBack(null)}>
        {t('common/cancel')}
      </HeaderButton>
    ),
  })

  state = {
    region: {
      latitude: 0,
      longitude: 0,
      latitudeDelta: LATITUDE_DELTA,
      longitudeDelta: LONGITUDE_DELTA,
    },
    firstStepRegion: false,
    mapHeight: new Animated.Value(350),
    trailDescription: '',
    pointsOfInterest: [],
    loaded: false,
    polyline: [],
    hasSteps: true,
    stepLoading: true,
    step: 1,
    follow: true,
    showMap: true,
    poisCollection: [],
    isLoaded: false,
    hideElements: false,
  }

  static getDerivedStateFromProps(props, state) {
    const {
      data = false,
      coords = false,
      polyline,
    } = props.navigation.state.params
    const { poi, map } = props

    // if coords from create route
    if (coords && coords !== state.region) {
      return {
        stepLoading: false,
        firstStepRegion: true,
        region: coords,
      }
    }
    // if coords.data from create route
    if (
      state.region.latitude === 0 &&
      data.coords &&
      data.coords !== state.region
    ) {
      return {
        stepLoading: false,
        firstStepRegion: true,
        region: data.coords,
      }
    }
    // if coords.data.trail from create route
    if (!coords && !!data.trail && data.trail !== state.region) {
      return {
        stepLoading: false,
        firstStepRegion: true,
        region: data.trail,
      }
    }

    if (polyline && polyline !== state.polyline) {
      return {
        polyline,
        loaded: true,
      }
    }

    // from create without coords
    if (
      state.firstStepRegion === false &&
      !coords &&
      data.chooseLocation === true &&
      map.region !== state.region
    ) {
      return {
        stepLoading: false,
        firstStepRegion: true,
        region: map.region,
      }
    }

    if (poi.collection !== state.poisCollection) {
      return {
        poisCollection: poi.collection,
      }
    }
    return {
      stepLoading: false,
    }
  }

  componentDidMount() {
    this.keyboardDidShowListener = Keyboard.addListener(
      'keyboardDidShow',
      this.keyboardDidShow
    )
    this.keyboardDidHideListener = Keyboard.addListener(
      'keyboardDidHide',
      this.keyboardDidHide
    )

    const {
      chooseLocation = false,
      trail,
    } = this.props.navigation.state.params.data
    !chooseLocation &&
      this.props.navigation.setParams({ handleSave: this.save })

    if (trail && trail.url) {
      this.loadTrail(trail.url)
    }
  }

  keyboardDidShow = () => this.setState({ hideElements: true })

  keyboardDidHide = () => this.setState({ hideElements: false })

  requestPois = center => this.props.actions.getPOIs(getBBox(center))

  loadTrail = url => {
    fetch(url)
      .then(req => req.json())
      .then(data => {
        const polylineCoords = data.reduce(
          (acc, val) => acc.concat({ longitude: val.lng, latitude: val.lat }),
          []
        )
        this.setState({ polyline: polylineCoords, loaded: true })
      })
      .catch(() => {})
  }

  save = async () => {
    const {
      id = false,
      callback,
      adictionalCallback = false,
      parentKey,
    } = this.props.navigation.state.params.data
    const {
      region: { latitude, longitude },
      pointsOfInterest,
      trailDescription,
    } = this.state
    const { navigate, goBack } = this.props.navigation

    if (id) {
      await this.props.actions.addPoiByTrail(
        {
          latitude,
          longitude,
          type: pointsOfInterest,
          description: trailDescription,
        },
        id
      )
    } else {
      const { value } = await this.props.actions.addPoi({
        latitude,
        longitude,
        type: pointsOfInterest,
        description: trailDescription,
      })
      this.setState({ step: 1 })
      if (callback) {
        callback()
      }
      if (adictionalCallback) {
        adictionalCallback()
      }
      return navigate('POIDetail', {
        selectedPoi: value,
        parentKey,
        callback,
      })
    }
    if (callback) {
      callback()
    }
    if (adictionalCallback) {
      adictionalCallback()
    }
    return goBack(null)
  }

  setLocation = coords => {
    const {
      latitudeDelta = LATITUDE_DELTA,
      longitudeDelta = LONGITUDE_DELTA,
    } = this.state.region
    const { latitude, longitude } = coords
    const region = { latitude, longitude, latitudeDelta, longitudeDelta }

    this.setState({ region })
  }

  handleChangeLocation = ({ geometry }) =>
    this.setLocation({
      latitude: geometry.coordinates[1],
      longitude: geometry.coordinates[0],
    })

  check = item => {
    const pois = this.state.pointsOfInterest
    const indexOfPoi = pois.indexOf(item)

    const pointsOfInterest = indexOfPoi >= 0 ? [] : item

    this.setState({ pointsOfInterest })
  }

  fitToScreen = () => this.map.animateToRegion(this.state.region)

  toggleSize = () => {
    const size = this.state.mapHeight._value === 350 ? deviceHeight : 350

    Animated.timing(this.state.mapHeight, {
      toValue: size,
      duration: 300,
    }).start()
  }

  scrollToDescription = () => {
    const { descriptionView, scrollView } = this.refs

    descriptionView.measure((fx, fy) => scrollView.scrollTo({ y: fy }))
  }

  setPoiLocation = e => {
    return this.setState({
      region: {
        latitude: e.geometry.coordinates[1],
        longitude: e.geometry.coordinates[0],
      },
    })
  }

  nextStep = () => {
    const step = this.state.step + 1
    this.setState({ step })

    if (step === 2) {
      this.setLocation(this.state.region)
    }

    if (step === 4) {
      this.save()
    }
  }

  prevStep = () => {
    this.setState(state => ({
      step: state.step - 1,
    }))
  }

  goToLocation = (latitude, longitude) => {
    this.setState({ follow: false })
    this.mapChoose.animateToRegion({
      latitude,
      longitude,
    })
  }

  onClose = () => this.setState({ follow: true })

  componentWillUnmount() {
    if (this.keyboardDidShowListener) {
      this.keyboardDidShowListener.remove()
    }
    if (this.keyboardDidHideListener) {
      this.keyboardDidHideListener.remove()
    }
  }

  renderTrail = () => {
    const { loaded, polyline } = this.state
    return (
      loaded && (
        <React.Fragment>
          <Marker
            key="marker-start"
            coordinate={polyline[0]}
            image={locationGreen}
          />
          <Marker
            key="marker-end"
            coordinate={polyline[polyline.length - 1]}
            image={locationRed}
          />
          <Polyline
            key="polyline"
            coordinates={polyline}
            strokeWidth={4}
            strokeColor={theme.secondaryColor}
          />
        </React.Fragment>
      )
    )
  }

  renderMapStep = () => {
    const { region } = this.state
    const { latitude, longitude } = region

    return (
      <Map
        ref={el => {
          if (!!el) {
            this.map = el
          }
        }}
        initialRegion={region}
        onPress={this.setPoiLocation}
        onLongPress={this.setPoiLocation}
        style={[styles.map, { height: '100%' }]}
      >
        <Marker
          id="Marker"
          coordinate={{ latitude, longitude }}
          image={locationYellow}
        />
        {this.renderTrail()}
      </Map>
    )
  }

  render() {
    const {
      region,
      firstStepRegion,
      pointsOfInterest,
      trailDescription,
      mapHeight,
      hasSteps,
      step,
      showMap,
      poisCollection,
      hideElements,
    } = this.state

    // if (stepLoading) return null

    const pois = Object.keys(poiLabels)

    let nextDoneDisable = false

    if (step === 1 && firstStepRegion && region.latitude === 0) {
      nextDoneDisable = true
    }

    if (step === 2 && pointsOfInterest.length === 0) {
      nextDoneDisable = true
    }

    if (step === 3) {
      nextDoneDisable = false
    }

    return (
      <SafeAreaView style={[styles.wrapper, { backgroundColor: '#fff' }]}>
        <View style={styles.wrapper}>
          {hasSteps && step === 1 && (
            <View style={styles.mapFirstStep}>
              <Search
                style={styles.search}
                trailListType={'discover'}
                onItemPress={this.goToLocation}
                onClosePress={this.onClose}
                autoFocus={false}
              />

              <Map
                ref={el => {
                  if (!!el) {
                    this.mapChoose = el
                  }
                }}
                initialRegion={region}
                onMapReady={this.handleMapReady}
                onPress={this.setPoiLocation}
                onLongPress={this.setPoiLocation}
                style={styles.mapFirstStep}
              >
                {region.latitude !== 0 && (
                  <Marker
                    key="marker-end"
                    coordinate={{
                      latitude: region.latitude,
                      longitude: region.longitude,
                    }}
                    image={locationYellow}
                  />
                )}
                {poisCollection.length > 0 && (
                  <MapCluster poi={poisCollection} selectPoi={() => {}} />
                )}
                {this.renderTrail()}
              </Map>
            </View>
          )}

          {step === 2 && (
            <View style={styles.wrapper}>
              <ScrollView style={{ backgroundColor: 'white' }}>
                <Text
                  type="title"
                  weight="bold"
                  style={[styles.label, styles.margin]}
                  message="poi/selectCategory"
                />

                {pois.map((item, i) => {
                  const isChecked = pointsOfInterest.indexOf(item) >= 0

                  return (
                    <TouchableOpacity
                      key={`fp${i}`}
                      activeOpacity={0.7}
                      onPress={() => this.check(item)}
                    >
                      <View style={filterStyles.poiItemText}>
                        <View
                          style={[
                            styles.radio,
                            isChecked ? filterStyles.checkBoxActive : {},
                          ]}
                        >
                          {isChecked && (
                            <IconImage
                              source="checkIcon"
                              style={filterStyles.checkIcon}
                              svg
                              fill={theme.secondaryColor}
                            />
                          )}
                        </View>
                        <Image
                          source={icons[item]}
                          style={filterStyles.poiIcon}
                        />
                        <Text style={styles.poiText} text={poiLabels[item]} />
                      </View>
                    </TouchableOpacity>
                  )
                })}
                <View style={styles.paddingBottom} />
              </ScrollView>
            </View>
          )}

          {step >= 3 && (
            <TouchableWithoutFeedback
              onPress={() => {
                Keyboard.dismiss()
              }}
            >
              <View style={styles.wrapper}>
                {!hideElements && (
                  <Animated.View style={[styles.map, { height: mapHeight }]}>
                    {this.renderMapStep()}
                  </Animated.View>
                )}
                <View ref="descriptionView">
                  <AnimatedTextInput
                    ref="name"
                    label={t('poi/writeADescription')}
                    value={trailDescription}
                    inputContainerStyle={{
                      borderTopWidth: 0,
                    }}
                    multiLine={true}
                    defaultMultiLineHeight={70}
                    onChangeText={trailDescription =>
                      this.setState({ trailDescription })
                    }
                    onFocus={() => this.setState({ showMap: false })}
                    onBlur={() => this.setState({ showMap: true })}
                  />
                </View>
              </View>
            </TouchableWithoutFeedback>
          )}

          {step < 4 && (
            <View style={[styles.stepView, { height: step === 1 ? 90 : 50 }]}>
              {step === 1 && (
                <Text
                  type="title"
                  message="trails/firstStepText"
                  style={styles.stepTitle}
                />
              )}

              <View style={styles.steps}>
                <TouchableOpacity
                  activeOpacity={0.7}
                  onPress={this.prevStep}
                  disabled={step === 1}
                  style={[styles.prevStyle]}
                >
                  <IconImage
                    style={[
                      styles.prevNextIcon,
                      step === 1 ? { tintColor: 'silver' } : {},
                    ]}
                    source="prevIcon"
                  />

                  <Text
                    weight="bold"
                    message="common/previous"
                    style={[
                      styles.nextPrevText,
                      step === 1 ? { color: 'silver' } : {},
                    ]}
                  />
                </TouchableOpacity>

                <View style={styles.bullets}>
                  <View
                    style={[
                      styles.bullet,
                      step !== 1 ? { backgroundColor: 'silver' } : {},
                    ]}
                  />
                  <View
                    style={[
                      styles.bullet,
                      step !== 2 ? { backgroundColor: 'silver' } : {},
                    ]}
                  />
                  <View
                    style={[
                      styles.bullet,
                      step !== 3 ? { backgroundColor: 'silver' } : {},
                    ]}
                  />
                </View>
                {!hideElements ? (
                  <TouchableOpacity
                    activeOpacity={0.7}
                    onPress={this.nextStep}
                    style={styles.nextStyle}
                    disabled={nextDoneDisable}
                  >
                    <Text
                      weight="bold"
                      message={step !== 3 ? 'common/next' : 'common/create'}
                      style={[
                        styles.nextPrevText,
                        nextDoneDisable ? { color: 'silver' } : {},
                      ]}
                    />
                    {step !== 3 && (
                      <IconImage
                        style={[
                          styles.prevNextIcon,
                          nextDoneDisable ? { tintColor: 'silver' } : {},
                        ]}
                        source="nextIcon"
                      />
                    )}
                  </TouchableOpacity>
                ) : (
                  <TouchableOpacity
                    activeOpacity={0.7}
                    onPress={() => {
                      Keyboard.dismiss()
                    }}
                    style={styles.nextStyle}
                    disabled={nextDoneDisable}
                  >
                    <Text
                      weight="bold"
                      message={'common/done'}
                      style={[
                        styles.nextPrevText,
                        nextDoneDisable ? { color: 'silver' } : {},
                      ]}
                    />
                    {step !== 3 && (
                      <IconImage
                        style={[
                          styles.prevNextIcon,
                          nextDoneDisable ? { tintColor: 'silver' } : {},
                        ]}
                        source="nextIcon"
                      />
                    )}
                  </TouchableOpacity>
                )}
              </View>
            </View>
          )}

          {hasSteps && Platform.OS === 'ios' && <KeyboardSpacer />}
        </View>
      </SafeAreaView>
    )
  }
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    backgroundColor: theme.backgroundColor,
  },
  map: {
    width: deviceWidth,
    position: 'relative',
  },
  mapFirstStep: {
    flex: 1,
  },
  label: {
    fontSize: theme.font.sizes.defaultPlus,
    color: 'gray',
    marginBottom: 10,
    marginTop: 5,
  },
  poiText: {
    fontSize: theme.font.sizes.smallVariation,
    color: '#7b7b7b',
  },
  margin: {
    marginLeft: 10,
  },
  paddingBottom: {
    paddingBottom: 30,
  },
  radio: {
    width: 24,
    height: 24,
    borderWidth: 2,
    borderColor: 'gray',
    marginRight: 10,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepView: {
    alignSelf: 'flex-end',
    width: '100%',
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderColor: '#eee',
  },
  prevNextIcon: {
    width: 8,
    height: 16,
    resizeMode: 'contain',
    tintColor: theme.secondaryColor,
    marginTop: 2,
  },
  steps: {
    paddingTop: 15,
    paddingHorizontal: theme.paddingHorizontal,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  prevStyle: {
    flexDirection: 'row',
    width: 100,
  },
  nextStyle: {
    flexDirection: 'row',
    width: 100,
    justifyContent: 'flex-end',
  },
  stepTitle: {
    fontSize: theme.font.sizes.small,
    alignSelf: 'center',
    paddingVertical: 12,
  },
  nextPrevText: {
    color: theme.secondaryColor,
    fontSize: theme.font.sizes.default,
    marginHorizontal: 5,
  },
  bullets: {
    flexDirection: 'row',
    justifyContent: 'center',
    flex: 1,
  },
  bullet: {
    width: 8,
    height: 8,
    backgroundColor: theme.secondaryColor,
    borderRadius: 10,
    marginHorizontal: 5,
  },
  search: {
    // width: deviceWidth,
    position: 'absolute',
    top: 10,
    right: 0,
    left: 0,
    zIndex: 120,
  },
})

const mapStateToProps = ({ poi, auth, map }) => ({
  poi,
  auth,
  map,
})

const mapDispatchToProps = dispatch => ({
  actions: bindActionCreators(poiActions, dispatch),
})

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(CreatePOI)
