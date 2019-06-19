import React, { PureComponent } from 'react'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import { Alert, TouchableOpacity, View } from 'react-native'
import ViewMoreText from 'react-native-read-more-text'
import ActionSheet from 'rn-action-sheet'

import Button from '@components/Button'

import t from '@config/i18n'
import * as trailActions from '@actions/trails'
import * as recordActions from '@actions/record'
import * as poiActions from '@actions/poi'
import * as galleryActions from '@actions/gallery'

import StarRating from '@components/StarRating'
import Text from '@components/Text'
import { theme } from '@styles/theme'
import moment from 'moment'
import { ArrowBottomButton, ReviewIcon } from './TrailsIcons'

import { plusIcon } from '@components/Icons'
import { styles } from '@styles/screens/trails/trailDetails'

const sortByOwner = (items, id) =>
  items.reduce((acc, item) => {
    if (!item.user && !item.user.id) return []
    return item.user.id === id ? [item, ...acc] : [...acc, item]
  }, [])

class ReviewsSection extends PureComponent {
  seeMore = (title, data) => {
    const { trailId, userHasReview, ratingAverage } = this.props
    this.props.navigation.navigate('SeeMore', {
      id: trailId,
      title,
      data,
      props: this.props,
      userHasReview,
      ratingAverage,
    })
  }

  navigateTo = (screen, data = {}) =>
    this.props.navigation.navigate(screen, { data })

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

  navigateToProfile = userId =>
    this.props.navigation.navigate('UserProfile', { userId })

  showReviewActionSheet = (review, isOwner) => {
    let options = [t('report/report'), t('common/cancel')]
    let destructiveButtonIndex = 0
    let cancelButtonIndex = 1

    if (isOwner) {
      options = [t('common/edit'), t('common/delete'), t('common/cancel')]
      destructiveButtonIndex = 1
      cancelButtonIndex = 2
    }

    ActionSheet.show(
      {
        title: t('common/chooseYourOption'),
        tintColor: theme.secondaryColor,
        options,
        cancelButtonIndex,
        destructiveButtonIndex,
      },
      index => this.handleActionSheet(index, review, isOwner)
    )
  }

  handleActionSheet = (index, review, isOwner) => {
    if (isOwner) {
      if (index === 0) this.editReview(review)
      if (index === 1) this.deleteReview(review.id)
    } else {
      if (index === 0) this.reportReview(review.id)
    }
  }

  editReview = review => {
    review.trailId = this.props.trailId
    this.props.navigation.navigate('EditReview', { review })
  }

  deleteReview = id => {
    Alert.alert(
      t('trails/areYouSureReviewTitle'),
      t('trails/areYouSureReviewText'),
      [
        {
          text: t('common/cancel'),
          onPress: () => {},
          style: 'cancel',
        },
        {
          text: t('common/delete'),
          onPress: () =>
            this.props.actions.deleteReview(id, this.props.trailId),
          style: 'destructive',
        },
      ],
      { cancelable: false }
    )
  }

  reportReview = id =>
    this.props.navigation.navigate('Report', { endpoint: `review/${id}` })

  render() {
    const viewMoreLess = {
      numberOfLines: 3,
      renderTruncatedFooter: this.renderViewMore,
      renderRevealedFooter: this.renderViewLess,
    }

    const {
      ratingAverage,
      user,
      trailId,
      userHasReview,
      reviews,
      nr_of_reviews,
    } = this.props

    return (
      <View style={[styles.section, styles.noBorder]}>
        <View style={styles.noMarginBottom}>
          <View style={styles.inline}>
            <ReviewIcon style={styles.titleIcon} />
            <Text
              type="title"
              weight="bold"
              style={[styles.title, { top: -2 }]}
              message="trails/reviewsTitleCount"
              values={{
                count: (
                  <Text
                    style={styles.itemLength}
                    weight="semiBold"
                    text={nr_of_reviews}
                  />
                ),
              }}
            />
          </View>
          <View>
            {nr_of_reviews !== 0 && (
              <View style={styles.reviewAverageWrapper}>
                <View style={styles.reviewAverage}>
                  <StarRating
                    rate={Math.round(ratingAverage)}
                    starWidth={22}
                    starHeight={22}
                  />
                  <Text
                    style={styles.reviewWrapperText}
                    message={
                      nr_of_reviews > 1
                        ? 'trails/numberOfReviews'
                        : 'trails/numberOfReview'
                    }
                    values={{ count: nr_of_reviews }}
                  />
                </View>

                <Text
                  style={styles.reviewWrapperText}
                  message="trails/rating"
                  values={{ rating: Math.round(ratingAverage) }}
                />
              </View>
            )}

            {nr_of_reviews === 0 && (
              <Text
                style={styles.noContent}
                message="trails/firstToRateTrail"
              />
            )}

            {reviews &&
              reviews.collection.slice(0, 3).map((review, i) => (
                <View
                  key={`rev-${i}`}
                  style={[
                    styles.reviewList,
                    nr_of_reviews - 1 === i ? styles.noBorder : {},
                  ]}
                >
                  <ArrowBottomButton
                    onPress={() =>
                      this.showReviewActionSheet(
                        review,
                        review.author.id === user.user.id
                      )
                    }
                    style={styles.reviewOptions}
                    wrapperStyle={styles.reviewOptionsWrapper}
                  />

                  <View style={styles.reviewStars}>
                    <StarRating
                      style={styles.starMargin}
                      rate={review.rating}
                      starWidth={15}
                      starHeight={15}
                    />

                    {review.author.id === user.id && (
                      <Text message="trails/owner" style={styles.owner} />
                    )}
                  </View>

                  <View style={styles.byUserName}>
                    <Text
                      style={styles.by}
                      message="trails/pictureBy"
                      values={{
                        user: (
                          <Text
                            weight="bold"
                            onPress={() =>
                              this.navigateToProfile(review.author.id)
                            }
                            style={styles.bold}
                            text={review.author.name}
                          />
                        ),
                        date: moment.unix(review.dateLastUpdated).format('LL'),
                      }}
                    />
                  </View>
                  <ViewMoreText {...viewMoreLess}>
                    <Text style={styles.review} text={review.body} />
                  </ViewMoreText>
                </View>
              ))}

            <View style={styles.actions}>
              {nr_of_reviews > 0 && (
                <Button
                  label="common/seeMore"
                  style={styles.button}
                  textStyle={styles.buttonText}
                  onPress={() => this.seeMore('Reviews', reviews)}
                />
              )}
              {!userHasReview && (
                <Button
                  label="trails/writeReviewCaps"
                  style={styles.button}
                  textStyle={styles.buttonText}
                  onPress={() =>
                    this.navigateTo('CreateReview', {
                      id: trailId,
                      reviews: nr_of_reviews,
                      callback: this.props.navigation.state.params.callback,
                    })
                  }
                  icon={plusIcon}
                />
              )}
            </View>
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
)(ReviewsSection)
