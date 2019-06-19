import React, { Component } from 'react'
import { connect } from 'react-redux'
import { ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native'

import AnimatedTextInput from '@components/AnimatedTextInput'
import KeyboardSpacer from '@components/KeyboardSpacer'
import HeaderTitle from '@components/HeaderTitle'
import { editReview } from '@actions/trails'
import t from '@config/i18n'
import Text from '@components/Text'
import StarRating from '@components/StarRating'
import { theme } from '@styles/theme'
import { IconImage } from '@components/Icons'

class EditReview extends Component {
  static navigationOptions = ({ navigation }) => ({
    headerTitle: <HeaderTitle title={'review/editReviewTitle'} />,
    tabBarIcon: ({ tintColor }) => (
      <IconImage source="trailsIcon" style={[theme.icon, { tintColor }]} />
    ),
    headerLeft: (
      <TouchableOpacity onPress={() => navigation.goBack(null)}>
        <Text
          type="title"
          weight="semiBold"
          style={styles.cancelButton}
          message="common/cancel"
        />
      </TouchableOpacity>
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
    rating: 0,
    id: null,
    trailId: null,
  }

  componentDidMount() {
    const {
      id,
      body: review,
      rating,
      trailId,
    } = this.props.navigation.state.params.review

    this.setState({
      review,
      rating,
      id,
      trailId,
    })

    this.props.navigation.setParams({ handleSave: this.handleSave })
  }

  handleSave = () => {
    const { review, rating, id, trailId } = this.state
    console.log('trailId', trailId)
    this.props.save(review, rating, id, trailId)

    this.props.navigation.goBack(null)
  }

  render() {
    const { review, rating } = this.state

    const reviewThisTrail = t('review/reviewThisTrail')
    const starText = t('review/star')
    const starsText = t('review/stars')
    const unratedText = t('review/unrated')
    const writeReviewText = t('review/writeReview')

    const starOrStars = rating > 1 ? starsText : starText
    const rateText = rating === 0 ? unratedText : `${rating} ${starOrStars}`

    return (
      <View style={styles.container}>
        <ScrollView style={styles.wrapper} ref="scrollView">
          <View style={[styles.row, styles.center]}>
            <Text
              type="title"
              weight="semiBold"
              style={styles.title}
              message={reviewThisTrail}
            />

            <StarRating
              maxRate={5}
              rate={rating}
              readOnly={false}
              starWidth={25}
              starHeight={25}
              spacing={15}
              onRateChange={rating => this.setState({ rating })}
            />

            <Text
              type="title"
              weight="semiBold"
              style={styles.rate}
              message={rateText}
            />
          </View>

          <View style={styles.border}>
            <AnimatedTextInput
              placeholder={writeReviewText}
              onChangeText={review => this.setState({ review })}
              value={review}
              defaultMultiLineHeight={100}
              multiLine={true}
              inputContainerStyle={styles.inputContainer}
              onFocus={() =>
                this.refs.scrollView.scrollToEnd({ animated: true })
              }
            />
          </View>
        </ScrollView>

        <KeyboardSpacer />
      </View>
    )
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
    paddingTop: 20,
  },
  wrapper: {
    flex: 1,
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
  cancelButton: {
    fontSize: 16,
    color: 'white',
    marginLeft: 10,
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
    save: (description, rating, reviewId, trailId) =>
      dispatch(editReview(description, rating, reviewId, trailId)),
  })
)(EditReview)
