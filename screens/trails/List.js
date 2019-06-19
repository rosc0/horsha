import React, { PureComponent } from 'react'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import {
  FlatList,
  StyleSheet,
  TouchableOpacity,
  View,
  Platform,
} from 'react-native'
import ActionSheet from 'rn-action-sheet'

import ArrowOptions from '@components/ArrowOptions'
import Text from '@components/Text'
import StarRating from '@components/StarRating'
import PoiIcons from '@components/PoiIcons'
import TrailPolyline from '@components/TrailPolyline'
import Loading from '@components/Loading'
import EmptyTrails from './components/EmptyTrails'
import Button from '@components/Button'

import { calculateDistance } from '@utils'
import { theme } from '@styles/theme'
import t from '@config/i18n'
import * as trailActions from '@actions/trails'
import { IconImage } from '@components/Icons'
import { isIphoneX } from '@utils'

const plusSize = Platform.OS === 'android' ? 5 : isIphoneX() ? 45 : 25
class TrailList extends PureComponent {
  state = {
    region: [],
  }

  // UNSAFE_componentWillReceiveProps(nextProps) {
  //   const { trails } = this.props
  //   const { trails: nextTrails } = nextProps
  //
  //   if (
  //     (trails.length === 0 && nextTrails.length === 0) ||
  //     trails.length === nextTrails.length ||
  //     (trails.length &&
  //       nextTrails.length &&
  //       trails[trails.length - 1].id === nextTrails[nextTrails.length - 1].id)
  //   ) {
  //     return
  //   }
  // }

  toggleFavorite = (trailId, userId) =>
    this.props.toggleFavorite(trailId, userId)

  openDetails = trail =>
    this.props.navigation.navigate('Details', { trailId: trail.id })

  showOptions = (trailCreatorId, userId, id) => {
    const optionsText = t('trails/options')
    const reportContentText = t('trails/reportContent')
    const cancelText = t('common/cancel')
    const deleteTrailText = t('trails/deleteTrail')
    const updateTrailText = t('trails/updateTrail')

    let actionSheetOptions = {
      title: optionsText,
      options: [reportContentText, cancelText],
      cancelButtonIndex: 2,
      tintColor: theme.secondaryColor,
    }

    if (trailCreatorId === userId) {
      actionSheetOptions.options = [
        updateTrailText,
        deleteTrailText,
        cancelText,
      ]

      actionSheetOptions.destructiveButtonIndex = 1
      actionSheetOptions.cancelButtonIndex = 2
    }

    ActionSheet.show(actionSheetOptions, index =>
      this.handleChoose(index, trailCreatorId === userId, id)
    )
  }

  handleChoose = (index, isOwner, id) => {
    const { actions, navigation } = this.props

    if (!isOwner && index === 0) {
      navigation.navigate('Report', { endpoint: `trail/${id}` })
    }

    if (isOwner && index === 0) {
      navigation.navigate('Edit', { id })
    }

    if (isOwner && index === 1) {
      actions.deleteTrail(id)
    }
  }

  itemHeader = (trail, userId, id) => {
    const trailCreatorId = trail.user ? trail.user.id : userId

    return (
      <View style={[styles.row, styles.titleRow, styles.alignTop]}>
        <Text
          weight="bold"
          type="title"
          style={styles.trailTitle}
          text={trail.title}
        />
        <ArrowOptions
          onPress={() => this.showOptions(trailCreatorId, userId, id)}
          wrapperStyle={styles.optionsButton}
        />
      </View>
    )
  }

  itemRating = (itemRate, reviews) => (
    <View style={styles.row}>
      <StarRating rate={itemRate} starWidth={15} starHeight={15} />
      <Text weight="bold" style={styles.rateText} text={reviews} />
    </View>
  )

  itemInfo = trail => {
    const unitSystem = this.props.user.account.preferences.unitSystem
    const unit = unitSystem === 'IMPERIAL' ? 'Mi' : 'KM'

    return (
      <View style={styles.row}>
        <IconImage
          style={styles.trailIcon}
          source={trail.type === 'ROUND_TRIP' ? 'roundTripIcon' : 'oneWayIcon'}
        />
        <Text
          weight="semiBold"
          style={styles.km}
          text={calculateDistance(trail.distance, unitSystem)}
        />
        <Text weight="bold" style={styles.kmLabel} text={unit} />
        {trail.suitableForDriving && (
          <IconImage style={styles.trailIcon} source={'drivingIcon'} svg />
        )}
        {trail.poiKinds.length > 0 && (
          <PoiIcons style={styles.pois} items={7} poiTypes={trail.poiKinds} />
        )}
      </View>
    )
  }

