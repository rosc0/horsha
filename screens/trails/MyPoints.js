import React, { PureComponent } from 'react'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import {
  Alert,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native'

import { mapActions, poiActions, trailActions } from '@actions/index'
import moment from 'moment'
import Autolink from 'react-native-autolink'
import ViewMoreText from 'react-native-read-more-text'
import ActionSheet from 'rn-action-sheet'
import { LATITUDE_DELTA, LONGITUDE_DELTA } from '@components/map/Map'

import { poiLabels } from '@components/PoiIcons'
import Text from '@components/Text'
import Button from '@components/Button'
import ArrowBottomButton from '@components/ArrowOptions'
import Loading from '@components/Loading'
import Icon from '@components/Icon'
import TrailMarker from '@components/TrailMarker'

import { theme } from '@styles/theme'
import t from '@config/i18n'
import { IconImage } from '@components/Icons'

class MyPoints extends PureComponent {
  state = {
    filter: false,
    pois: [],
    specificPoi: null,
  }

  componentDidMount() {
    this.props.actions.getPOIs(null, this.props.userId)
  }

  open = userId => this.props.navigation.navigate('UserProfile', { userId })

  renderViewMore = onPress => (
    <Text
      weight="bold"
      style={styles.toggleText}
      onPress={onPress}
      text={t('trails/viewMore')}
    />
  )

  renderViewLess = onPress => (
    <Text
      weight="bold"
      style={styles.toggleText}
      onPress={onPress}
      text={t('trails/viewLess')}
    />
  )

  createPoi = () => {
    const { navigate, state } = this.props.navigation
    return navigate('CreatePOI', {
      data: {
        chooseLocation: true,
        parentKey: state.routeName,
      },
    })
  }

  empty = () => (
    <View style={styles.containerGray}>
      <View style={styles.emptyImagesWrapper}>
        <IconImage source={'eatery'} style={styles.emptyImage} svg />
        <IconImage
          source={'equestrian_facility'}
          style={styles.emptyImage}
          svg
        />
        <IconImage source={'parking'} style={styles.emptyImage} svg />
      </View>

      <View style={styles.emptyWrapper}>
        <Text
          type="title"
          weight="bold"
          style={styles.emptyTitle}
          message="trails/emptyMyPointsTitle"
        />

        <View style={styles.emptyTextWrapper}>
          <Text
            type="title"
            style={styles.emptyText}
            message="trails/emptyMyPointsText"
          />
        </View>
      </View>
    </View>
  )

  showActionSheet = item => {
    const editText = t('poi/edit')
    const deleteText = t('poi/delete')
    const cancelText = t('common/cancel')

    ActionSheet.show(
      {
        title: t('poi/chooseType'),
        options: [editText, deleteText, cancelText],
        destructiveButtonIndex: 1,
        cancelButtonIndex: 2,
        tintColor: theme.secondaryColor,
      },
      index => this.handleChoose(index, item)
    )
  }

  handleChoose = (index, item) => {
    if (index === 0) {
      this.props.navigation.navigate('EditPOI', { item })
    }

    if (index === 1) {
      this.deletePoi(item)
    }
  }

  deletePoi(item) {
    Alert.alert(
      t('poi/areYouSureTitle'),
      t('poi/areYouSureText'),
      [
        {
          text: t('common/cancel'),
          onPress: () => {},
          style: 'cancel',
        },
        {
          text: t('common/delete'),
          onPress: () => this.props.actions.deletePoi(item.id),
          style: 'destructive',
        },
      ],
      { cancelable: false }
    )
  }

  openModal = () => {
    this.props.navigation.navigate('FilterPOIModal', {
      onSave: this.applyFilter,
      ...this.state,
    })
  }

  applyFilter = ({ pois }) =>
    this.setState({
      pois,
      filter: !this.state.filter,
    })

  openTrails = async coords => {
    await this.props.navigation.state.params.showMap()
    await this.props.actions.setTrailListType('discover')

    await this.props.actions.setLatitudeLongitude(
      {
        latitude: coords.latitude,
        longitude: coords.longitude,
        latitudeDelta: LATITUDE_DELTA,
        longitudeDelta: LONGITUDE_DELTA,
      },
      'poi'
    )
  }

  render() {
    const { fetched: loaded, collection } = this.props.poi
    const { user } = this.props.user
    const { filter, pois: filterPois, specificPoi } = this.state

    let poiList = collection

    const filterActive = filter && filterPois.length > 0

    if (!loaded) {
      return <Loading type="spinner" />
    }

    const viewMoreLess = {
      numberOfLines: 3,
      renderTruncatedFooter: this.renderViewMore,
      renderRevealedFooter: this.renderViewLess,
      readMoreText: 'Less',
      readHideText: 'More',
    }

    if (!collection || !collection.length) {
      return this.empty()
    }

    if (filterActive) {
      poiList = poiList.filter(poi => filterPois.includes(poi.type))
    }

    const selectedPois = () =>
      specificPoi ? poiList.id === specificPoi.id : poiList
    return (
      <View style={styles.container}>
        <View style={styles.filter}>
          <TouchableOpacity
            onPress={() => this.openModal()}
            style={styles.toggleButton}
            activeOpacity={0.7}
          >
            <Icon
              name={filterActive ? 'filter_on' : 'filter_off'}
              tintColor={filterActive ? '#84ebd4' : 'white'}
              style={styles.icon}
            />
            <Text
              weight="bold"
              style={styles.filterText}
              message="trails/filter"
            />
            <Text
              weight="bold"
              style={styles.filterState}
              message={filterActive ? 'trails/on' : 'trails/off'}
            />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.wrapper}>
          {poiList.filter(selectedPois).map((item, i) => (
            <View style={styles.item} key={i}>
              <View style={styles.header}>
                <View style={[styles.head, styles.spacing]}>
                  <Text
                    type="title"
                    weight="bold"
                    style={styles.title}
                    text={poiLabels[item.kind]}
                  />

                  <Text
                    message="poi/byUserOnDate"
                    style={styles.by}
                    values={{
                      user: (
                        <Text
                          weight="bold"
                          style={styles.bold}
                          onPress={() => this.open(user.id)}
                          text={user.name}
                        />
                      ),
                      date: moment(item.date_created).format('LL'),
                    }}
                  />
                </View>

                <ArrowBottomButton
                  onPress={() => this.showActionSheet(item)}
                  wrapperStyle={styles.optionsWrapper}
                  style={styles.optionsImage}
                />
              </View>

              <View style={[styles.content, styles.spacing]}>
                <View style={styles.allCenter}>
                  <IconImage source={item.kind} style={styles.poiIcon} svg />
                </View>
                {item.description.length ? (
                  <ViewMoreText {...viewMoreLess}>
                    <Autolink
                      showAlert
                      linkStyle={styles.link}
                      style={styles.description}
                      text={item.description.replace(/\s{2,}/g, ' ')}
                    />
                  </ViewMoreText>
                ) : null}
              </View>

              <View style={styles.map}>
                <View style={styles.mapOverlay}>
                  <TouchableOpacity
                    activeOpacity={0.7}
                    onPress={() => this.openTrails(item.location)}
                  >
                    <TrailMarker type={item.kind} coords={item.location} />
                  </TouchableOpacity>
                </View>
              </View>

              {/* <View style={styles.buttonWrapper}>
                <TouchableOpacity
                  activeOpacity={0.7}
                  onPress={() => this.openTrails(item.location)}
                  style={styles.buttonOpen}
                >
                  <Text
                    type="title"
                    weight="bold"
                    style={styles.buttonOpenText}
                    message="poi/goToNearByTrails"
                  />
                </TouchableOpacity>
              </View> */}
              <View style={styles.actions}>
                <Button
                  label="poi/goToNearByTrails"
                  style={styles.button}
                  textStyle={styles.buttonText}
                  onPress={() => this.openTrails(item.location)}
                />
              </View>
            </View>
          ))}

          <View>
            <TouchableOpacity
              activeOpacity={0.7}
              style={styles.button}
              onPress={this.createPoi}
            >
              <IconImage style={styles.plusIcon} source="plusIcon" />
              <Text
                type="title"
                weight="bold"
                style={styles.buttonText}
                message="common/addPoint"
              />
            </TouchableOpacity>
          </View>
        </ScrollView>
      </View>
    )
  }
}

