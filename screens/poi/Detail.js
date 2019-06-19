import React, { Component } from 'react'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import {
  Alert,
  Image,
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
import { LATITUDE_DELTA } from '@components/map/Map'
import { isEmpty } from 'ramda'
import { icons, poiLabels } from '@components/PoiIcons'
import ArrowBottomButton from '@components/ArrowOptions'
import Loading from '@components/Loading'
import HeaderTitle from '@components/HeaderTitle'
import TrailMarker from '@components/TrailMarker'
import AddButton from '@components/AddButton'
import NotificationsHeader from '@components/NotificationsHeader'
import Text from '@components/Text'
import BackButton from '@components/BackButton'

import { theme } from '@styles/theme'
import t from '@config/i18n'
import { IconImage } from '@components/Icons'

class POIDetail extends Component {
  static navigationOptions = ({ navigation }) => ({
    headerTitle: <HeaderTitle title={'poi/point'} />,
    headerRight: (
      <View style={styles.header}>
        <AddButton
          imageStyle={styles.AddButton}
          onPress={() => navigation.state.params.createPoi()}
        />
        <NotificationsHeader navigation={navigation} />
      </View>
    ),
    headerLeft: (
      <BackButton
        onPress={navigation.state.params && navigation.state.params.handleBack}
      />
    ),
  })

  state = {
    filter: false,
    selectedPoi: null,
  }

  componentDidMount() {
    this.props.navigation.setParams({
      createPoi: this.createPoi,
      handleBack: this.handleBack,
    })
  }

  handleBack = () => {
    const { state, navigate, goBack } = this.props.navigation
    const { parentKey, callback } = state.params
    if (parentKey) {
      if (callback) {
        callback()
      }
      return navigate(parentKey)
    } else {
      return goBack(null)
    }
  }

  open = userId => this.props.navigation.navigate('UserProfile', { userId })

  renderViewMore = onPress => (
    <Text
      weight="bold"
      style={styles.toggleText}
      onPress={onPress}
      message={'trails/viewMore'}
    />
  )

  renderViewLess = onPress => (
    <Text
      weight="bold"
      style={styles.toggleText}
      onPress={onPress}
      message="trails/viewLess"
    />
  )

  createPoi = () => {
    this.props.navigation.navigate('CreatePOI', {
      data: {
        chooseLocation: true,
      },
    })
  }

  // createPoi = () => {
  //   const { navigate, state } = this.props.navigation
  //   return navigate('CreatePOI', {
  //     data: {
  //       chooseLocation: true,
  //       parentKey: state.routeName,
  //     },
  //   })
  // }

  empty = () => (
    <View style={styles.containerGray}>
      <View style={styles.emptyImagesWrapper}>
        <Image source={icons.eatery} style={styles.emptyImage} />
        <Image source={icons.equestrian_facility} style={styles.emptyImage} />
        <Image source={icons.parking} style={styles.emptyImage} />
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
          onPress: () => {
            this.props.actions.deletePoi(item.id)
            this.props.navigation.goBack(null)
          },
          style: 'destructive',
        },
      ],
      { cancelable: false }
    )
  }

  openTrails = async coords => {
    const { trailsStack } = this.props.navigation.state.params
    await this.props.actions.setTrailListType('discover')
    await this.props.actions.setLatitudeLongitude(
      {
        latitude: coords.latitude,
        longitude: coords.longitude,
        latitudeDelta: LATITUDE_DELTA,
        longitudeDelta: LATITUDE_DELTA,
      },
      'poi'
    )
    const exit = !!trailsStack
      ? this.props.navigation.goBack(null)
      : this.props.navigation.navigate('Trails')
    return exit
  }
  render() {
    const { fetched: loaded, collection } = this.props.poi
    const { user } = this.props.user
    const { selectedPoi } = this.props.navigation.state.params
    const poi = collection.filter(p => p.id === selectedPoi.id)

    if (!loaded) {
      return <Loading type="spinner" />
    }

    const viewMoreLess = {
      numberOfLines: 3,
      renderTruncatedFooter: this.renderViewMore,
      renderRevealedFooter: this.renderViewLess,
    }

    return (
      <View style={styles.container}>
        <ScrollView style={styles.wrapper}>
          <View style={styles.item}>
            <View style={styles.header}>
              <View style={[styles.head, styles.spacing]}>
                <Text
                  type="title"
                  weight="bold"
                  style={styles.title}
                  text={poiLabels[poi[0].kind]}
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
                    date: moment(poi[0].date_created).format('LL'),
                  }}
                />
              </View>

              <ArrowBottomButton
                onPress={() => this.showActionSheet(poi[0])}
                wrapperStyle={styles.optionsWrapper}
                style={styles.optionsImage}
              />
            </View>

            <View style={[styles.content, styles.spacing]}>
              <IconImage style={styles.poiIcon} source={poi[0].kind} svg />
              {!isEmpty(poi[0].description) && (
                <ViewMoreText {...viewMoreLess}>
                  <Autolink
                    showAlert
                    linkStyle={styles.link}
                    style={styles.description}
                    text={poi[0].description.replace(/\s{2,}/g, ' ')}
                  />
                </ViewMoreText>
              )}
            </View>

            <View style={styles.map}>
              <View style={styles.mapOverlay}>
                <TouchableOpacity
                  activeOpacity={0.7}
                  onPress={() => this.openTrails(poi[0].location)}
                >
                  <TrailMarker type={poi[0].kind} coords={poi[0].location} />
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.buttonWrapper}>
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={() => this.openTrails(poi[0].location)}
                style={styles.buttonOpen}
              >
                <Text
                  type="title"
                  weight="bold"
                  style={styles.buttonOpenText}
                  message="poi/goToNearByTrails"
                />
              </TouchableOpacity>
            </View>
          </View>

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
    alignSelf: 'center',
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
    resizeMode: 'contain',
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
  AddButton: {
    marginRight: 10,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
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
)(POIDetail)
