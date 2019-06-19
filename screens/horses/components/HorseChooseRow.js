import React, { PureComponent } from 'react'
import { Image, StyleSheet, TouchableOpacity, View } from 'react-native'
import { IconImage } from '@components/Icons'
import Text from '@components/Text'

class HorseChooseRow extends PureComponent {
  handlePressHorse = () => this.props.onPress(this.props)

  render() {
    const { name, picture, selectedHorse, id } = this.props

    const image = picture
      ? { uri: picture.url }
      : require('../../../images/default_horse.png')

    return (
      <View style={styles.container}>
        <TouchableOpacity
          style={styles.innerContainer}
          onPress={this.handlePressHorse}
        >
          {!!selectedHorse && (
            <View style={{ width: 25 }}>
              {!!selectedHorse && selectedHorse.id === id && (
                <IconImage
                  source="checkIcon"
                  style={styles.check}
                  fill="green"
                />
              )}
            </View>
          )}
          <Image source={image} style={styles.image} />

          <View style={styles.infoContainer}>
            <Text
              type="title"
              weight="bold"
              style={styles.name}
              text={name}
              numberOfLines={2}
            />
          </View>
        </TouchableOpacity>
      </View>
    )
  }
}

const styles = StyleSheet.create({
  container: {
    borderTopWidth: 1,
    borderTopColor: '#EEE',
    marginTop: 10,
    paddingTop: 10,
  },
  innerContainer: {
    flexDirection: 'row',
    marginHorizontal: 15,
    alignItems: 'center',
  },
  image: {
    width: 50,
    height: 50,
    resizeMode: 'contain',
  },
  check: {
    width: 20,
    height: 20,
  },
  infoContainer: {
    flex: 1,
    flexDirection: 'column',
    marginHorizontal: 15,
  },
  name: {
    fontSize: 16,
    color: '#595959',
  },
})

export default HorseChooseRow
