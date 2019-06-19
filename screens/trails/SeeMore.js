import React, { PureComponent } from 'react'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import { Alert, Image, ScrollView, TouchableOpacity, View } from 'react-native'
import moment from 'moment'
import ActionSheet from 'rn-action-sheet'

import * as trailActions from '@actions/trails'
import * as poiActions from '@actions/poi'
import { theme } from '@styles/theme'
import t from '@config/i18n'

import TrailMarker from '@components/TrailMarker'
import AddButton from '@components/AddButton'
import StarRating from '@components/StarRating'
import Text from '@components/Text'
import { icons, poiLabels } from '@components/PoiIcons'
import { ArrowBottomButtonComponent, IconImage } from '@components/Icons'
import { GET_TRAIL_REVIEWS } from '../../apollo/queries/TrailCollection'
import { Query } from 'react-apollo'
import Loading from '@components/Loading'

const url = 'https://static.pexels.com/photos/24205/pexels-photo.jpg'

const createNew = (type, navigation) => {
  const actionType = {
    [t('trails/seeMoreReviews')]: () =>
      navigation.navigate('CreateReview', {
        data: { id: navigation.state.params.id, type: 'trail' },
      }),

    [t('trails/seeMoreNearby')]: () =>
      navigation.navigate('CreatePOI', {
        data: {
          trail: navigation.state.params.data.trail,
          id: navigation.state.params.id,
          parentKey: navigation.state.key,
        },
      }),
    [t('trails/seeMoreHistory')]: () => navigation.navigate('CreateRide'),
  }

  actionType[type]()
}

const isPoi = title => title === t('trails/seeMoreNearby')
const isReview = title => title === t('trails/seeMoreReviews')
const isRides = title => title === t('trails/seeMoreHistory')

const addBorder = (item, index) =>
  item.length - 1 === index ? styles.noBorder : {}

const rate = items => {
  if (!items.length) return 0
  if (items.length === 1) return items[0].rating

  const total = items.reduce((acc, val) => acc + val.rating, 0)
  const itemsLength = items.length

  return Math.round(total / itemsLength)
}

const hasReviews = (reviews, id) =>
  reviews.some(review => review.author.id === id)

class SeeMore extends PureComponent {
  static navigationOptions = ({ navigation }) => ({
    title: navigation.state.params.title,
    headerRight: (() => {
      const { props, title, userHasReview = false } = navigation.state.params

      if (isReview(title) && userHasReview) {
        return null
      }

      return (
        <AddButton
          onPress={() => createNew(navigation.state.params.title, navigation)}
        />
      )
    })(),
  })

