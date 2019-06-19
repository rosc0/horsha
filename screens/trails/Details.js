import React, { PureComponent } from 'react'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import {
  Animated,
  Dimensions,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
  SafeAreaView,
  findNodeHandle,
  RefreshControl,
} from 'react-native'
import {
  VictoryArea,
  VictoryAxis,
  VictoryChart,
  VictoryTheme,
} from 'victory-native'
import ViewMoreText from 'react-native-read-more-text'
import ActionSheet from 'rn-action-sheet'
import PoiIcons, { icons, poiLabels } from '@components/PoiIcons'

import { isEmpty } from 'ramda'
import MapPoi from '@components/map/MapPoi'

import Map, { Marker, Polyline } from '@components/map/Map'
import MapCluster from '../../components/map/MapCluster'

import Loading from '@components/Loading'

import t from '@config/i18n'
import * as trailActions from '@actions/trails'
import * as recordActions from '@actions/record'
import * as poiActions from '@actions/poi'
import * as galleryActions from '@actions/gallery'

import StarRating from '@components/StarRating'
import TrailPolyline from '@components/TrailPolyline'
import Text from '@components/Text'
import { theme } from '@styles/theme'
import moment from 'moment'
import { calculateElevation, calculateDistance, getBBox } from '@utils'
import BackButton from '@components/BackButton'
import {
  ArrowBottomButton,
  DrivingIcon,
  ElevationIcon,
  FollowButton,
} from './components/TrailsIcons'

import {
  locationRed,
  locationGreen,
  horseIcon,
  IconImage,
} from '@components/Icons'
import { Query } from 'react-apollo'
import { GET_TRAIL_BY_ID } from '../../apollo/queries/TrailCollection'
import AlbumSection from './components/AlbumSection'
import ReviewsSection from './components/ReviewsSection'
import PoisSection from './components/PoisSection'

import { styles } from '@styles/screens/trails/trailDetails'
import FavoriteButton from './components/FavoriteButton'

const dimensions = Dimensions.get('window')
const size = { width: dimensions.width, height: dimensions.height }

const avatar = item => {
  return !!item && item.profile_picture
    ? { uri: `${item.profile_picture.url}?t=300x300,fill` }
    : horseIcon
}

const followTrailButtonText = t('trails/followTrail')

const MAP_HEIGHT = 150
class TrailDetail extends PureComponent {
  state = {
    photosModal: false,
    currentPhoto: 1,
    mapLoaded: false,
    polyline: null,
    mapHeight: new Animated.Value(MAP_HEIGHT),
    elevation: [],
    shouldMapBeFullscreen: false,
    region: null,
    showMap: false,
    loading: false,
    picturesData: [],
    picturesCount: 0,
    pois: [],
    boundPois: [],
    selectedPoi: {},
    progress: 0,
    showUpload: false,
    lastImage: {},
    trailId: null,
    refreshing: false,
  }

  static navigationOptions = ({ navigation }) => ({
    tabBarVisible: false,
    headerLeft: (
      <BackButton
        onPress={
          navigation.state.params && navigation.state.params.handleBackButton
        }
      />
    ),
  })

  static getDerivedStateFromProps(props, state) {
    const { navigation } = props
    const trailId = navigation.getParam('trailId', '1')

    if (trailId !== state.trailId) {
      return {
        trailId,
        loading: true,
      }
    }

    return null
  }

  async componentDidMount() {
    const { navigation } = this.props

    const scroll = navigation.getParam('scroll', false)
    const scrollToAlbumView = navigation.getParam('scrollToAlbumView', false)
    const scrollToPoi = navigation.getParam('scrollToPoi', false)

    this.props.navigation.setParams({
      handleBackButton: this.handleBackButton,
    })

    if (scroll) {
      this.timoutId = setTimeout(() => {
        this.scrollView && this.scrollView.scrollToEnd()
      }, 100)
    }
    if (scrollToPoi) {
      this.timoutId = setTimeout(() => {
        this.poisView &&
          this.poisView.measureLayout(
            // I needed to do this to work and measure on android
            findNodeHandle(this.scrollView),
            (x, oy) => this.scrollView.scrollTo({ x, y: oy, animated: true })
          )
      }, 100)
    }
    if (scrollToAlbumView) {
      this.timoutId = setTimeout(() => {
        this.albumView &&
          this.albumView.measureLayout(
            // I needed to do this to work and measure on android
            findNodeHandle(this.scrollView),
            (x, oy) => this.scrollView.scrollTo({ x, y: oy, animated: true })
          )
      }, 100)
    }
  }

