import React, { PureComponent } from 'react'
import {
  FlatList,
  Image,
  StyleSheet,
  TouchableOpacity,
  View,
  Dimensions,
} from 'react-native'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import idx from 'idx'
import t from '@config/i18n'
import Text from '@components/Text'
import Icon from '@components/Icon'
import TrailPolyline from '@components/TrailPolyline'
import StarRating from '@components/StarRating'
import PoiIcons from '@components/PoiIcons'
import UploadProgress from '@components/UploadProgress'
import Distance from '@components/Distance'
import * as trailsActions from '@actions/trails'
const { width } = Dimensions.get('window')

import { theme } from '@styles/theme'

const TRAIL_IMAGE_SIZE = width / 5

class TrailPassed extends PureComponent {
  state = {
    isFavourite: false,
  }

  static getDerivedStateFromProps(props) {
    const { trail_favorite_id } = props.trail

    if (trail_favorite_id) {
      return {
        isFavourite: true,
      }
    }
    // Return null to indicate no change to state.
    return null
  }

  async componentDidMount() {
    const { value } = await this.props.actions.getTrailPictures(
      this.props.trail.id
    )
    this.setState({ pictures: value.collection })
  }

  itemMiniMap(trail) {
    return (
      <TouchableOpacity
        activeOpacity={0.7}
        onPress={() => this.navigateToTrail(trail)}
      >
        <TrailPolyline
          boundBox={trail.bounding_box}
          coordsFile={trail.preview_waypoint_list_url}
        />
      </TouchableOpacity>
    )
  }

  navigateToTrail = (
    trail,
    scroll = false,
    scrollToAlbumView = false,
    scrollToPoi = false
  ) => {
    this.props.navigation.navigate('TrailDetails', {
      trailId: trail.id,
      callback: this.props.callback ? this.props.callback : () => {},
      scroll,
      scrollToAlbumView,
    })
  }

  toggleTrailFavourite = trail => {
    this.setState(state => ({
      isFavourite: !state.isFavourite,
    }))
    this.props.toggleTrailFavourite(trail)
  }

