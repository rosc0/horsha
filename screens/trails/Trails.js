import React, { PureComponent } from 'react'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import {
  StyleSheet,
  View,
  Text as RNText,
  TouchableOpacity,
} from 'react-native'
import ActionSheet from 'rn-action-sheet'
import store from '@application/store'
import BottomSheet from 'reanimated-bottom-sheet'
import Animated from 'react-native-reanimated'

import {
  mapActions,
  poiActions,
  recordActions,
  trailActions,
  userActions,
} from '@actions/index'

import TrailsMap from './Map'
import TrailsList from './List'

import AddButton from '@components/AddButton'
import Header from '@components/DropdownHeader'
import FilterMenu from './components/FilterMenu'
import NotificationsHeader from '@components/NotificationsHeader'
import MyPoints from './MyPoints'

import t from '@config/i18n'
import { theme } from '@styles/theme'
import { isEmpty } from 'ramda'

import Drawer from './components/Drawer'
import SearchDrawer from './components/SearchDrawer'

class Trails extends PureComponent {
  state = {
    showing: 'map',
    viewType: 'map',
    showPoi: true,
    mapType: 'standard',
    searchOpened: false,
    filterOn: false,
    filters: null,
    needsExpensive: false,
    currentSnap: 0,
  }

  constructor(props) {
    super(props)
    props.navigation.setParams({
      onTabFocus: this.handleTabFocus,
      searchOpened: false,
    })
  }

  static getDerivedStateFromProps(props, state) {
    const { shouldFollowTrailShowTrailList } = props.record
    if (
      (shouldFollowTrailShowTrailList !==
        state.shouldFollowTrailShowTrailList) ===
      'map'
    ) {
      return {
        viewType: 'list',
      }
    }

    // Return null to indicate no change to state.
    return null
  }

  static navigationOptions = ({ navigation }) => {
    const display = navigation.getParam('searchOpened', false)
    const onTabFocus = navigation.getParam('onTabFocus')
    console.log('onTabFocus', onTabFocus)
    return display === true
      ? {
          header: null,
        }
      : {
          headerTitle: (
            <Header navigation={navigation} superAction={() => onTabFocus()} />
          ),
          headerRight: (
            <View style={styles.header}>
              <AddButton
                imageStyle={styles.AddButton}
                onPress={() => navigation.state.params.addTrail()}
              />
              <NotificationsHeader navigation={navigation} />
            </View>
          ),
        }
  }

  handleTabFocus = async () => {
    const { currentSnap } = this.state
    // this._drawer ? await this._drawer._onPress() : await this.showMap()
    // await this.props.actions.setTrailListType('discover')
    await this.bs.current.snapTo(currentSnap)
    await this.setState({ currentSnap: currentSnap === 0 ? 1 : 0 })
  }

  async componentDidMount() {
    this.props.navigation.setParams({
      onTabFocus: this.handleTabFocus,
      addTrail: this.addTrail,
      onNavigation: this.onNavigation,
      showPois: this.showPois,
      showMap: this.showMap,
      showListView: this.showListView,
      handleGoBack: this.handleGoBack,
      clearFilters: this.clearFiltersOnly,
    })
  }

  componentDidUpdate(prevProps) {
    if (
      prevProps.record.shouldFollowTrail !==
        this.props.record.shouldFollowTrail ||
      prevProps.record.shouldFollowTrailShowTrailList !==
        this.props.record.shouldFollowTrailShowTrailList
    ) {
      return this.setState({
        viewType: this.props.record.shouldFollowTrailShowTrailList
          ? 'list'
          : 'map',
      })
    }
  }

  onNavigation = () => {
    this.setState({ searchOpened: false })
  }

  addTrail = () => {
    if (this.state.showing === 'poi') {
      this.addPoi()
      return
    }

    const existingRideText = t('trails/existingRide')
    const gpxFileText = t('trails/gpxFile')
    const sheetTitle = t('trails/createTrailTitle')
    const cancelText = t('common/cancel')

    ActionSheet.show(
      {
        title: sheetTitle,
        options: [existingRideText, gpxFileText, cancelText],
        cancelButtonIndex: 2,
        destructiveButtonIndex: 2,
        tintColor: theme.secondaryColor,
      },
      buttonIndex => {
        if (buttonIndex === 2) return

        this.props.navigation.navigate('Create', {
          type: buttonIndex === 0 ? 'ride' : 'gpx',
        })
      }
    )
  }

