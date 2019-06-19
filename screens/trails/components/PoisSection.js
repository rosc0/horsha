import React, { PureComponent } from 'react'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import {
  Alert,
  Animated,
  Dimensions,
  Image,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native'
import ViewMoreText from 'react-native-read-more-text'
import ActionSheet from 'rn-action-sheet'
import PoiIcons, { icons, poiLabels } from '@components/PoiIcons'
import Button from '@components/Button'

import t from '@config/i18n'
import * as trailActions from '@actions/trails'
import * as recordActions from '@actions/record'
import * as poiActions from '@actions/poi'
import * as galleryActions from '@actions/gallery'

import Text from '@components/Text'
import { theme } from '@styles/theme'
import { calculateDistance } from '@utils'
import { ArrowBottomButton, LocationIcon } from './TrailsIcons'

const dimensions = Dimensions.get('window')
const size = { width: dimensions.width, height: dimensions.height }
import { styles } from '@styles/screens/trails/trailDetails'

const MAP_HEIGHT = 150
class PoisSection extends PureComponent {
  toggleMapSize = () => {
    const { mapHeight } = this.state
    this.setState({ showMap: !this.state.showMap })
    const newSize =
      mapHeight._value === MAP_HEIGHT ? size.height - 60 : MAP_HEIGHT
    Animated.timing(mapHeight, { toValue: newSize, duration: 200 }).start()
  }

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

  showOptions(trailCreatorId, userId) {
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
      this.handleChoose(index, trailCreatorId === userId)
    )
  }

  handleChoose = (index, isOwner) => {
    const { navigate } = this.props.navigation
    const { id } = this.props.trails.trailDetails

    // if (index === 0) {
    //   // TODO: API not ready
    // }

    if (index === 0 && !isOwner) {
      navigate('Report', { endpoint: `trail/${id}` })
    }

    if (index === 0 && isOwner) {
      navigate('Edit', { id })
    }

    if (index === 1 && isOwner) {
      this.props.actions.deleteTrail(id)
      this.props.navigation.goBack(null)
    }
  }

  navigateToProfile = userId =>
    this.props.navigation.navigate('UserProfile', { userId })

  showPoiActionSheet = (item, isOwner) => {
    let options = [t('poi/edit'), t('poi/delete'), t('common/cancel')]
    let destructiveButtonIndex = 1
    let cancelButtonIndex = 2

    if (!isOwner) {
      options = [t('report/report'), t('common/cancel')]
      destructiveButtonIndex = 0
      cancelButtonIndex = 1
    }

    ActionSheet.show(
      {
        title: t('chooseType'),
        options,
        destructiveButtonIndex,
        cancelButtonIndex,
        tintColor: theme.secondaryColor,
      },
      index => this.handlePoiActionSheet(index, item, isOwner)
    )
  }

  handlePoiActionSheet = (index, item, isOwner) => {
    const { navigate } = this.props.navigation
    if (isOwner) {
      if (index === 0) {
        navigate('EditPOI', { item })
      }

      if (index === 1) {
        this.deletePoi(item)
      }
    }

    if (!isOwner) {
      if (index === 0) {
        navigate('Report', { endpoint: `review/${item.id}` })
      }
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

  render() {
    const { user } = this.props.user
    const { unitSystem } = user.account.preferences
    const {
      poiKinds,
      trailPois,
      openPOIsAndMap,
      freeCreatePoi,
      poiOccurrences,
    } = this.props
    const distanceUnit = unitSystem === 'IMPERIAL' ? 'Mi' : 'Km'

    const viewMoreLess = {
      numberOfLines: 3,
      renderTruncatedFooter: this.renderViewMore,
      renderRevealedFooter: this.renderViewLess,
    }

    return (
      <View style={styles.noMarginBottom}>
        <View style={styles.inline}>
          <LocationIcon style={styles.titleIcon} />
          {poiOccurrences.length > 0 && (
            <Text
              type="title"
              weight="bold"
              style={styles.title}
              message="trails/pointsOfInterestCount"
              values={{
                count: (
                  <Text
                    weight="semiBold"
                    style={styles.itemLength}
                    text={poiOccurrences
                      .map(p => p.count)
                      .reduce((total, current) => total + current)}
                  />
                ),
              }}
            />
          )}
        </View>
        {poiKinds.length > 0 && (
          <View style={{ marginLeft: 25 }}>
            <Text
              type="title"
              weight="bold"
              style={[styles.title, { color: '#7c7c7c', marginTop: 20 }]}
              message="trails/poiTypes"
            />
            <PoiIcons
              poiOccurrences={poiOccurrences}
              style={{ marginRight: 10 }}
              poiStyle={{
                width: 23,
                height: 23,
                margin: 8,
              }}
              poiTypes={poiKinds}
              items={poiKinds.length}
            />
          </View>
        )}
        <View>
          {/* // TODO: we need to talk about */}
          {/* <View style={styles.listPois}>
            {trailPois.length > 0 &&
              trailPois.map((item, i) => (
                <View style={styles.poiItem} key={`tr-${i}`}>
                  <ArrowBottomButton
                    onPress={() =>
                      this.showPoiActionSheet(
                        item.poi,
                        item.poi.creator.id === user.id
                      )
                    }
                    style={styles.reviewOptions}
                    wrapperStyle={styles.reviewOptionsWrapper}
                  />

                  <View style={styles.poiIconWrapper}>
                    <Image
                      source={icons[item.poi.kind]}
                      style={styles.poiIcon}
                    />
                  </View>

                  <View style={styles.poiContent}>
                    <Text
                      weight="bold"
                      style={styles.poiTitle}
                      message="trails/poiDistanceFromStart"
                      values={{
                        poiType: poiLabels[item.poi.kind],
                        distance: calculateDistance(
                          item.distance_from_start,
                          unitSystem
                        ),
                        unit: distanceUnit,
                      }}
                    />
                    <View style={styles.viewMorePoi}>
                      <ViewMoreText {...viewMoreLess}>
                        <Text
                          style={styles.poiText}
                          text={item.poi.description.trim()}
                        />
                      </ViewMoreText>
                    </View>
                  </View>
                </View>
              ))
            }
          </View> */}

          <View style={styles.actions}>
            {trailPois.length > 0 && (
              <Button
                label="trails/seeMoreOnMap"
                style={styles.button}
                textStyle={styles.buttonText}
                onPress={() => openPOIsAndMap()}
              />
            )}
            <Button
              label="trails/addPoint"
              style={styles.button}
              textStyle={styles.buttonText}
              onPress={() => freeCreatePoi()}
            />
          </View>
        </View>
      </View>
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
)(PoisSection)
