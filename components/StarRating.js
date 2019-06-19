/*
  <StarRating
    readOnly={false}
    maxRate={5}
    rate={5}
    starWidth={18}
    starHeight={18}
    onRateChange={state => this.setState({ state }) />
*/

import React, { Component } from 'react'
import { Image, StyleSheet, TouchableOpacity, View } from 'react-native'

const noop = () => {}

const Star = ({
  width,
  height,
  spacing,
  isLast,
  readOnly,
  onPress,
  type = 'normal',
}) => {
  const press = readOnly ? noop : onPress ? onPress : noop

  const starIcon = require('@images/icons/star.png')
  const style = { width, height }
  const activeStyle = type === 'active' ? styles.active : {}
  const spacingStyle = isLast ? {} : { marginRight: spacing }

  return (
    <TouchableOpacity activeOpacity={readOnly ? 1 : 0.7} onPress={press}>
      <Image style={[style, spacingStyle, activeStyle]} source={starIcon} />
    </TouchableOpacity>
  )
}

class StarRating extends Component {
  static defaultProps = {
    rate: 5,
    style: {},
    spacing: 4,
    maxRate: 5,
    readOnly: true,
    starWidth: 12,
    starHeight: 12,
    onRateChange: () => {},
  }

  static getDerivedStateFromProps(props, state) {
    if (props.rate !== state.rate) {
      return { rate: props.rate }
    }
    return null
  }

  state = { rate: 0 }

  // componentDidMount() {
  //   this.setState({ rate: this.props.rate })
  // }

  changeRate = newRate => {
    const currentRate = this.state.rate
    let rate = newRate

    if (newRate <= currentRate) {
      rate = rate - 1
    }

    this.setState({ rate })
    this.props.onRateChange(rate)
  }

  generateStars = (props, rate) => {
    const {
      maxRate,
      readOnly,
      starWidth: width,
      starHeight: height,
      spacing,
    } = props
    let stars = []

    Array(maxRate)
      .fill(null)
      .map((v, i) => {
        stars.push(
          <Star
            type={rate >= i + 1 ? 'active' : 'normal'}
            readOnly={readOnly}
            onPress={() => this.changeRate(i + 1)}
            key={'rs-' + i}
            width={width}
            spacing={spacing}
            isLast={maxRate === i + 1}
            height={height}
          />
        )
      })

    return stars
  }

  render() {
    const stars = this.generateStars(this.props, this.state.rate)

    return <View style={[styles.wrapper, this.props.style]}>{stars}</View>
  }
}

const styles = StyleSheet.create({
  wrapper: {
    flexDirection: 'row',
  },
  active: {
    tintColor: '#ffcd00',
  },
})

export default StarRating
