import React, { PureComponent } from 'react'
import {
  Dimensions,
  Image,
  ScrollView,
  Switch,
  TouchableOpacity,
  View,
} from 'react-native'

import { connect } from 'react-redux'
import MultiSlider from '@components/MultiSlider'
import { icons, poiLabels } from '@components/PoiIcons'
import HeaderTitle from '@components/HeaderTitle'
import Text from '@components/Text'
import HeaderButton from '@components/HeaderButton'
import { theme } from '@styles/theme'

import { calculateDistance } from '@utils'
import t from '@config/i18n'
import filterStyles from '@styles/screens/trails/filter-modal'
import Panel from './components/Panel'
import { IconImage, userIcon } from '@components/Icons'
import { toggle } from '@utils'
import StarRating from '../../components/StarRating'

const { width } = Dimensions.get('window')

const INITIAL_STATE = {
  itinerary: 'all',
  minDistance: 0,
  maxDistance: 500,
  suitableForDriving: false,
  withPoiKinds: [],
  withSurfaceTypes: ['ASPHALT', 'DIRT_ROAD', 'GRASS', 'GRAVEL', 'SAND'],
  withoutSurfaceTypes: ['unlabeled'],
  myTrails: false,
  favoriteTrails: false,
  showAllSurfaces: true,
  prevFilters: false,
  minimalRating: 0,
}

class FilterModal extends PureComponent {
  state = {
    ...INITIAL_STATE,
  }

  static navigationOptions = ({ navigation }) => ({
    headerTitle: <HeaderTitle title={'trails/filter'} />,
    tabBarVisible: false,
    headerLeft: (
      <HeaderButton onPress={() => navigation.goBack(null)}>
        <IconImage
          source="closeIcon"
          resizeMode="contain"
          style={filterStyles.closeIcon}
        />
      </HeaderButton>
    ),
    headerRight: (
      <HeaderButton
        textStyle={{ paddingRight: 17, paddingLeft: 0 }}
        onPress={navigation.state.params && navigation.state.params.save}
      >
        {t('common/apply')}
      </HeaderButton>
    ),
  })

  static getDerivedStateFromProps(props, state) {
    // const { unit_system: unitSystem } = props.user.account.preferences
    const { filters, viewType } = props.navigation.state.params

    if (!!filters && state.prevFilters === false) {
      return {
        ...filters,
        minDistance:
          filters.minDistance &&
          filters.minDistance > 1000 &&
          filters.minDistance / 1000 !== state.minDistance
            ? filters.minDistance / 1000
            : 0,
        maxDistance:
          filters.maxDistance &&
          filters.maxDistance > 1000 &&
          filters.maxDistance / 1000 !== state.maxDistance
            ? filters.maxDistance / 1000
            : 500,
        myTrails: filters.user_id ? true : false,
        favoriteTrails: filters.favoriteForUserId ? true : false,
        showAllSurfaces: filters.withSurfaceTypes === state.withSurfaceTypes,
        prevFilters: true,
      }
    }

    return null
  }

  componentDidMount() {
    this.props.navigation.setParams({ save: this.save })
  }

  save = () => {
    const {
      withoutSurfaceTypes,
      itinerary,
      suitableForDriving,
      withSurfaceTypes,
    } = this.state
    const { navigation } = this.props
    // if withoutSurfaceTypes['unlabeled'] i need to puth withSurfaceTypes
    // or not I need to send without "withSurfaceTypes" to API
    if (withSurfaceTypes.includes('unlabeled')) {
      // if have unlabeled remove unlabeled word
      // and staty with "withSurfaceTypes"
      withSurfaceTypes.splice(withSurfaceTypes.indexOf('unlabeled'), 1)
    }

    if (withoutSurfaceTypes.includes('unlabeled')) {
      // if have unlabeled remove unlabeled word
      // and staty with "withSurfaceTypes"
      withoutSurfaceTypes.splice(withoutSurfaceTypes.indexOf('unlabeled'), 1)
    } else {
      // remove from state key "withSurfaceTypes"
      delete this.state['withSurfaceTypes']
    }

    if (itinerary === 'all') {
      delete this.state['itinerary']
    }

    if (suitableForDriving === false) {
      delete this.state['suitableForDriving']
    }

    delete this.state['prevFilters']
    delete this.state['showAllSurfaces']

    navigation.state.params.onSave(this.state)
    navigation.goBack(null)
  }