  state = {
    reviewSort: 0,
    reviewShow: 0,
  }

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
      index => this.handleReviewActionSheet(index, review, isOwner)
    )
  }

  handleReviewActionSheet = (index, review, isOwner) => {
    if (isOwner) {
      if (index === 0) this.editReview(review)
      if (index === 1) this.deleteReview(review.id)
    } else {
      if (index === 0) this.reportReview(review.id)
    }
  }

  editReview = review => {
    review.trailId = this.props.navigation.state.params.id
    this.props.navigation.navigate('EditReview', { review })
  }

  deleteReview = id => {
    const { id: trailId } = this.props.navigation.state.params

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
          onPress: () => this.props.actions.deleteReview(id, trailId),
          style: 'destructive',
        },
      ],
      { cancelable: false }
    )
  }

  reportReview = id => {
    const { navigate } = this.props.navigation

    navigate('Report', { endpoint: `review/${id}` })
  }

  reviewFilterSort = () => {
    const options = [...t('trails/sortOptions').split('|'), t('common/cancel')]

    ActionSheet.show(
      {
        title: t('common/chooseYourOption'),
        cancelButtonIndex: 3,
        tintColor: theme.secondaryColor,
        options,
      },
      index => {
        if (index === 3) return
        this.setState({ reviewSort: index })
      }
    )
  }

  reviewFilterShow = () => {
    const options = [
      t('trails/showOptions'),
      5 + t('trails/stars'),
      4 + t('trails/stars'),
      3 + t('trails/stars'),
      2 + t('trails/stars'),
      1 + t('trails/star'),
      t('common/cancel'),
    ]

    ActionSheet.show(
      {
        title: t('common/chooseYourOption'),
        cancelButtonIndex: 6,
        tintColor: theme.secondaryColor,
        options,
      },
      index => {
        if (index === 6) return
        this.setState({ reviewShow: index })
      }
    )
  }

  renderReviews = (data, props, title) => {
    const { reviewSort, reviewShow } = this.state
    const rating = rate(data)
    const { id } = props.user.user

    // let reviews = props.reviews.collection //.filter(item => item.user.id !== id)
    const ownerReview = data.filter(item => item.author.id === id)
    const ownerItem = ownerReview ? ownerReview[0] : null

    const reviewShowOptions = [
      t('trails/showOptions'),
      5 + t('trails/stars'),
      4 + t('trails/stars'),
      3 + t('trails/stars'),
      2 + t('trails/stars'),
      1 + t('trails/star'),
    ]

    const reviewSortOptions = t('trails/sortOptions').split('|')

    const reviewSortText = reviewSortOptions[reviewSort]
    const reviewShowText = reviewShowOptions[reviewShow]
    const {
      id: trailId,
      userHasReview = false,
      ratingAverage,
    } = this.props.navigation.state.params

    return (
      <View style={styles.wrapperReview}>
        <ScrollView style={styles.wrapperReview}>
          {!userHasReview && (
            <View style={styles.reviewRow}>
              <TouchableOpacity
                activeOpacity={0.7}
                style={[styles.button, styles.buttonReview]}
                onPress={() => createNew(title, this.props.navigation)}
              >
                <IconImage style={styles.plusIcon} source="plusIcon" />
                <Text
                  type="title"
                  weight="bold"
                  style={styles.buttonText}
                  message="trails/writeReviewCaps"
                />
              </TouchableOpacity>
            </View>
          )}

          {ownerReview.length ? (
            <View style={styles.reviewRow}>
              <View
                style={[styles.item, styles.spacing, addBorder(reviews)]}
                key={ownerItem.id}
              >
                <ArrowBottomButtonComponent
                  onPress={() =>
                    this.showReviewActionSheet(
                      ownerItem,
                      ownerItem.user.id === id
                    )
                  }
                  style={styles.reviewOptions}
                  wrapperStyle={styles.reviewOptionsWrapper}
                />

                <View style={{ flexDirection: 'row' }}>
                  <StarRating
                    rate={ownerItem.rating}
                    starWidth={18}
                    starHeight={18}
                  />
                  {ownerItem.user.id === id ? (
                    <Text style={styles.owner} message="trails/author" />
                  ) : null}
                </View>

                <Text
                  message="trails/pictureBy"
                  style={styles.by}
                  values={{
                    user: (
                      <Text
                        weight="bold"
                        style={styles.bold}
                        text={ownerItem.user.name}
                      />
                    ),
                    date: moment.unix(ownerItem.date_created).format('LL'),
                  }}
                />

                <View style={styles.byUserName}>
                  <Text
                    style={styles.by}
                    message="trails/pictureBy"
                    values={{
                      user: (
                        <Text
                          weight="bold"
                          onPress={() =>
                            this.navigateToProfile(ownerItem.user.id)
                          }
                          style={styles.bold}
                          text={ownerItem.user.name}
                        />
                      ),
                      date: moment.unix(ownerItem.dateLastUpdated).format('LL'),
                    }}
                  />
                </View>

                <View style={styles.reviewWrapper}>
                  <Text style={styles.review} text={ownerItem.body} />
                </View>
              </View>
            </View>
          ) : null}

          <View style={styles.reviewRow}>
            <TouchableOpacity
              onPress={this.reviewFilterSort}
              activeOpacity={0.7}
              style={styles.filterButton}
            >
              <Text
                weight="bold"
                style={styles.filterButtonLabel}
                message="trails/sortBy"
              />

              <View style={styles.inline}>
                <Text
                  weight="bold"
                  style={styles.filterButtonValue}
                  text={reviewSortText}
                />
                <IconImage source="nextIcon" style={styles.arrowOptionReview} />
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={this.reviewFilterShow}
              activeOpacity={0.7}
              style={styles.filterButton}
            >
              <Text
                weight="bold"
                style={styles.filterButtonLabel}
                message="common/show"
              />

              <View style={styles.inline}>
                <Text
                  weight="bold"
                  style={styles.filterButtonValue}
                  text={reviewShowText}
                />
                <IconImage source="nextIcon" style={styles.arrowOptionReview} />
              </View>
            </TouchableOpacity>
          </View>

          <Query query={GET_TRAIL_REVIEWS} variables={{ trailId }}>
            {({ loading, error, data }) => {
              if (loading) return <Loading type="spinner" />
              // if (error) return `Error! ${error.message}`;
              const rv = data.trailReviews
              let reviews = rv.collection
              const nr_of_reviews = rv.collection.length + rv.pageInfo.remaining
              // FIlters
              if (reviewSort == 1) {
                reviews = reviews.sort((a, b) => b.rating - a.rating)
              }

              if (reviewSort == 2) {
                reviews = reviews.sort((a, b) => a.rating - b.rating)
              }

              if (reviewShow !== 0) {
                const realRating = 6 - reviewShow
                reviews = reviews.filter(review => review.rating === realRating)
              }

              return (
                <View style={styles.reviewRow}>
                  <View style={[styles.head, styles.spacing, styles.item]}>
                    <View style={styles.inline}>
                      <StarRating
                        rate={ratingAverage}
                        starWidth={24}
                        starHeight={24}
                      />
                      <Text
                        style={styles.reviewText}
                        text={`${nr_of_reviews} ${t('trails/seeMoreReviews')}`}
                      />
                    </View>

                    <View style={styles.reviewTotal}>
                      <Text
                        style={styles.reviewOutTotal}
                        message="trails/seeMoreStarsOut"
                        values={{ rating: Math.round(ratingAverage) }}
                      />
                    </View>
                  </View>

                  {reviews.length === 0 && (
                    <Text
                      style={styles.noOthers}
                      message="trails/noOtherReviews"
                    />
                  )}

                  {reviews.length > 0 &&
                    reviews.map((item, i) => (
                      <View
                        key={i}
                        style={[
                          styles.item,
                          styles.spacing,
                          addBorder(reviews),
                        ]}
                      >
                        <ArrowBottomButtonComponent
                          onPress={() =>
                            this.showReviewActionSheet(
                              item,
                              item.author.id === id
                            )
                          }
                          style={styles.reviewOptions}
                          wrapperStyle={styles.reviewOptionsWrapper}
                        />

                        <View style={{ flexDirection: 'row' }}>
                          <StarRating
                            rate={item.rating}
                            starWidth={18}
                            starHeight={18}
                          />
                          {item.author.id === id ? (
                            <Text
                              style={styles.owner}
                              message="trails/author"
                            />
                          ) : null}
                        </View>

                        <Text
                          message="trails/pictureBy"
                          style={styles.by}
                          values={{
                            user: (
                              <Text
                                weight="bold"
                                style={styles.bold}
                                text={item.author.name}
                              />
                            ),
                            date: moment.unix(item.dateCreated).format('LL'),
                          }}
                        />

                        <View style={styles.reviewWrapper}>
                          <Text style={styles.review} text={item.body} />
                        </View>
                      </View>
                    ))}
                </View>
              )
            }}
          </Query>

          <View style={styles.spacer} />
        </ScrollView>
      </View>
    )
  }

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

  renderPois = (data, props, title) => {
    const { id, account } = props.user.user
    const unitSystem = account.preferences.unitSystem
    const distanceUnit = unitSystem === 'IMPERIAL' ? 'Mi' : 'Km'

    return (
      <ScrollView style={styles.wrapper}>
        {data.map((item, i) => (
          <View style={[styles.item, addBorder(data)]} key={item.id}>
            <ArrowBottomButtonComponent
              onPress={() =>
                this.showPoiActionSheet(item.poi, item.poi.user.id === id)
              }
              style={styles.reviewOptions}
              wrapperStyle={styles.reviewOptionsWrapper}
            />

            <View style={[styles.head, styles.spacing]}>
              <Text
                type="title"
                weight="bold"
                style={styles.title}
                text={`${poiLabels[item.poi.type]} ${t('at')} ${
                  item.distance_from_start
                }${t('trails/distanceFromStart', { unit: distanceUnit })}`}
              />

              <Text
                message="trails/pictureBy"
                style={styles.by}
                values={{
                  user: (
                    <Text
                      weight="bold"
                      style={styles.bold}
                      text={item.poi.user.name}
                    />
                  ),
                  date: moment(item.poi.date_created).format('LL'),
                }}
              />
            </View>

            <View style={[styles.content, styles.spacing]}>
              <Image source={icons[item.poi.type]} style={styles.poiIcon} />
              {item.poi.description.length ? (
                <Text style={styles.description} text={item.poi.description} />
              ) : null}
            </View>

            <View style={styles.map}>
              <TrailMarker type={item.poi.type} coords={item.poi.location} />
            </View>
          </View>
        ))}

        <View>
          <TouchableOpacity
            activeOpacity={0.7}
            style={styles.button}
            onPress={() => createNew(title, this.props.navigation)}
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
    )
  }

  renderRides = (data, props, title) => {
    return (
      <ScrollView style={[styles.wrapper, styles.spacing, { paddingTop: 20 }]}>
        <View style={styles.rideList}>
          <View style={styles.rideRow}>
            <View>
              <Image style={styles.horseImage} source={{ uri: url }} />
            </View>

            <View>
              <Text weight="bold" style={styles.rideTimer} text="00:00:00" />
              <Text
                type="title"
                weight="bold"
                style={styles.rideLabel}
                message="trails/duration"
              />
            </View>

            <View style={styles.rideDate}>
              <Text style={styles.rideDateText} text="Wed, 22 Jul 2017" />
            </View>
          </View>

          <View style={styles.rideRow}>
            <View>
              <Image style={styles.horseImage} source={{ uri: url }} />
            </View>

            <View>
              <Text weight="bold" style={styles.rideTimer} text="00:00:00" />
              <Text
                type="title"
                weight="bold"
                style={styles.rideLabel}
                message="trails/duration"
              />
            </View>

            <View style={styles.rideDate}>
              <Text style={styles.rideDateText} text="Wed, 22 Jul 2017" />
            </View>
          </View>

          <View style={styles.rideRow}>
            <View>
              <Image style={styles.horseImage} source={{ uri: url }} />
            </View>

            <View>
              <Text weight="bold" style={styles.rideTimer} text="00:00:00" />
              <Text
                type="title"
                weight="bold"
                style={styles.rideLabel}
                message="trails/duration"
              />
            </View>

            <View style={styles.rideDate}>
              <Text style={styles.rideDateText} text="Wed, 22 Jul 2017" />
            </View>
          </View>
        </View>

        <View>
          <TouchableOpacity
            activeOpacity={0.7}
            style={styles.button}
            onPress={() => createNew(title)}
          >
            <IconImage style={styles.rideIcon} source="rideHorseIcon" />
            <Text
              type="title"
              weight="bold"
              style={styles.buttonText}
              message="trails/seeMoreNewRide"
            />
          </TouchableOpacity>
        </View>
      </ScrollView>
    )
  }

  empty() {
    return <Text message="trails/nothingHere" />
  }

  render() {
    const { title, props } = this.props.navigation.state.params
    const { trailReviews, trailPois, trailRides } = this.props.trails

    let data = null

    if (isReview(title)) data = trailReviews
    if (isPoi(title)) data = trailPois
    if (isRides(title)) data = trailRides

    const scene = {
      [t('trails/seeMoreReviews')]: this.renderReviews,
      [t('trails/seeMoreNearby')]: this.renderPois,
      [t('trails/seeMoreHistory')]: this.renderRides,
    }

    if (!scene[title] || !data) return this.empty()

    return scene[title](data, props, title)
  }
}