  seeMore = () => {
    this.timoutId = setTimeout(() => {
      this.scrollView && this.scrollView.scrollToEnd()
    }, 100)
  }

  handleBackButton = () => {
    const isMapFullscreen = this.state.mapHeight._value > MAP_HEIGHT

    if (isMapFullscreen && this.state.showMap) {
      this.setState({ showMap: false })
      return this.toggleMapSize()
    }

    if (
      this.props.navigation.state.params &&
      this.props.navigation.state.params.callback
    ) {
      this.props.navigation.state.params.callback()
      return this.props.navigation.goBack(null)
    }

    this.props.navigation.goBack(null)
  }

  callbackWithRefresh = () => {
    const { state } = this.props.navigation
    if (state) {
      state.params.callback()
    }
    this.componentDidMount()
  }

  handleFollowTrail = () => {
    const { trailId } = this.state
    this.props.actions.followTrail(trailId)
    this.props.navigation.navigate('RecordModal')
  }

  setLocation = async boundingBox => {
    await this.map.fitBounds([boundingBox.topRight, boundingBox.bottomLeft])
    // The `mapLoaded` on state is being done because sometimes
    // the polyline can be huge and take some time to load
    this.requestBBoxPois(boundingBox)
    this.setState({
      mapLoaded: true,
    })
  }

  requestBBoxPois = async ({ bottomLeft, topRight }) => {
    const latitude = (topRight.latitude + bottomLeft.latitude) / 2
    const longitude = (topRight.longitude + bottomLeft.longitude) / 2
    const bb = await getBBox({ latitude, longitude })
    const req = await this.props.actions.getPOIs(bb)
    this.setState({ boundPois: req.value.collection })
  }

  loadWaypoints = async trail => {
    if (this.state.loading === false) return
    const { fullWaypointsUrl } = trail
    const req = await fetch(fullWaypointsUrl)
    const response = await req.json()

    const polyline = response.reduce(
      (acc, val) => acc.concat({ longitude: val.lng, latitude: val.lat }),
      []
    )

    const elevation = response.reduce(
      (acc, val) => acc.concat({ distance: val.ds, altitude: val.alt }),
      []
    )

    this.setState({ polyline, elevation, loading: false })
  }

  navigateTo = (screen, data = {}) =>
    this.props.navigation.navigate(screen, { data })

  openPOIsAndMap = () => {
    this.scrollView.scrollTo({ x: 0, y: 0, animated: true })
    this.toggleMapSize()
  }

  toggleMapSize = () => {
    const { mapHeight } = this.state
    this.setState({ showMap: !this.state.showMap })
    const newSize =
      mapHeight._value === MAP_HEIGHT ? size.height - 60 : MAP_HEIGHT
    Animated.timing(mapHeight, { toValue: newSize, duration: 200 }).start()
  }

  // renderPagination = (index, total) => (
  //   <View style={styles.paginationWrapper}>
  //     <View style={styles.pagination}>
  //       <Text
  //         type="title"
  //         style={styles.paginationText}
  //         text={index + 1 / total}
  //       />
  //     </View>
  //   </View>
  // )

  renderViewMore = onPress => (
    <TouchableOpacity activeOpacity={0.7} onPress={onPress}>
      <Text
        weight="bold"
        style={styles.toggleText}
        onPress={onPress}
        message="trails/viewMore"
      />
    </TouchableOpacity>
  )

  renderViewLess = onPress => (
    <TouchableOpacity activeOpacity={0.7} onPress={onPress}>
      <Text
        weight="bold"
        style={styles.toggleText}
        onPress={onPress}
        message="trails/viewLess"
      />
    </TouchableOpacity>
  )

  showOptions(trailCreatorId, userId, trailId) {
    const cancel = t('common/cancel')
    const download = t('trails/downloadFile')
    const optionsText = t('common/chooseYourOption')
    const reportContent = t('trails/reportContent')
    const updateTrail = t('trails/updateTrail')
    const deleteTrail = t('trails/deleteTrail')

    let actionSheetOptions = {
      title: optionsText,
      options: [reportContent, cancel],
      cancelButtonIndex: 1,
      tintColor: theme.secondaryColor,
    }

    if (trailCreatorId === userId) {
      actionSheetOptions.options = [updateTrail, deleteTrail, cancel]

      actionSheetOptions.destructiveButtonIndex = 1
      actionSheetOptions.cancelButtonIndex = 2
    }

    ActionSheet.show(actionSheetOptions, index =>
      this.handleChoose(index, trailCreatorId === userId, trailId)
    )
  }

