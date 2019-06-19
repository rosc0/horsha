import React, { PureComponent } from 'react'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import { StyleSheet, TouchableOpacity, View } from 'react-native'

import * as recordActions from '@actions/record'
import { theme } from '@styles/theme'
import Header from './shared/Header'
import Text from '@components/Text'
import Icon from '@components/Icon'
import StarRating from '@components/StarRating'
import PoiIcons from '@components/PoiIcons'
import TrailPolyline from '@components/TrailPolyline'
import Button from '@components/Button'
import Distance from '@components/Distance'
import t from '@config/i18n'
import Interactions from './shared/Interactions'
import { IconImage } from '../Icons'

/*
 * <TrailCreatedUpdate entry={entry} navigate={this.props.navigation.navigate} />
 */

class TrailCreatedUpdate extends PureComponent {
  state = { polyline: null }

  openTrail = trail =>
    this.props.navigate('TrailDetails', { trailId: trail.id })

  onPolylineLoad = polyline => this.setState({ polyline })

  handleFollowTrail = () => {
    const { polyline } = this.state

    if (!polyline) {
      alert(t('newsfeed/cantFollow'))
      return
    }

    const { id } = this.props.entry.post.statusUpdate.subject.trail
    this.props.actions.followTrail(id)
    this.props.navigate('RecordModal')
  }

  render() {
    const { entry, navigate } = this.props
    const firstUser = entry.post.author
    const {
      trail,
      like_id = false,
      nr_of_likes,
      nr_of_comments,
      can_contribute,
    } = entry.post.statusUpdate.subject

    const headerData = {
      firstLink: {
        type: 'person',
        ...firstUser,
      },
      middleText: t('newsfeed/addedTrail'),
      dateCreated: entry.post.dateCreated,
      isPrivate: false,
      shareScope: entry.post.shareScope,
      avatar: firstUser,
    }

    // const { entry, navigate } = this.props
    // const {
    //   subject: { trail },
    //   user,
    //   like_id = false,
    //   nr_of_likes,
    //   nr_of_comments,
    //   can_contribute,
    //   date_created,
    // } = entry.status_update

    // const headerData = {
    //   firstLink: {
    //     type: 'person',
    //     id: user.id,
    //     name: user.name,
    //   },
    //   avatar: user,
    //   middleText: t('newsfeed/addedTrail'),
    //   dateCreated: date_created,
    //   isPrivate: false,
    // }

    // id
    // title
    // poiKinds
    // previewWaypointsUrl
    // dateCreated

    const itemRate = trail.ratingAverage ? Math.round(trail.ratingAverage) : 0
    const nr_of_reviews =
      trail.reviews.collection.length + trail.reviews.pageInfo.remaining

    return (
      <View>
        <Header content={headerData} navigate={navigate} />

        <View style={styles.trailWrapper}>
          <View style={styles.row}>
            <TouchableOpacity onPress={() => this.openTrail(trail)}>
              <Text weight="bold" style={styles.trailName} text={trail.title} />
            </TouchableOpacity>
          </View>

          <View style={[styles.row, styles.inline]}>
            <StarRating rate={itemRate} />
            <Text weight="bold" style={styles.rateText} text={nr_of_reviews} />

            {!trail.suitableForDriving && (
              <Icon name="driving" style={styles.carriage} />
            )}
          </View>

          <View style={[styles.row, styles.inline]}>
            <IconImage
              style={styles.trailIcon}
              source={
                trail.itinerary === 'round_trip'
                  ? 'roundTripIcon'
                  : 'oneWayIcon'
              }
            />
            <Distance
              distance={trail.distance}
              distanceStyle={styles.distance}
              unitStyle={styles.unit}
            />

            {trail.poiKinds && <PoiIcons poiTypes={trail.poiKinds} />}
          </View>
        </View>

        <View style={styles.map}>
          <TouchableOpacity onPress={() => this.openTrail(trail)}>
            <TrailPolyline
              coordsFile={trail.previewWaypointsUrl}
              boundBox={trail.boundingBox}
              onLoad={this.onPolylineLoad}
            />
          </TouchableOpacity>

          <View style={styles.actions}>
            <Button
              label="newsfeed/follow"
              style={styles.button}
              textStyle={styles.buttonText}
              onPress={this.handleFollowTrail}
            />

            <Button
              label="common/seeMore"
              style={styles.button}
              textStyle={styles.buttonText}
              onPress={() => this.openTrail(trail)}
            />
          </View>
        </View>

        {can_contribute && (
          <Interactions
            likes={nr_of_likes}
            comments={nr_of_comments}
            isLiked={!!like_id}
            onLikePress={this.props.onLikePress}
            onCommentPress={this.props.onCommentPress}
          />
        )}
      </View>
    )
  }
}

const styles = StyleSheet.create({
  row: {
    marginTop: 10,
    paddingLeft: 40,
  },
  inline: {
    flexDirection: 'row',
  },
  trailWrapper: {
    paddingHorizontal: theme.paddingHorizontal,
  },
  trailName: {
    ...theme.font.userName,
  },
  carriage: {
    fontSize: theme.font.sizes.defaultPlus,
    marginLeft: 8,
    marginTop: -2,
  },
  rateText: {
    marginTop: -1,
    marginLeft: 5,
    fontSize: theme.font.sizes.small,
    color: '#afb1b3',
  },
  trailIcon: {
    width: 20,
    height: 20,
    tintColor: theme.fontColorDark,
    resizeMode: 'contain',
  },
  distance: {
    marginVertical: 0,
    paddingLeft: 5,
    ...theme.font.rideStatusNumber,
  },
  unit: {
    paddingLeft: 4,
    marginBottom: 2,
    ...theme.font.rideStatusLabel,
    marginTop: 6,
  },
  map: {
    marginTop: 20,
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
  null,
  dispatch => ({
    actions: bindActionCreators(recordActions, dispatch),
  })
)(TrailCreatedUpdate)