  itemMiniMap(trail) {
    return (
      <View
        style={{ width: '100%', height: 150, flex: 1, position: 'relative' }}
      >
        <TrailPolyline
          boundBox={trail.boundingBox}
          coordsFile={trail.previewWaypointsUrl}
          // coordinates={trail.coordinates}
        />
      </View>
    )
  }

  listItem = (item, userId) => {
    const trail = item.item
    const itemRate = trail.ratingAverage ? Math.round(trail.ratingAverage) : 0
    const { id, favoriteSince } = trail

    return (
      <View key={`tl-${trail.id}`} style={styles.trailItemWrapper}>
        <TouchableOpacity
          onPress={() =>
            this.props.toggleFavorite(!!favoriteSince, id, favoriteSince)
          }
          activeOpacity={0.7}
          style={styles.heartWrapper}
        >
          <IconImage
            style={[styles.heart, favoriteSince ? styles.heartActive : {}]}
            source="likeIcon"
          />
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => this.openDetails(trail)}
          activeOpacity={0.7}
          style={styles.trailItem}
        >
          {this.itemHeader(trail, userId, id)}
          {this.itemRating(itemRate, trail.nr_of_reviews)}
          {this.itemInfo(trail)}
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => this.openDetails(trail)}
          activeOpacity={0.7}
        >
          {this.itemMiniMap(trail)}
        </TouchableOpacity>

        <View style={styles.actions}>
          <Button
            label="newsfeed/follow"
            style={styles.button}
            textStyle={styles.buttonText}
            onPress={() => this.props.onFollowTrail(trail)}
          />

          <Button
            label="common/seeMore"
            style={styles.button}
            textStyle={styles.buttonText}
            onPress={() => this.props.onGoToDetail(trail)}
          />
        </View>
      </View>
    )
  }

  render() {
    const { id } = this.props.user
    const { trailType, trailList, fetching, searchOpened, query } = this.props
    if (fetching) {
      return <Loading type="spinner" />
    }

    return (
      <View
        style={[
          styles.wrapper,
          searchOpened ? { marginTop: 30 + plusSize } : {},
        ]}
      >
        <FlatList
          scrollEventThrottle={2}
          style={styles.scrollView}
          keyExtractor={trail => trail.id}
          data={trailList}
          renderItem={trail => this.listItem(trail, id)}
          ListEmptyComponent={
            <EmptyTrails
              type={trailType}
              isSearch={searchOpened}
              query={query}
            />
          }
        />
      </View>
    )
  }
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    backgroundColor: 'white',
    paddingTop: 60,
  },
  trailItem: {
    width: '90%',
    alignSelf: 'center',
    marginBottom: 10,
    paddingTop: 10,
    paddingLeft: 30,
    position: 'relative',
    zIndex: 10,
  },
  trailItemWrapper: {
    marginBottom: 20,
    position: 'relative',
  },
  heartWrapper: {
    width: 20,
    height: 20,
    position: 'absolute',
    zIndex: 1000,
    left: 20,
    top: 18,
  },
  heart: {
    width: 20,
    height: 20,
    resizeMode: 'contain',
    tintColor: theme.like,
  },
  heartActive: {
    tintColor: theme.likeActive,
  },
  rateText: {
    fontSize: theme.font.sizes.smallest,
    color: 'gray',
    marginLeft: 3,
  },
  trailTitle: {
    fontSize: 16,
    color: '#188280',
    flex: 1,
  },
  km: {
    fontSize: 16,
    color: '#757575',
  },
  kmLabel: {
    fontSize: theme.font.sizes.smaller,
    color: '#757575',
    marginLeft: 2,
    marginRight: 15,
    marginTop: 1,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 5,
  },
  titleRow: {
    justifyContent: 'space-between',
  },
  trailIcon: {
    width: 18,
    height: 18,
    marginRight: 8,
  },
  pois: {
    // marginLeft: 10,
  },
  optionsButton: {
    justifyContent: 'flex-end',
    padding: 10,
    marginRight: -10,
    marginTop: -5,
  },
  alignTop: {
    alignItems: 'flex-start',
  },
  actionsContainer: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'flex-end',
    margin: 15,
  },
  actionButton: {
    borderWidth: 1,
    borderColor: '#188280',
    borderRadius: 5,
    padding: 8,
    marginHorizontal: 5,
  },
  actionButtonText: {
    fontSize: theme.font.sizes.small,
    color: '#188280',
    backgroundColor: 'transparent',
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
    trailList: state.trails.trailsOriginal,
    user: state.user.user,
  }),
  dispatch => ({
    actions: bindActionCreators({ ...trailActions }, dispatch),
  })
)(TrailList)