  handleChoose = (index, isOwner, trailId) => {
    const { navigate } = this.props.navigation

    // if (index === 0) {
    //   // TODO: API not ready
    // }

    if (index === 0 && !isOwner) {
      navigate('Report', { endpoint: `trail/${trailId}` })
    }

    if (index === 0 && isOwner) {
      navigate('Edit', { trailId })
    }

    if (index === 1 && isOwner) {
      this.props.actions.deleteTrail(trailId)
      this.props.navigation.goBack(null)
    }
  }

  handleMapReady = bb => this.setLocation(bb)

  navigateToProfile = userId =>
    this.props.navigation.navigate('UserProfile', { userId })

  freeCreatePoi = trail => {
    const {
      boundingBox: { bottomLeft, topRight },
    } = trail
    const latitude = (topRight.latitude + bottomLeft.latitude) / 2
    const longitude = (topRight.longitude + bottomLeft.longitude) / 2

    const geometry = {
      coordinates: [longitude, latitude],
    }
    this.createPOI({ geometry })
  }

  createPOI = ({ geometry }) => {
    const { navigate, state } = this.props.navigation

    navigate('CreatePOI', {
      data: {
        coords: {
          longitude: geometry.coordinates[0],
          latitude: geometry.coordinates[1],
        },
        callback: this.callbackWithRefresh,
        parentKey: state.routeName,
      },
      polyline: this.state.polyline,
    })
  }

  selectPoi = poi => this.setState({ selectedPoi: poi })

  goToPOI = async () => {
    const { selectedPoi } = this.state
    await this.props.navigation.navigate('POIDetail', {
      selectedPoi,
      trailsStack: true,
    })
    return this.selectPoi({})
  }

