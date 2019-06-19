import React, { PureComponent } from 'react'
import {
  ImageBackground,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native'

import Text from '@components/Text'

const IMAGE_SIZE = 85

class Horse extends PureComponent {
  onSelectHorse = () => this.props.onSelectHorse(this.props.horse)

  render() {
    const { horse, archived, style, selectedHorse } = this.props

    const image = horse.profile_picture
      ? { uri: `${horse.profile_picture.url}?t=300x300,fill` }
      : require('@images/horse_placeholder.png')

    return (
      <TouchableOpacity onPress={this.onSelectHorse} style={styles.container}>
        <ImageBackground
          source={image}
          style={styles.imageSize}
          imageStyle={[styles.image, style]}
        >
          {archived && (
            <View style={styles.archivedContainer}>
              <Text
                type="title"
                style={styles.archived}
                message="horses/archived"
              />
            </View>
          )}
        </ImageBackground>

        {selectedHorse && <View style={styles.selectedHorse} />}

        <Text
          type="title"
          weight="bold"
          numberOfLines={2}
          style={styles.name}
          text={horse.name}
        />
      </TouchableOpacity>
    )
  }
}

const styles = StyleSheet.create({
  container: {
    width: IMAGE_SIZE + 5,
  },
  imageSize: {
    width: IMAGE_SIZE,
    height: IMAGE_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  image: {
    resizeMode: 'cover',
    alignItems: 'center',
    justifyContent: 'center',
  },
  archivedContainer: {
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    width: IMAGE_SIZE - 10,
    height: IMAGE_SIZE - 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  archived: {
    color: 'white',
    backgroundColor: 'transparent',
  },
  name: {
    textAlign: 'center',
    marginTop: 5,
    height: 40,
    color: '#595959',
  },
  selectedHorse: {
    position: 'absolute',
    width: IMAGE_SIZE,
    marginTop: IMAGE_SIZE + 5,
    borderBottomWidth: 1,
    borderBottomColor: 'grey',
  },
})

export default Horse
