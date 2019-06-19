import React, { PureComponent } from 'react'
import { Image, View, StyleSheet, Dimensions } from 'react-native'

import Text from '@components/Text'
const { width, height } = Dimensions.get('screen')

const TRAIL_IMAGES = {
  discover: require('@images/trails.png'),
  created: require('@images/gift_box.png'),
  favorites: require('@images/heart_circle.png'),
}

class EmptyTrails extends PureComponent {
  static defaultProps = {
    type: 'discover',
  }

  render() {
    const type = `${this.props.type[0].toUpperCase()}${this.props.type.slice(
      1
    )}`

    if (this.props.isSearch === true) {
      return (
        <View style={styles.container}>
          <Text
            message={'trails/noTrailSearch'}
            style={[styles.text, styles.noTrailText]}
          />

          <Text
            message={'trails/noTrailSearchInfo'}
            values={{
              query:
                this.props.query && this.props.query.text
                  ? this.props.query.text.substring(
                      0,
                      this.props.query.text.length - 1
                    )
                  : '',
            }}
            style={styles.text}
          />
          <Text
            message={'trails/noTrailSearchSuggestion'}
            style={styles.text}
          />
          <Text
            message={'trails/noTrailSearchSuggestionInfo'}
            style={styles.text}
          />
        </View>
      )
    }

    return (
      <View style={styles.container}>
        <Image source={TRAIL_IMAGES[this.props.type]} style={styles.image} />

        <Text
          message={`trails/noTrail${type}`}
          style={[styles.text, styles.noTrailText]}
        />

        <Text message={`trails/noTrail${type}Info`} style={styles.text} />
      </View>
    )
  }
}

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    width,
    height: (height / 3) * 2,
  },
  image: {
    marginVertical: 20,
    width: 120,
    height: 120,
    resizeMode: 'contain',
  },
  text: {
    textAlign: 'center',
  },
  noTrailText: {
    fontSize: 17,
    color: 'black',
    marginBottom: 5,
  },
})

export default EmptyTrails