  check = item => {
    const pois = this.state.withPoiKinds
    const withPoiKinds = toggle(pois, item)

    this.setState({ withPoiKinds })
  }

  toggleShowAllSurfaces = () =>
    this.setState({ showAllSurfaces: !this.state.showAllSurfaces })

  checkSurfacesWithout = item => {
    const {
      withoutSurfaceTypes: surfaceList,
      withSurfaceTypes: withSurface,
    } = this.state
    const withoutSurfaceTypes = toggle(surfaceList, item.value)
    const withSurfaceTypes = toggle(withSurface, item.value)
    this.setState({ withoutSurfaceTypes, withSurfaceTypes })
  }

  clearAllSettings = () => {
    const { navigation } = this.props
    this.setState(INITIAL_STATE)
    navigation.state.params.onClear()
    navigation.goBack(null)
  }

  clearFilters = i => (
    <View style={filterStyles.row} key={i}>
      <View
        style={[
          filterStyles.rowItem,
          { paddingVertical: 0, marginTop: 15, marginBottom: 15 },
        ]}
      >
        <TouchableOpacity
          activeOpacity={0.7}
          style={[filterStyles.poiItem, { paddingVertical: 15, marginTop: 5 }]}
          onPress={() => this.clearAllSettings()}
        >
          <Text
            weight="semiBold"
            style={filterStyles.labelClear}
            message="trails/clearFilter"
          />
        </TouchableOpacity>
      </View>
    </View>
  )