const styles = {
  wrapper: {
    flex: 1,
    backgroundColor: 'white',
  },
  wrapperReview: {
    flex: 1,
    backgroundColor: '#eaeaea',
    borderBottomWidth: 1,
    borderColor: '#e7e7e7',
  },
  reviewRow: {
    backgroundColor: 'white',
    marginBottom: 20,
  },
  reviewText: {
    alignSelf: 'center',
    marginLeft: 5,
    color: '#555',
  },
  reviewTotal: {
    marginTop: 10,
  },
  reviewOutTotal: {
    color: '#555',
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
  buttonReview: {
    marginTop: 15,
    marginBottom: 15,
  },
  buttonText: {
    fontSize: theme.font.sizes.small,
    alignSelf: 'center',
    color: theme.secondaryColor,
  },
  item: {
    marginBottom: 0,
    borderBottomWidth: 0.8,
    borderColor: '#ddd',
    paddingVertical: 15,
  },
  noBorder: {
    borderColor: 'white',
  },
  reviewWrapper: {
    marginTop: 10,
  },
  review: {
    paddingTop: 10,
    lineHeight: 20,
    color: '#7c7c7c',
    textAlign: 'justify',
  },
  spacing: {
    paddingHorizontal: theme.paddingHorizontal,
  },
  head: {
    marginBottom: 10,
  },
  inline: {
    flexDirection: 'row',
  },
  title: {
    fontSize: 16,
    color: '#565656',
  },
  by: {
    color: '#959595',
    marginTop: 5,
  },
  bold: {
    color: theme.secondaryColor,
  },
  content: {
    marginTop: 5,
  },
  poiIcon: {
    width: 50,
    height: 50,
    resizeMode: 'contain',
    alignSelf: 'center',
    marginVertical: 10,
  },
  description: {
    marginTop: 10,
    fontSize: theme.font.sizes.smallVariation,
    lineHeight: 22,
    color: '#757575',
  },
  map: {
    position: 'relative',
    marginTop: 20,
    marginBottom: 10,
  },
  mapOverlay: {
    width: '100%',
    height: 200,
    position: 'absolute',
    zIndex: 10,
  },
  paginationWrapper: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
    bottom: 25,
    left: 0,
    right: 0,
  },
  pagination: {
    borderRadius: 4,
    backgroundColor: 'rgba(255,255,255,.15)',
    padding: 5,
    paddingHorizontal: 12,
  },
  rideList: {
    marginTop: 0,
  },
  rideRow: {
    flexDirection: 'row',
    marginTop: 15,
  },
  horseImage: {
    marginRight: 15,
    width: 40,
    height: 40,
    borderRadius: 3,
  },
  rideDate: {
    flex: 1,
  },
  rideDateText: {
    alignSelf: 'flex-end',
    color: '#555',
    fontSize: theme.font.sizes.defaultPlus,
    marginTop: -5,
  },
  rideTimer: {
    fontSize: 22,
    color: theme.secondaryColor,
    lineHeight: 0,
    marginTop: -5,
  },
  rideLabel: {
    color: 'silver',
    fontSize: theme.font.sizes.smallest,
  },
  rideIcon: {
    width: 24,
    height: 25,
    resizeMode: 'contain',
    marginRight: 10,
    tintColor: theme.secondaryColor,
  },
  reviewOptionsWrapper: {
    position: 'absolute',
    zIndex: 100,
    top: 20,
    right: 0,
    width: 28,
    height: 28,
    padding: 10,
    paddingRight: 30,
    alignItems: 'flex-end',
    flexDirection: 'row',
  },
  reviewOptions: {
    width: 18,
    height: 18,
    resizeMode: 'contain',
  },
  owner: {
    fontSize: theme.font.sizes.smallest,
    color: 'silver',
    marginLeft: 4,
    marginTop: 3,
  },
  spacer: {
    height: 50,
    width: '100%',
  },
  filterButton: {
    padding: 15,
    borderBottomWidth: 1,
    borderColor: '#ccc',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  filterButtonLabel: {
    fontSize: theme.font.sizes.smallVariation,
    color: '#7d7d7d',
  },
  filterButtonValue: {
    fontSize: theme.font.sizes.smallVariation,
    color: '#b6b6b7',
  },
  arrowOptionReview: {
    width: 10,
    height: 16,
    resizeMode: 'contain',
    marginLeft: 10,
  },
  noOthers: {
    fontSize: theme.font.sizes.smallVariation,
    color: '#888',
    padding: 15,
  },
}

export default connect(
  state => ({
    user: state.user.user,
    trails: state.trails,
  }),
  dispatch => ({
    actions: bindActionCreators(
      {
        ...trailActions,
        ...poiActions,
      },
      dispatch
    ),
  })
)(SeeMore)