  addPoi = () => {
    const { navigate } = this.props.navigation
    return navigate('CreatePOI', {
      data: {
        chooseLocation: true,
        parentKey: 'Trails',
      },
    })
  }

  handleGoBack = () => this.props.navigation.goBack(null)
  showPois = () => this.setState({ showing: 'poi' })
  showMap = () => this.setState({ showing: 'map', viewType: 'map' })
  showListView = () => this.setState({ viewType: 'list', showing: 'list' })

  applyFilters = content => {
    const { user } = this.props.user
    const userId = user.id
    const unitSystem = user.account.preferences.unitSystem

    this.setState({
      filterOn: true,
      filters: content,
    })

    if (content.myTrails) {
      content.creatorUserId = userId
      delete content.myTrails
    }

    if (content.favoriteTrails) {
      content.isFavorite = true
      delete content.favoriteTrails
    }

    if (isEmpty(content.withPoiKinds)) {
      delete content.withPoiKinds
    }

    if (isEmpty(content.withSurfaceTypes)) {
      delete content.withSurfaceTypes
    }

    if (isEmpty(content.withoutSurfaceTypes)) {
      delete content.withoutSurfaceTypes
    }

    if (content.maxDistance) {
      let maxDistance = content.maxDistance

      // convert it back to meters for server request
      if (unitSystem === 'IMPERIAL') {
        maxDistance = Math.round(content.maxDistance * 1609.339)
      } else {
        maxDistance = content.maxDistance * 1000
      }

      content.maxDistance = maxDistance
    }

    if (content.minDistance) {
      let minDistance = content.minDistance

      // convert it back to meters for server request
      if (unitSystem === 'IMPERIAL') {
        minDistance = Math.round(content.minDistance * 1609.339)
      } else {
        minDistance = content.minDistance * 1000
      }

      content.minDistance = minDistance
    }

    this.props.actions.setTrailFilters(content)
    return this.getTrails()
  }

  clearFilters = () => {
    this.clearFiltersOnly()
    this.getTrails()
  }

  clearFiltersOnly = () => {
    this.setState({
      filterOn: false,
      filters: null,
    })
    this.props.actions.setTrailFilters(null)
  }

  getTrails = () => {
    // https://www.apollographql.com/docs/react/essentials/queries.html#manual-query
    const state = store.getState()
    const { map } = state
    const { boundBox } = map
    const { id } = this.props.user.user

    const {
      trails: { trailListType },
      actions,
    } = this.props

    const transformBB = {
      boundingBox: {
        topRight: {
          latitude: boundBox.bb_top_right_latitude,
          longitude: boundBox.bb_top_right_longitude,
        },
        bottomLeft: {
          latitude: boundBox.bb_bottom_left_latitude,
          longitude: boundBox.bb_bottom_left_longitude,
        },
      },
    }
    // TODO: fix set trailListType
    if (trailListType === 'discover') return actions.getTrails(transformBB)
    if (trailListType === 'created') return actions.getUserTrails(id)
    if (trailListType === 'favorites') return actions.getUserFavoriteTrails(id)
    return actions.getTrails(transformBB)
  }

  onClose = () => this.setState({ searchOpened: false })

  resetSource = () => this.props.actions.resetSource()

  goToLocation = (latitude, longitude) => {
    const latitudeDelta = 0.0922
    const longitudeDelta = 0.0421
    this.props.actions.setLatitudeLongitude(
      {
        latitude,
        longitude,
        latitudeDelta,
        longitudeDelta,
      },
      'search'
    )
    this.onClose()
    this._search.close()
  }

  handleFollowTrail = ({ id }) => {
    this.props.actions.followTrail(id)
    this.props.navigation.navigate('RecordModal')
  }

  handleGoToDetails = trail =>
    this.props.navigation.navigate('Details', { trailId: trail.id })