  render() {
    const { isFavourite } = this.state
    const { progress, showUpload, trail } = this.props

    const trailRating = trail.average_rating ? trail.average_rating : 0
    const hasPictures = idx(trail, _ => _.pictures)

    // poi
    const showPoiTypes = trail.poi_types.length > 0

    return (
      <View style={styles.trailContainer}>
        <View style={styles.trailTitleContainer}>
          <View style={[styles.row, styles.topRow]}>
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => this.toggleTrailFavourite(trail)}
            >
              <Icon
                name="heart"
                style={[
                  styles.trailIcon,
                  isFavourite ? styles.trailIconSelected : null,
                ]}
              />
            </TouchableOpacity>

            <View style={styles.titleContainer}>
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={() => this.navigateToTrail(trail)}
              >
                <Text text={trail.title} style={styles.trailTitle} />
              </TouchableOpacity>

              <View style={styles.trailTitleRow}>
                <StarRating rate={trailRating} />
                <Text
                  type="title"
                  weight="bold"
                  message="trails/numberOfReviews"
                  values={{
                    count: trail.nr_of_reviews,
                  }}
                  style={styles.reviewCountText}
                />
              </View>

              <View style={styles.trailTitleRow}>
                <Icon
                  name={
                    trail.type === 'one_way'
                      ? 'trail_type_one_way_trip'
                      : 'trail_type_round_trip'
                  }
                  style={styles.trailIcon}
                />

                <Distance
                  rowStyle={styles.distanceContainer}
                  distance={trail.distance}
                  distanceStyle={styles.statsText}
                  unitStyle={styles.unit}
                />

                {trail.suitable_for_driving && (
                  <Icon name="driving" style={styles.drivingIcon} />
                )}

                <View style={styles.poiContainer}>
                  {showPoiTypes && (
                    <PoiIcons items={7} poiTypes={trail.poi_types} />
                  )}
                </View>
              </View>
            </View>
          </View>
        </View>
        <View>
          <View>{this.itemMiniMap(trail)}</View>

          {hasPictures && (
            <FlatList
              initialNumToRender={8}
              horizontal={true}
              showsHorizontalScrollIndicator={false}
              data={this.state.pictures}
              getItemLayout={(data, index) => ({
                length: TRAIL_IMAGE_SIZE,
                offset: TRAIL_IMAGE_SIZE * index,
                index,
              })}
              keyExtractor={item => item.id}
              renderItem={({ item }) => (
                <TouchableOpacity
                  activeOpacity={0.7}
                  onPress={() => this.navigateToTrail(trail)}
                >
                  <Image
                    key={item.picture.id}
                    source={{ uri: `${item.picture.url}?t=300x300,fill` }}
                    style={styles.trailImage}
                  />
                </TouchableOpacity>
              )}
            />
          )}
        </View>

        {showUpload ? (
          <UploadProgress
            progress={progress}
            text={t('upload/uploadingImage')}
          />
        ) : (
          <View style={[styles.row, styles.trailButtonRow]}>
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => this.navigateToTrail(trail, false, true)}
              style={styles.buttonContainer}
            >
              <Icon name="add_photo_for_album" style={styles.addPhotoButton} />
            </TouchableOpacity>
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => this.navigateToTrail(trail, true)}
              style={styles.buttonContainer}
            >
              <Text
                weight="bold"
                type="title"
                style={styles.greenButtonText}
                message="rideDetail/addReview"
              />
            </TouchableOpacity>
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => this.navigateToTrail(trail, true, false, true)}
              style={styles.buttonContainer}
            >
              <Text
                weight="bold"
                type="title"
                style={styles.greenButtonText}
                message="common/addPoint"
              />
            </TouchableOpacity>
          </View>
        )}
      </View>
    )
  }
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  topRow: {
    flex: 1,
    alignItems: 'flex-start',
  },
  buttonContainer: {
    marginVertical: 15,
    marginHorizontal: 5,
    backgroundColor: 'white',
    borderRadius: 4,
    borderColor: theme.secondaryColor,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    height: 35,
  },
  greenButtonText: {
    color: theme.secondaryColor,
    fontSize: theme.font.sizes.smallest,
  },
  trailContainer: {
    borderBottomWidth: 1,
    borderBottomColor: theme.border,
  },
  trailTitleContainer: {
    padding: 15,
  },
  titleContainer: {
    flex: 1,
  },
  trailTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 7,
  },
  trailIcon: {
    fontSize: 26,
    marginRight: 10,
    tintColor: theme.fontColorDark,
  },
  drivingIcon: {
    fontSize: 17,
    marginLeft: 10,
    tintColor: theme.fontColorDark,
  },
  trailIconSelected: {
    fontSize: 26,
    marginRight: 10,
    color: '#fdb299',
  },
  trailTitle: {
    ...theme.font.userName,
  },
  trailButtonRow: {
    justifyContent: 'center',
    paddingHorizontal: 10,
  },
  addPhotoButton: {
    fontSize: 20,
    color: theme.secondaryColor,
  },
  trailImage: {
    width: TRAIL_IMAGE_SIZE,
    height: TRAIL_IMAGE_SIZE,
    resizeMode: 'contain',
  },
  poiContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  reviewCountText: {
    paddingLeft: 5,
    fontSize: theme.font.sizes.smallest,
    color: theme.fontColorDark,
  },
  distanceContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'center',
    // paddingBottom: 3,
  },
  statsText: {
    ...theme.font.rideStatusNumber,
  },
  unit: {
    paddingLeft: 4,
    marginBottom: 2,
    ...theme.font.rideStatusLabel,
    marginTop: 6,
  },
})

const mapStateToProps = ({ trails, user }) => ({
  trails,
  user: user.user,
})

const mapDispatchToProps = dispatch => ({
  actions: bindActionCreators(
    {
      ...trailsActions,
    },
    dispatch
  ),
})

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(TrailPassed)
