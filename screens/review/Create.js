import React, { PureComponent } from 'react'
import { connect } from 'react-redux'
import {
  Image,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native'

import AnimatedTextInput from '@components/AnimatedTextInput'
import HeaderTitle from '@components/HeaderTitle'
import { createReview } from '@actions/trails'

import t from '@config/i18n'
import StarRating from '@components/StarRating'
import Text from '@components/Text'
import { theme } from '@styles/theme'
import { IconImage } from '@components/Icons'

class CreateReview extends PureComponent {
  static navigationOptions = ({ navigation }) => ({
    headerTitle: <HeaderTitle title={'review/addReviewTitle'} />,
    tabBarIcon: ({ tintColor }) => (
      <IconImage source="trailsIcon" style={[theme.icon, { tintColor }]} />
    ),
    headerRight: (
      <TouchableOpacity
        onPress={navigation.state.params && navigation.state.params.handleSave}
      >
        <Text
          type="title"
          weight="semiBold"
          style={styles.saveButton}
          message="common/done"
        />
      </TouchableOpacity>
    ),
  })

  state = {
    review: '',
    reviewRating: 0,
  }

  componentDidMount() {
    this.props.navigation.setParams({ handleSave: this.handleSave })
  }

  handleSave = () => {
    this.props.save(
      this.state.review,
      this.state.reviewRating,
      this.props.navigation.state.params.data.id,
      this.props.navigation.state.params.data.id
    )
    if (this.props.navigation.state.params.data.callback) {
      this.props.navigation.state.params.data.callback()
    }
    this.props.navigation.goBack(null)
  }

  render() {
    const { review, reviewRating } = this.state
    const { reviews } = this.props.navigation.state.params.data

    const firstToReview = t('review/firstToReview')
    const reviewThisTrail = t('review/reviewThisTrail')
    const starText = t('review/star')
    const starsText = t('review/stars')
    const unratedText = t('review/unrated')
    const writeReviewText = t('review/writeReview')

    const title = reviews === 0 ? firstToReview : reviewThisTrail

    const starOrStars = reviewRating > 1 ? starsText : starText
    const rateText =
      reviewRating === 0 ? unratedText : `${reviewRating} ${starOrStars}`

    return (
      <ScrollView style={styles.wrapper}>
        <View style={[styles.row, styles.center]}>
          <Text
            type="title"
            weight="semiBold"
            style={styles.title}
            text={title}
          />

          <StarRating
            maxRate={5}
            rate={reviewRating}
            readOnly={false}
            starWidth={25}
            starHeight={25}
            spacing={15}
            onRateChange={reviewRating => this.setState({ reviewRating })}
          />

          <Text
            type="title"
            weight="semiBold"
            style={styles.rate}
            text={rateText}
          />
        </View>

        <View style={styles.border}>
          <AnimatedTextInput
            placeholder={writeReviewText}
            onChangeText={review => this.setState({ review })}
            value={review}
            multiLine={true}
            defaultMultiLineHeight={100}
            inputContainerStyle={styles.inputContainer}
          />
        </View>
      </ScrollView>
    )
  }
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    paddingTop: 20,
    backgroundColor: 'white',
  },
  row: {
    marginBottom: 10,
    paddingHorizontal: theme.paddingHorizontal,
  },
  saveButton: {
    fontSize: 16,
    color: 'white',
    marginRight: 10,
  },
  inputContainer: {
    borderTopWidth: 0,
    borderBottomWidth: 0,
  },
  border: {
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#ddd',
    paddingBottom: 10,
  },
  center: {
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 18,
    marginBottom: 20,
    color: theme.fontColor,
  },
  rate: {
    fontSize: theme.font.sizes.smallest,
    marginTop: 14,
    letterSpacing: 2,
    color: '#999',
  },
})

export default connect(
  null,
  dispatch => ({
    save: (description, rating, id, trailId) =>
      dispatch(createReview(description, rating, id, trailId)),
  })
)(CreateReview)