  renderMap = trail => {
    const {
      mapLoaded,
      polyline,
      mapHeight,
      showMap,
      boundPois,
      selectedPoi,
    } = this.state
    return (
      <Animated.View style={[styles.map, { height: mapHeight }]}>
        {showMap ? (
          <Map
            ref={el => {
              if (!!el) {
                this.map = el
              }
            }}
            compassEnabled={false}
            rotateEnabled={false}
            onPress={() => this.toggleMapSize()}
            onMapReady={() => this.handleMapReady(trail.boundingBox)}
            onLongPress={this.createPOI}
            // onFitBoundsComplete={this.handleFitBounds}
            style={[styles.map, StyleSheet.absoluteFill]}
          >
            {polyline !== null && (
              <React.Fragment>
                <Polyline
                  key="polyline"
                  coordinates={polyline}
                  strokeWidth={4}
                  strokeColor={theme.secondaryColor}
                />
                <Marker
                  key="marker-end"
                  coordinate={polyline[polyline.length - 1]}
                  image={locationRed}
                />
                <Marker
                  key="marker-start"
                  coordinate={polyline[0]}
                  image={locationGreen}
                />
              </React.Fragment>
            )}

            {!isEmpty(boundPois) && (
              <MapCluster pois={boundPois} selectPoi={() => {}} />
            )}
          </Map>
        ) : (
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => this.toggleMapSize()}
            style={styles.map}
          >
            <TrailPolyline
              coordsFile={trail.previewWaypointsUrl}
              boundBox={trail.boundingBox}
            />
          </TouchableOpacity>
        )}

        {!mapLoaded && showMap && (
          <View style={styles.loadingMapContainer}>
            <Loading type="spinner" />
          </View>
        )}
        {!isEmpty(selectedPoi) && (
          <MapPoi
            poi={selectedPoi}
            reset={() => this.selectPoi({})}
            action={this.goToPOI}
          />
        )}
      </Animated.View>
    )
  }

  renderTrailInfos = (trail, unitSystem, nr_of_reviews) => {
    const { user } = this.props.user
    const {
      title,
      creator,
      dateCreated,
      ratingAverage,
      description,
      itinerary,
      distance,
      surfaceTypes,
      elevationSummary,
      suitableForDriving,
      reviews,
      poiKinds,
    } = trail
    const elevationUnit = unitSystem === 'IMPERIAL' ? 'ft' : 'm'
    const distanceUnit = unitSystem === 'IMPERIAL' ? 'Mi' : 'Km'
    const maxAltitudeText = elevationSummary
      ? calculateElevation(elevationSummary.maxAltitude, unitSystem)
      : '0'
    const minAltitudeText = elevationSummary
      ? calculateElevation(elevationSummary.minAltitude, unitSystem)
      : '0'
    const distanceText = calculateDistance(distance, unitSystem)

    return (
      <View style={[styles.section, { paddingVertical: 0 }]}>
        <View style={styles.row}>
          <FavoriteButton trail={trail} style={styles.left} />

          <View style={styles.middle}>
            <Text
              type="title"
              weight="bold"
              style={styles.trailTitle}
              text={title}
            />

            <Text
              style={styles.by}
              message="trails/pictureBy"
              values={{
                user: (
                  <Text
                    weight="bold"
                    onPress={() => this.navigateToProfile(creator.id)}
                    style={styles.bold}
                    text={creator.name}
                  />
                ),
                date: moment.unix(dateCreated).format('LL'),
              }}
            />

            <View style={[styles.rating, styles.inline]}>
              <StarRating rate={ratingAverage} starWidth={20} starHeight={20} />

              {nr_of_reviews > 0 && (
                <TouchableOpacity
                  activeOpacity={0.7}
                  onPress={() => this.seeMore('Reviews', reviews.collection)}
                >
                  <Text
                    type="title"
                    weight="bold"
                    style={[styles.reviewText, styles.bold]}
                    message="trails/numberOfReviews"
                    values={{ count: nr_of_reviews }}
                  />
                </TouchableOpacity>
              )}

              {nr_of_reviews === 0 && (
                <TouchableOpacity
                  activeOpacity={0.7}
                  onPress={() =>
                    this.navigateTo('CreateReview', {
                      id,
                      reviews: nr_of_reviews,
                      callback: this.props.navigation.state.params.callback,
                    })
                  }
                >
                  <Text
                    type="title"
                    weight="bold"
                    style={[styles.reviewText, styles.bold]}
                    message="trails/writeReview"
                    values={{ count: nr_of_reviews }}
                  />
                </TouchableOpacity>
              )}
            </View>
            <View style={styles.rowContainer}>
              {itinerary && (
                <View style={styles.drivingContainer}>
                  <IconImage
                    style={[styles.drivingIcon, { tintColor: '#4d4d4d' }]}
                    source={
                      itinerary === 'round_trip'
                        ? 'roundTripIcon'
                        : 'oneWayIcon'
                    }
                  />
                  <Text
                    style={[styles.by, { color: '#4d4d4d' }]}
                    message={`trails/${
                      itinerary === 'round_trip' ? 'roundTrip' : 'oneWay'
                    }`}
                  />
                </View>
              )}
              {suitableForDriving && (
                <View style={styles.drivingContainer}>
                  <DrivingIcon />
                  <Text
                    style={[styles.by, { color: '#4d4d4d' }]}
                    message="trails/drivingSuitable"
                  />
                </View>
              )}
            </View>
            <View style={[styles.row, styles.noMarginBottom]}>
              {surfaceTypes.map((surface, index) => (
                <React.Fragment key={index}>
                  <Text
                    style={[styles.by, { color: '#4d4d4d', marginRight: 0 }]}
                    message={`trails/${surface.toLowerCase()}`}
                  />
                  {surfaceTypes.length !== index + 1 && (
                    <Text
                      style={[styles.by, { color: '#4d4d4d', marginRight: 5 }]}
                      text={`,`}
                    />
                  )}
                </React.Fragment>
              ))}
            </View>
            {poiKinds.length > 0 && (
              <PoiIcons
                style={{ marginRight: 10, marginBottom: 20 }}
                poiStyle={{
                  width: 23,
                  height: 23,
                  margin: 8,
                }}
                poiTypes={poiKinds}
                items={poiKinds.length}
              />
            )}
            <View>
              <FollowButton
                style={{ marginTop: 0 }}
                onPress={this.handleFollowTrail}
                text={followTrailButtonText}
              />
            </View>
          </View>

          <View style={styles.right}>
            <ArrowBottomButton
              onPress={() => this.showOptions(creator.id, user.id, trail.id)}
              style={styles.optionsButton}
            />
          </View>
        </View>

        <View style={[styles.row, styles.noMarginBottom]}>
          <View style={styles.left} />
          <View style={styles.middleFull}>
            <View style={styles.distanceWrapper}>
              <Text
                type="title"
                weight="bold"
                style={styles.distanceText}
                text={`${distanceText} ${distanceUnit.toLowerCase()}`}
              />
              <IconImage style={styles.distanceIcon} source="ascentIcon" />
              <Text
                type="title"
                weight="bold"
                style={styles.distanceText}
                text={`${maxAltitudeText} ${elevationUnit.toLowerCase()}`}
              />
              <IconImage style={styles.distanceIcon} source="descentIcon" />
              <Text
                type="title"
                weight="bold"
                style={styles.distanceText}
                text={`${minAltitudeText} ${elevationUnit.toLowerCase()}`}
              />
            </View>

            <View style={styles.description}>
              <ViewMoreText
                numberOfLines={3}
                renderTruncatedFooter={this.renderViewMore}
                renderRevealedFooter={this.renderViewLess}
              >
                {description && description.length && (
                  <Text
                    style={styles.descriptionText}
                    text={description.trim()}
                  />
                )}
              </ViewMoreText>
            </View>
          </View>
        </View>
      </View>
    )
  }

  renderElevationSumary = unitSystem => {
    const { elevation } = this.state
    const elevationUnit = unitSystem === 'IMPERIAL' ? 'ft' : 'm'
    let chartTheme = VictoryTheme.material
    chartTheme.axis.style.grid.stroke = '#e9e9e9'
    chartTheme.axis.style.grid.strokeDasharray = '1'

    return (
      <View style={styles.section}>
        <View style={styles.noMarginBottom}>
          <View style={styles.inline}>
            <ElevationIcon style={styles.titleIcon} />
            <Text
              type="title"
              weight="bold"
              style={styles.title}
              message="trails/elevation"
            />
          </View>

          <View>
            <View style={styles.placeholder}>
              {elevation.length !== 0 && (
                <VictoryChart
                  theme={chartTheme}
                  padding={{ top: 15, bottom: 50, right: 15, left: 50 }}
                  height={200}
                >
                  <VictoryArea
                    interpolation="natural"
                    width={size.width}
                    height={200}
                    style={{
                      data: { fill: '#f0f0f0', stroke: '#f0f0f0' },
                    }}
                    data={elevation}
                    y="altitude"
                    x="distance"
                  />

                  <VictoryAxis
                    tickFormat={x => calculateElevation(x, unitSystem)}
                  />
                  <VictoryAxis
                    dependentAxis
                    tickFormat={y => y + elevationUnit}
                  />
                </VictoryChart>
              )}
            </View>
          </View>
        </View>
      </View>
    )
  }

  render() {
    const { user } = this.props.user
    const { navigation } = this.props
    const trailId = navigation.getParam('trailId', '1')

    const { unitSystem } = user.account.preferences

    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
        <Query query={GET_TRAIL_BY_ID} variables={{ trailId }}>
          {({ loading, error, data, refetch, client }) => {
            if (loading) {
              return <Loading type="spinner" />
            }

            if (error) {
              console.warn('@@ err', error)
              return <Loading type="spinner" />
            }
            if (data) {
              const { trail } = data
              const {
                poiKinds,
                reviews,
                ratingAverage,
                pois,
                pictures,
                poiOccurrences,
              } = trail
              const trailPois = pois.collection
              const nr_of_reviews = reviews.collection
                ? Math.round(
                    reviews.collection.length + reviews.pageInfo.remaining
                  )
                : 0

              this.loadWaypoints(trail)

              return (
                <ScrollView
                  refreshControl={
                    <RefreshControl
                      refreshing={this.state.refreshing}
                      onRefresh={() => {
                        this.setState({ refreshing: true })
                        refetch({ trailId }).then(() =>
                          this.setState({
                            refreshing: false,
                          })
                        )
                      }}
                    />
                  }
                  style={styles.wrapper}
                  ref={ref => (this.scrollView = ref)}
                >
                  <View style={styles.wrapper}>
                    {this.renderMap(trail)}

                    {/* DETAILS */}
                    {this.renderTrailInfos(trail, unitSystem, nr_of_reviews)}

                    {/* ELEVATION */}
                    {this.renderElevationSumary(unitSystem)}

                    {/* ALBUM */}
                    <AlbumSection
                      trailId={trailId}
                      pictures={pictures}
                      navigation={this.props.navigation}
                    />

                    {/* TRAIL RIDES
                    <View style={styles.section}>
                      <View style={styles.noMarginBottom}>
                        <View style={styles.inline}>
                          <RideIcon style={styles.titleIcon} />
                          <Text
                            type="title"
                            weight="bold"
                            style={styles.title}
                            message="trails/myHistory"
                          />
                        </View>

                        <View>
                          <View style={styles.rideList}>
                            {trailRides &&
                              trailRides.slice(0, 5).map((item, i) => (
                                <View style={styles.rideRow} key={`ride-${i}`}>
                                  <View>
                                    <Image
                                      style={styles.horseImage}
                                      source={avatar(item.ride.horse)}
                                    />
                                  </View>

                                  <View>
                                    <Text
                                      style={styles.rideTimer}
                                      message="trails/rideTimer"
                                      type="title"
                                      weight="bold"
                                      values={{
                                        time: moment()
                                          .startOf('day')
                                          .seconds(item.duration)
                                          .format('HH:mm:ss'),
                                        durationText: (
                                          <Text
                                            style={styles.rideLabel}
                                            message="trails/duration"
                                          />
                                        ),
                                      }}
                                    />
                                  </View>

                                  <View style={styles.rideDate}>
                                    <Text
                                      style={styles.rideDateText}
                                      text={moment(item.date_created).format(
                                        'ddd, DD MMM YYYY'
                                      )}
                                    />
                                  </View>
                                </View>
                              ))}
                          </View>

                          {trailRides.length === 0 && (
                            <View>
                              <Text
                                style={styles.noContent}
                                message="trails/neverRiddenTrail"
                              />

                              <View style={[styles.inline, styles.alignRight]}>
                                <FollowButton
                                  onPress={this.handleFollowTrail}
                                  style={{ width: 150 }}
                                  text={followTrailButtonText}
                                />
                              </View>
                            </View>
                          )}

                          {trailRides.length > 3 && (
                            <View style={styles.actions}>
                              <Button
                                label="common/seeMore"
                                style={styles.button}
                                textStyle={styles.buttonText}
                                onPress={() =>
                                  this.seeMore('My History', [])
                                }
                              />
                            </View>
                          )}
                        </View>
                      </View>
                    </View> 
                    */}

                    {/* POIS */}
                    {/* {!!poiKinds && poiKinds.length > 0 &&
                      <View
                        ref={ref => (this.poisView = ref)}
                        style={styles.section}
                      >
                        <PoisSection
                          poiKinds={poiKinds}
                          trailPois={trailPois}
                          navigation={this.props.navigation}
                          openPOIsAndMap={this.openPOIsAndMap}
                          freeCreatePoi={() => this.freeCreatePoi(trail)}
                        />
                      </View>} */}
                    {poiOccurrences && (
                      <View
                        ref={ref => (this.poisView = ref)}
                        style={styles.section}
                      >
                        <PoisSection
                          poiKinds={poiKinds}
                          poiOccurrences={poiOccurrences}
                          trailPois={trailPois}
                          navigation={this.props.navigation}
                          openPOIsAndMap={this.openPOIsAndMap}
                          freeCreatePoi={() => this.freeCreatePoi(trail)}
                        />
                      </View>
                    )}

                    {/* REVIEWS */}
                    <ReviewsSection
                      reviews={reviews}
                      ratingAverage={ratingAverage}
                      user={user}
                      trailId={trailId}
                      nr_of_reviews={nr_of_reviews}
                      navigation={this.props.navigation}
                      userHasReview={!!trail.review}
                    />
                  </View>
                </ScrollView>
              )
            }
          }}
        </Query>
      </SafeAreaView>
    )
  }
}

export default connect(
  state => ({
    user: state.user,
    auth: state.auth,
    trails: state.trails,
    poi: state.poi,
    image: state.gallery.images[0] || {},
  }),
  dispatch => ({
    actions: bindActionCreators(
      {
        ...trailActions,
        ...recordActions,
        ...poiActions,
        ...galleryActions,
      },
      dispatch
    ),
  })
)(TrailDetail)