  renderMapOrList = (viewType, trailData) => {
    const {
      trails: { fetching, trailFavorites, trailListType },
      record: { shouldFollowTrail },
    } = this.props

    return viewType !== 'map' ? (
      <TrailsList
        navigation={this.props.navigation}
        trailData={trailData}
        user={this.props.user}
        query={this.state.filters}
        fetching={fetching}
        toggleFavorite={this.props.actions.toggleTrailFavorite}
        trailsFavorites={trailFavorites}
        trailType={trailListType}
        onFollowTrail={this.handleFollowTrail}
        onGoToDetail={this.handleGoToDetails}
        searchOpened={this.state.searchOpened}
      />
    ) : (
      <TrailsMap
        navigation={this.props.navigation}
        resetSource={() => this.resetSource()}
        toggleFavorite={this.props.actions.toggleTrailFavorite}
        trailData={trailData}
        shouldFollowTrail={shouldFollowTrail}
      />
    )
  }

  fall = new Animated.Value(0)
  bs = React.createRef()

  render() {
    const { filters, filterOn, viewType, showing, searchOpened } = this.state
    const {
      trails: { trails, trailsOriginal, trailListType },
      navigation,
    } = this.props

    return (
      <View style={{ backgroundColor: '#2c2c2ff2', flex: 1 }}>
        <Animated.View
          style={{
            flex: 1,
            opacity: Animated.add(0.5, Animated.multiply(this.fall, 0.9)),
          }}
        >
          {showing === 'poi' ? (
            <MyPoints
              userId={this.props.user.user.id}
              navigation={this.props.navigation}
            />
          ) : (
            <View style={styles.wrapper}>
              {this.renderMapOrList(
                viewType,
                filterOn ? trailsOriginal : trails
              )}
              {searchOpened === false && (
                <FilterMenu
                  filterActive={filterOn}
                  viewType={viewType}
                  onSearchPress={() => {
                    this._search.open()
                    this.setState({
                      searchOpened: true,
                    })
                  }}
                  onFilterPress={() => {
                    this.props.navigation.navigate('FilterTrailModal', {
                      onSave: this.applyFilters,
                      onClear: this.clearFilters,
                      viewType: trailListType,
                      filters,
                    })
                  }}
                  onViewTypePress={() => {
                    const viewType =
                      this.state.viewType === 'map' ? 'list' : 'map'
                    this.setState({ viewType })
                  }}
                />
              )}
              <SearchDrawer
                ref={e => (this._search = e)}
                showListView={() => this.showListView()}
                showMap={() => this.showMap()}
                onClosePress={() => this.onClose()}
                showBar={() => navigation.setParams({ searchOpened: true })}
                hideBar={() => navigation.setParams({ searchOpened: false })}
                onItemPress={this.goToLocation}
                trailListType={trailListType}
                onSearchPress={this.applyFilters}
                clearFilters={this.clearFilters}
              />
            </View>
          )}
        </Animated.View>

        <BottomSheet
          ref={this.bs}
          snapPoints={[150, 0]}
          renderContent={this.renderInner}
          renderHeader={this.renderHeader}
          initialSnap={0}
          callbackNode={this.fall}
          enabledInnerScrolling={false}
        />
      </View>
    )
  }

  renderInner = () => (
    <Drawer
      ref={e => (this._drawer = e)}
      navigation={this.props.navigation}
      showPois={this.showPois}
      showMap={this.showMap}
      showListView={this.showListView}
      callBackAction={() => this.bs.current.snapTo(1)}
    />
  )

  renderHeader = () => (
    <View style={stylesModal.header}>
      <TouchableOpacity onPress={() => this.bs.current.snapTo(1)}>
        <View style={stylesModal.panelHeader}>
          <View style={stylesModal.panelHandle} />
        </View>
        <RNText style={stylesModal.panelSubtitle}>Explore trails</RNText>
      </TouchableOpacity>
    </View>
  )
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  AddButton: {
    marginRight: 10,
  },
})

const stylesModal = StyleSheet.create({
  header: {
    backgroundColor: '#FFFFFFF2',
    shadowColor: '#000000',
    paddingTop: 20,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  panelHeader: {
    alignItems: 'center',
    textAlign: 'center',
  },
  panelHandle: {
    width: 40,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#00000040',
    marginBottom: 10,
  },
  panelSubtitle: {
    fontSize: 14,
    color: 'gray',
    height: 30,
    textAlign: 'center',
  },
})

export default connect(
  state => ({
    user: state.user,
    trails: state.trails,
    poi: state.poi,
    record: state.record,
    map: state.map,
  }),
  dispatch => ({
    actions: bindActionCreators(
      {
        ...userActions,
        ...trailActions,
        ...poiActions,
        ...mapActions,
        ...recordActions,
      },
      dispatch
    ),
  })
)(Trails)