  types(i) {
    const { itinerary } = this.state
    const typeShowAll = itinerary === 'all'
    const typeOneWay = itinerary === 'ONE_WAY'
    const typeRoundTrip = itinerary === 'ROUND_TRIP'

    return (
      <Panel active={itinerary} key={i}>
        <View style={filterStyles.rowItem}>
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => this.setState({ itinerary: 'all' })}
          >
            <View style={filterStyles.trailPoiItem}>
              <View style={filterStyles.poiItemText}>
                <Text style={filterStyles.poiText} message="trails/showAll" />
              </View>
              <View
                style={[
                  filterStyles.checkbox,
                  typeShowAll ? filterStyles.checkBoxActive : {},
                ]}
              >
                {typeShowAll && (
                  <IconImage
                    source="checkIcon"
                    style={filterStyles.checkIcon}
                    svg
                    fill={theme.secondaryColor}
                  />
                )}
              </View>
            </View>
          </TouchableOpacity>
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => this.setState({ itinerary: 'ONE_WAY' })}
          >
            <View style={filterStyles.trailPoiItem}>
              <View style={filterStyles.poiItemText}>
                <Text style={filterStyles.poiText} message="trails/oneWay" />
              </View>
              <View
                style={[
                  filterStyles.checkbox,
                  typeOneWay ? filterStyles.checkBoxActive : {},
                ]}
              >
                {typeOneWay && (
                  <IconImage
                    source="checkIcon"
                    style={filterStyles.checkIcon}
                    svg
                    fill={theme.secondaryColor}
                  />
                )}
              </View>
            </View>
          </TouchableOpacity>
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => this.setState({ itinerary: 'ROUND_TRIP' })}
          >
            <View style={filterStyles.trailPoiItem}>
              <View style={filterStyles.poiItemText}>
                <Text style={filterStyles.poiText} message="trails/roundTrip" />
              </View>
              <View
                style={[
                  filterStyles.checkbox,
                  typeRoundTrip ? filterStyles.checkBoxActive : {},
                ]}
              >
                {typeRoundTrip && (
                  <IconImage
                    source="checkIcon"
                    style={filterStyles.checkIcon}
                    svg
                    fill={theme.secondaryColor}
                  />
                )}
              </View>
            </View>
          </TouchableOpacity>
        </View>
      </Panel>
    )
  }

  driving(i) {
    const { suitableForDriving, favoriteTrails, myTrails } = this.state
    const { viewType } = this.props.navigation.state.params

    const profilePicture =
      (!!this.props.user.profile_picture &&
        this.props.user.profile_picture.url && {
          uri: this.props.user.profile_picture.url,
        }) ||
      userIcon

    return (
      <View style={filterStyles.row} key={i}>
        <View
          style={[
            filterStyles.rowItem,
            { paddingVertical: 0, marginBottom: 5 },
          ]}
        >
          <View style={filterStyles.trailPoiItem}>
            <View style={filterStyles.poiItemText}>
              <IconImage source="drivingIcon" style={filterStyles.poiIcon} />
              <Text
                style={filterStyles.poiText}
                message="trails/drivingSuitableOnly"
              />
            </View>
            <Switch
              onValueChange={value =>
                this.setState({ suitableForDriving: value })
              }
              value={suitableForDriving}
              trackColor={{ true: theme.secondaryColor }}
            />
          </View>
          {viewType === 'discover' && (
            <View style={filterStyles.trailPoiItem}>
              <View style={filterStyles.poiItemText}>
                <IconImage
                  source="likeIcon"
                  resizeMode="contain"
                  style={filterStyles.heartIcon}
                />
                <Text
                  style={filterStyles.poiText}
                  message="trails/onlyFavorite"
                />
              </View>
              <Switch
                onValueChange={value =>
                  this.setState({ favoriteTrails: value })
                }
                value={favoriteTrails}
                trackColor={{ true: theme.secondaryColor }}
              />
            </View>
          )}
          {viewType === 'discover' && (
            <View style={filterStyles.trailPoiItem}>
              <View style={filterStyles.poiItemText}>
                <View style={filterStyles.avatarIcon}>
                  <Image
                    source={profilePicture}
                    resizeMode="cover"
                    style={filterStyles.avatarIcon}
                  />
                </View>
                <Text style={filterStyles.poiText} message="trails/onlyMy" />
              </View>
              <Switch
                onValueChange={value => this.setState({ myTrails: value })}
                value={myTrails}
                trackColor={{ true: theme.secondaryColor }}
              />
            </View>
          )}
        </View>
      </View>
    )
  }

  showAllSurfaces(i) {
    const { showAllSurfaces } = this.state

    return (
      <View style={filterStyles.row} key={i}>
        <Text
          weight="bold"
          style={filterStyles.label}
          message="trails/surfaceTypes"
        />
        <View style={filterStyles.rowItem}>
          <TouchableOpacity
            key={`fp${i}`}
            activeOpacity={0.7}
            onPress={() => this.toggleShowAllSurfaces()}
          >
            <View style={filterStyles.trailPoiItem}>
              <Text
                style={filterStyles.poiItemText}
                text={t('trails/showAll')}
              />
              <View style={[filterStyles.checkbox]}>
                {showAllSurfaces && (
                  <IconImage
                    source="checkIcon"
                    style={filterStyles.checkIcon}
                    svg
                    fill={theme.secondaryColor}
                  />
                )}
              </View>
            </View>
          </TouchableOpacity>
        </View>
      </View>
    )
  }

  withoutSurfaceTypes(i) {
    const { withoutSurfaceTypes, showAllSurfaces } = this.state

    const asphaltText = t('trails/asphalt')
    const dirtRoadText = t('trails/dirtRoad')
    const grassText = t('trails/grass')
    const gravelText = t('trails/gravel')
    const sandText = t('trails/sand')
    const unlabeledText = t('trails/unlabeled')

    const surfaceList = [
      { label: asphaltText, value: 'ASPHALT' },
      { label: dirtRoadText, value: 'DIRT_ROAD' },
      { label: grassText, value: 'GRASS' },
      { label: gravelText, value: 'GRAVEL' },
      { label: sandText, value: 'SAND' },
      { label: unlabeledText, value: 'unlabeled' },
    ]
    return !showAllSurfaces ? (
      <View style={filterStyles.row} key={i}>
        <Text
          weight="bold"
          style={filterStyles.label}
          message="trails/exclude"
        />
        <View style={filterStyles.rowItem} key={i}>
          {surfaceList.map((item, i) => {
            const isChecked = withoutSurfaceTypes.indexOf(item.value) >= 0
            return (
              <TouchableOpacity
                key={`fp${i}`}
                activeOpacity={0.7}
                onPress={() => this.checkSurfacesWithout(item)}
              >
                <View style={filterStyles.trailPoiItem}>
                  <Text style={filterStyles.poiItemText} text={item.label} />
                  <View
                    style={[
                      filterStyles.checkbox,
                      isChecked ? filterStyles.checkBoxActive : {},
                    ]}
                  >
                    {isChecked && (
                      <IconImage
                        source="checkIcon"
                        style={filterStyles.checkIcon}
                        svg
                        fill={theme.mainColor}
                      />
                    )}
                  </View>
                </View>
              </TouchableOpacity>
            )
          })}
          {/* <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => this.setState({ withoutSurfaceTypes: [] })}
          >
            <View style={filterStyles.trailPoiItem}>
              <Text style={filterStyles.poiItemText} text={unlabeledText} />
              <View
                style={[
                  filterStyles.checkbox,
                  withoutSurfaceTypes.length === 0 ? filterStyles.checkBoxActive : {},
                ]}
              >
                {withoutSurfaceTypes.length === 0 && (
                  <IconImage
                    source="checkIcon"
                    style={filterStyles.checkIcon}
                    svg
                    fill={theme.mainColor}
                  />
                )}
              </View>
            </View>
          </TouchableOpacity> */}
        </View>
      </View>
    ) : null
  }

  multiSliderValuesChange = values => {
    this.setState({
      minDistance: values[0],
      maxDistance: values[1],
    })
  }

  distance(i) {
    const { minDistance, maxDistance } = this.state

    const { unit_system: unitSystem } = this.props.user.account.preferences
    const distanceUnit = unitSystem === 'IMPERIAL' ? 'Mi' : 'Km'

    const sliderMax = Math.round(calculateDistance(500000, unitSystem)) // 500km or equivalent

    const max = Math.round(maxDistance)
    const min = Math.round(minDistance)

    return (
      <View style={[filterStyles.row, filterStyles.rowSurface]} key={i}>
        <Text
          weight="bold"
          style={filterStyles.label}
          message="trails/distance"
        />
        <View style={filterStyles.distanceWrapper}>
          <Text
            style={[filterStyles.distance, { width: width - 50 }]}
            text={`${min} to ${max} ${distanceUnit}`}
          />
          <MultiSlider
            containerStyle={{ paddingTop: 25 }}
            values={[minDistance, maxDistance]}
            sliderLength={width - 60}
            onValuesChange={this.multiSliderValuesChange}
            min={0}
            max={sliderMax}
            step={1}
          />
        </View>
      </View>
    )
  }

  pois(i) {
    const { withPoiKinds } = this.state
    const pois = Object.keys(poiLabels)

    return (
      <View style={filterStyles.row} key={i}>
        <Text
          weight="bold"
          style={filterStyles.label}
          message="trails/withPointsOfInterest"
        />
        <View style={filterStyles.rowItem}>
          {pois.map((item, i) => {
            const isChecked = withPoiKinds.indexOf(item) >= 0

            return (
              <TouchableOpacity
                key={`fp${i}`}
                activeOpacity={0.7}
                onPress={() => this.check(item)}
              >
                <View style={filterStyles.poiItemNearby}>
                  <View style={filterStyles.poiItemTextContainer}>
                    <Image source={icons[item]} style={filterStyles.poiIcon} />
                    <Text
                      style={filterStyles.poiItemText}
                      text={poiLabels[item]}
                    />
                  </View>
                  <View
                    style={[
                      filterStyles.checkbox,
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
                </View>
              </TouchableOpacity>
            )
          })}
        </View>
      </View>
    )
  }

  rating(i) {
    const { minimalRating } = this.state

    return (
      <View style={filterStyles.row} key={i}>
        <Text
          weight="bold"
          style={filterStyles.label}
          message="trails/ratings"
        />
        <View
          style={[
            filterStyles.rowItem,
            { /*alignItems: 'center',*/ justifyContent: 'center' },
          ]}
        >
          <StarRating
            readOnly={false}
            maxRate={5}
            rate={minimalRating}
            starWidth={22}
            starHeight={22}
            spacing={22}
            style={{ padding: 11 }}
            onRateChange={minimalRating => this.setState({ minimalRating })}
          />
        </View>
      </View>
    )
  }

  render() {
    const methods = [
      'clearFilters',
      'driving',
      'types',
      'distance',
      'showAllSurfaces',
      'withoutSurfaceTypes',
      'rating',
      'pois',
    ]

    const view = methods.map((f, i) => this[f](i))
    return (
      <View style={filterStyles.wrapper}>
        <ScrollView style={filterStyles.wrapper}>{view}</ScrollView>
      </View>
    )
  }
}

const mapStateToProps = ({ user }) => ({
  user: user.user,
})

export default connect(mapStateToProps)(FilterModal)