const styles = StyleSheet.create({
  containerGray: {
    flex: 1,
    backgroundColor: '#f4f4f4',
    paddingTop: 50,
  },
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  wrapper: {
    flex: 1,
    backgroundColor: 'white',
    paddingBottom: 20,
  },
  allCenter: {
    alignSelf: 'center',
    justifyContent: 'center',
  },
  item: {
    marginBottom: 0,
    borderBottomWidth: 0.8,
    borderColor: '#ddd',
    paddingVertical: 15,
  },
  spacing: {
    paddingHorizontal: theme.paddingHorizontal,
  },
  head: {
    marginBottom: 10,
    flex: 1,
  },
  poiIcon: {
    width: 60,
    height: 60,
    marginVertical: 10,
  },
  title: {
    fontSize: 16,
    color: '#565656',
  },
  by: {
    color: '#757575',
    fontSize: theme.font.sizes.smallVariation,
  },
  bold: {
    color: theme.secondaryColor,
  },
  description: {
    marginTop: 10,
    fontSize: theme.font.sizes.smallVariation,
    lineHeight: 22,
    color: '#757575',
    fontFamily: 'OpenSans',
  },
  map: {
    position: 'relative',
    marginTop: 20,
    marginBottom: 20,
  },
  mapOverlay: {
    width: '100%',
    height: 150,
  },
  link: {
    fontFamily: 'OpenSans-Bold',
    color: theme.secondaryColor,
  },
  toggleText: {
    fontSize: theme.font.sizes.small,
    marginTop: 10,
    fontFamily: 'OpenSans-Bold',
    color: theme.secondaryColor,
  },
  plusIcon: {
    width: 15,
    height: 15,
    resizeMode: 'contain',
    marginRight: 5,
    tintColor: theme.secondaryColor,
  },
  button: {
    marginTop: 40,
    marginBottom: 30,
    padding: 8,
    borderRadius: 4,
    borderWidth: 0.8,
    borderColor: theme.secondaryColor,
    width: 140,
    flexDirection: 'row',
    alignSelf: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    fontSize: theme.font.sizes.small,
    alignSelf: 'center',
    color: theme.secondaryColor,
  },
  emptyWrapper: {
    width: '70%',
    alignSelf: 'center',
  },
  emptyTextWrapper: {
    width: '70%',
    alignSelf: 'center',
  },
  emptyTitle: {
    fontSize: 20,
    textAlign: 'center',
    color: '#595959',
  },
  emptyText: {
    fontSize: theme.font.sizes.default,
    textAlign: 'center',
    marginTop: 10,
    color: '#979797',
  },
  emptyImagesWrapper: {
    justifyContent: 'center',
    flexDirection: 'row',
    marginBottom: 40,
  },
  emptyImage: {
    width: 60,
    height: 60,
    marginHorizontal: 5,
  },
  optionsWrapper: {
    padding: 22,
    paddingRight: 15,
    marginTop: -5,
  },
  optionsImage: {
    width: 24,
    height: 24,
  },
  icon: {
    fontSize: 18,
    marginRight: 5,
  },
  filter: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 10,
  },
  toggleButton: {
    flexDirection: 'row',
    paddingVertical: 10,
    paddingHorizontal: theme.paddingHorizontal,
    backgroundColor: '#5fb1a2',
    borderRightWidth: 1,
    borderRightColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 4,
  },
  filterText: {
    fontSize: theme.font.sizes.default,
    color: 'white',
  },
  filterState: {
    fontSize: theme.font.sizes.default,
    color: 'white',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  buttonWrapper: {
    alignItems: 'flex-end',
    paddingHorizontal: 10,
    marginBottom: 10,
  },
  buttonOpen: {
    borderColor: theme.secondaryColor,
    borderWidth: 1,
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 5,
  },
  buttonOpenText: {
    fontSize: theme.font.sizes.small,
    color: theme.secondaryColor,
  },
  actions: {
    padding: 15,
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  button: {
    ...theme.buttons.custom,
  },
  buttonText: {
    color: theme.secondaryColor,
    fontSize: theme.font.sizes.small,
  },
})

export default connect(
  state => ({
    poi: state.poi,
    user: state.user,
  }),
  dispatch => ({
    actions: bindActionCreators(
      {
        ...poiActions,
        ...mapActions,
        ...trailActions,
      },
      dispatch
    ),
  })
)(MyPoints)
