import React, { Component } from 'react'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import {
  Animated,
  Dimensions,
  Image,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native'
import AnimatedTextInput from '@components/AnimatedTextInput'

import KeyboardSpacer from '@components/KeyboardSpacer'

import Text from '@components/Text'
import { icons, poiLabels } from '@components/PoiIcons'
import Map, { Mapbox, Marker, Polyline } from '@components/map/Map'
import Search from '@screens/trails/components/Search'
import HeaderButton from '@components/HeaderButton'
import HeaderTitle from '@components/HeaderTitle'

import { theme } from '@styles/theme'
import t from '@config/i18n'
import filterStyles from '@styles/screens/trails/filter-modal'
import * as poiActions from '@actions/poi'
import { nextIcon } from '@components/Icons'
import { IconImage } from '@components/Icons'

const { width: deviceWidth, height: deviceHeight } = Dimensions.get('window')
const ASPECT_RATIO = deviceWidth / deviceHeight
const LATITUDE_DELTA = 0.00912
const LONGITUDE_DELTA = LATITUDE_DELTA * ASPECT_RATIO

class EditPOI extends Component {
  static navigationOptions = ({ navigation }) => ({
    headerTitle: <HeaderTitle title={'poi/editPoiTitle'} />,
    tabBarVisible: false,
    headerLeft: (
      <HeaderButton onPress={() => navigation.goBack(null)}>
        {t('common/cancel')}
      </HeaderButton>
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
  })

  state = {
    region: {
      latitude: 0,
      longitude: 0,
      latitudeDelta: LATITUDE_DELTA,
      longitudeDelta: LONGITUDE_DELTA,
    },
    firstStepRegion: {
      latitude: 0,
      longitude: 0,
    },
    mapHeight: new Animated.Value(200),
    trailDescription: '',
    pointsOfInterest: [],
    loaded: false,
    polyline: [],
    hasSteps: true,
    stepLoading: true,
    step: 1,
    follow: true,
    showMap: true,
  }

  componentDidMount() {
    const { item } = this.props.navigation.state.params
    const { location = false } = item
    location
      ? this.setState({
          id: item.id,
          stepLoading: false,
          step: location ? 2 : 1,
          firstStepRegion: location,
          region: location,
          trailDescription: item.description.trim(),
          pointsOfInterest: item.type.trim(),
        })
      : this.setState({
          stepLoading: false,
        })

    // const { chooseLocation = false } = this.props.navigation.state.params.item
    // const chooseLocation = false
    // if (!chooseLocation) {
    this.props.navigation.setParams({ handleSave: this.save })
    // }
  }

  handleMapReady = () => {
    const { firstStepRegion, step, region } = this.state
    if (step !== 1 && firstStepRegion.latitude !== 0) {
      this.map.animateToRegion(firstStepRegion)
    }

    if (step === 1 && region.latitude !== 0) {
      this.goToLocation(region.latitude, region.longitude)
    }

    const { trail } = this.props.navigation.state.params.item

    if (trail && trail.file) {
      this.loadTrail(trail.file)
    }
  }

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

  save = () => {
    const {
      region: { latitude, longitude },
      pointsOfInterest: type,
      trailDescription: description,
      id,
    } = this.state

    this.props.actions.editPoi({
      id,
      latitude,
      longitude,
      type,
      description,
    })

    return this.props.navigation.goBack(null)
  }

  setLocation = coords => {
    const { latitudeDelta, longitudeDelta } = this.state.region
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
    const size = this.state.mapHeight._value === 200 ? deviceHeight : 200

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
    this.setState({
      firstStepRegion: {
        latitude: e.geometry.coordinates[1],
        longitude: e.geometry.coordinates[0],
      },
    })
  }

  nextStep = () => {
    const step = this.state.step + 1
    this.setState({ step })

    if (step === 2) {
      this.setLocation(this.state.firstStepRegion)
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

  renderMapStep = () => {
    const { region, polyline, loaded } = this.state
    const { latitude, longitude } = region

    return (
      <Map
        ref={el => {
          if (!!el) {
            this.map = el
          }
        }}
        onMapReady={this.handleMapReady}
        initialRegion={region}
        onPress={() => this.toggleSize()}
        onLongPress={this.handleChangeLocation}
        style={[styles.map, { height: '100%' }]}
      >
        <Marker coordinate={{ latitude, longitude }} />

        {loaded && (
          <Polyline
            coordinates={polyline}
            strokeWidth={4}
            strokeColor={theme.secondaryColor}
          />
        )}
      </Map>
    )
  }

  render() {
    const {
      firstStepRegion,
      pointsOfInterest,
      trailDescription,
      mapHeight,
      stepLoading,
      hasSteps,
      step,
      showMap,
      follow,
    } = this.state

    if (stepLoading) return null

    const pois = Object.keys(poiLabels)

    let nextDoneDisable = false

    if (step === 1 && firstStepRegion.latitude === 0) {
      nextDoneDisable = true
    }

    if (step === 2 && pointsOfInterest.length === 0) {
      nextDoneDisable = true
    }

    if (step === 3) {
      nextDoneDisable = false
    }

    const mode = follow
      ? Mapbox.UserTrackingModes.Follow
      : Mapbox.UserTrackingModes.None

    return (
      <View style={styles.wrapper}>
        {hasSteps && step === 1 && (
          <View style={styles.mapFirstStep}>
            <Search
              style={styles.search}
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
              userTrackingMode={mode}
              onMapReady={this.handleMapReady}
              onPress={this.setPoiLocation}
              onLongPress={this.setPoiLocation}
              style={styles.mapFirstStep}
            >
              {firstStepRegion.latitude ? (
                <Marker
                  coordinate={{
                    latitude: firstStepRegion.latitude,
                    longitude: firstStepRegion.longitude,
                  }}
                />
              ) : null}
            </Map>
          </View>
        )}

        {step === 2 ? (
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
        ) : null}

        {step === 3 ? (
          <View style={styles.wrapper}>
            {!!showMap && (
              <Animated.View style={[styles.map, { height: mapHeight }]}>
                <TouchableOpacity
                  style={styles.fitButton}
                  activeOpacity={0.7}
                  onPress={this.fitToScreen}
                >
                  <View>
                    <Text
                      type="title"
                      weight="bold"
                      style={styles.fitButtonText}
                      message="common/fitToScreen"
                    />
                  </View>
                </TouchableOpacity>

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
        ) : null}

        {hasSteps && (
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

              <TouchableOpacity
                activeOpacity={0.7}
                onPress={this.nextStep}
                style={styles.nextStyle}
                disabled={nextDoneDisable}
              >
                <Text
                  weight="bold"
                  message={step !== 3 ? 'common/next' : 'common/done'}
                  style={[
                    styles.nextPrevText,
                    nextDoneDisable ? { color: 'silver' } : {},
                  ]}
                />
                {step !== 3 && (
                  <Image
                    style={[
                      styles.prevNextIcon,
                      nextDoneDisable ? { tintColor: 'silver' } : {},
                    ]}
                    source={nextIcon}
                  />
                )}
              </TouchableOpacity>
            </View>
          </View>
        )}

        {hasSteps && <KeyboardSpacer />}
      </View>
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
    width: deviceWidth,
    height: deviceHeight,
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
  fitButton: {
    position: 'absolute',
    zIndex: 10,
    backgroundColor: 'white',
    right: 8,
    top: 8,
    borderRadius: 2,
    padding: 5,
    paddingHorizontal: 10,
  },
  fitButtonText: {
    fontSize: theme.font.sizes.smallest,
    color: theme.secondaryColor,
  },
  saveButton: {
    fontSize: 16,
    color: 'white',
    marginRight: 10,
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
})

const mapStateToProps = ({ poi }) => ({
  poi,
})

const mapDispatchToProps = dispatch => ({
  actions: bindActionCreators(poiActions, dispatch),
})

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(EditPOI)
