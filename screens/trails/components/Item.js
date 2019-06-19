import React, { PureComponent } from 'react'
import {
  Dimensions,
  Image,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native'

import Icon from '@components/Icon'
import StarRating from '@components/StarRating'
import PoiIcons from '@components/PoiIcons'
import Text from '@components/Text'
import Distance from '@components/Distance'
import { theme } from '@styles/theme'
import { IconImage } from '@components/Icons'
import FavoriteButton from './FavoriteButton'

const { width, height } = Dimensions.get('window')

const isSmallScreen = width < 375
const percentageWidth = 0.8

const itemWidth = width * percentageWidth // 80% of screen
const percentageHeight = height * 0.24
const itemHeight = percentageHeight > 160 ? 160 : percentageHeight //Max size

const cap = s => s.charAt(0).toUpperCase() + s.slice(1)

class TrailItem extends PureComponent {
  toggleFavorite = () => {
    const { id: trailId, favoriteSince } = this.props.trail
    this.props.toggleFavorite(!!favoriteSince, trailId)
  }

  render() {
    const {
      index,
      trail,
      onPress,
      onPressSeeDetails,
      onPressFollowTrail,
    } = this.props
    const poiKinds = trail.poiKinds

    const { pictures } = trail
    const picsLength = pictures.collection.length
    const nr_of_reviews = trail.reviews.collection.length
    const isFavorite = trail && !!trail.favoriteSince

    const itemRate = trail.ratingAverage ? Math.round(trail.ratingAverage) : 0

    const title =
      trail.title.length > 28
        ? trail.title.substring(0, 25) + '...'
        : cap(trail.title)

    return (
      <View style={styles.wrapper}>
        <TouchableOpacity
          activeOpacity={0.8}
          ref={`item${index}`}
          onPress={() => onPress(index)}
          style={[styles.item, { width: itemWidth, height: itemHeight }]}
        >
          <View style={styles.preview}>
            <View
              style={[styles.shadow, !picsLength ? styles.shadowLight : {}]}
            />
            {picsLength ? (
              <Image
                source={{ uri: pictures.collection[0].image.url }}
                style={styles.previewImage}
              />
            ) : null}

            {/* <TouchableOpacity
              style={styles.likeWrapper}
              activeOpacity={1}
              onPress={this.toggleFavorite}
            >
              <IconImage
                style={[styles.like, isFavorite && styles.likeActive]}
                source={isFavorite ? 'likeIcon' : 'heartStroke'}
              />
            </TouchableOpacity> */}
            <FavoriteButton
              trail={trail}
              outline={true}
              styleImage={styles.like}
              style={styles.likeWrapper}
            />
            <Text
              type="title"
              weight="bold"
              numberOfLines={1}
              style={[styles.title, { width: itemWidth - 55 }]}
              text={title}
            />
          </View>

          <View style={[styles.row, styles.topRow]}>
            <IconImage
              style={styles.trailIcon}
              source={
                trail.type === 'round_trip' ? 'roundTripIcon' : 'oneWayIcon'
              }
            />
            {trail.suitable_for_driving && (
              <Icon name="driving" style={styles.carriage} />
            )}

            <Distance
              distance={trail.distance}
              rowStyle={styles.distanceContainer}
              distanceWeight="normal"
              distanceStyle={styles.distance}
              unitStyle={styles.unit}
              unitLowerCase={true}
              decimalPlaces={1}
            />

            {poiKinds.length > 0 && (
              <PoiIcons
                style={[
                  styles.poiRow,
                  isSmallScreen ? { width: 20, height: 17 } : {},
                ]}
                poiTypes={poiKinds}
                items={5}
              />
            )}
          </View>

          <View style={[styles.row, styles.bottomRow]}>
            <StarRating rate={itemRate} style={styles.starRating} spacing={2} />
            <Text
              weight="semiBold"
              style={styles.rateText}
              text={`(${nr_of_reviews})`}
            />

            <View style={styles.buttonsContainer}>
              <TouchableOpacity
                style={styles.trailButton}
                activeOpacity={0.8}
                onPress={() => onPressSeeDetails(trail)}
              >
                <Text
                  type="title"
                  weight="bold"
                  style={styles.detailsText}
                  message="common/seeMore"
                />
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.trailButton, styles.followTrailButton]}
                activeOpacity={0.8}
                onPress={() => onPressFollowTrail(trail)}
              >
                <Text
                  type="title"
                  weight="bold"
                  style={styles.detailsText}
                  message="trails/followTrail"
                />
              </TouchableOpacity>
            </View>
          </View>
        </TouchableOpacity>
      </View>
    )
  }
}

const styles = StyleSheet.create({
  wrapper: {
    width: itemWidth,
    alignItems: 'center',
  },
  item: {
    backgroundColor: 'rgba(255, 255, 255, 0.94)',
    borderRadius: 3,
    overflow: 'hidden',
  },
  row: {
    padding: 10,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderTopLeftRadius: 3,
    borderTopRightRadius: 3,
    justifyContent: 'space-between',
  },
  bottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 0,
    margin: 0,
    justifyContent: 'space-between',
    paddingHorizontal: 7,
    paddingBottom: 10,
  },
  distanceContainer: {
    marginLeft: 7,
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  distance: {
    fontSize: theme.font.sizes.smallVariation,
  },
  unit: {
    marginLeft: 3,
    fontSize: theme.font.sizes.smallVariation,
  },
  preview: {
    backgroundColor: theme.mainColor,
    height: '55%',
    overflow: 'hidden',
    zIndex: 10,
  },
  previewImage: {
    width: '100%',
    height: '100%',
    zIndex: 1,
    position: 'absolute',
    resizeMode: 'cover',
  },
  poiRow: {
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  likeWrapper: {
    position: 'absolute',
    top: 10,
    right: 0,
    width: 40,
    height: 40,
    zIndex: 105,
  },
  like: {
    width: 24,
    height: 24,
    tintColor: theme.like,
    resizeMode: 'contain',
  },
  likeActive: {
    tintColor: theme.likeActive,
  },
  title: {
    zIndex: 100,
    position: 'absolute',
    bottom: 0,
    left: 0,
    elevation: 1,
    padding: 5,
    paddingHorizontal: 10,
    fontSize: 17,
    backgroundColor: 'transparent',
    color: 'white',
  },
  shadow: {
    width: '100%',
    zIndex: 99,
    height: '100%',
    borderTopLeftRadius: 3,
    borderTopRightRadius: 3,
    backgroundColor: 'rgba(0, 0, 0, 0.30)',
  },
  shadowLight: {
    opacity: 0,
  },
  starRating: {
    // marginTop: 2,
  },
  trailIcon: {
    width: 18,
    height: 18,
    tintColor: 'gray',
    resizeMode: 'contain',
  },
  trailButton: {
    alignSelf: 'flex-end',
  },
  followTrailButton: {
    marginLeft: 10,
  },
  detailsText: {
    fontSize: theme.font.sizes.smallVariation,
    color: theme.secondaryColor,
    alignSelf: 'flex-end',
  },
  carriage: {
    fontSize: 18,
    marginLeft: 4,
  },
  rateText: {
    marginTop: 1,
    marginLeft: 3,
    fontSize: 12,
    color: '#afb1b3',
  },
  buttonsContainer: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
})

export default TrailItem
